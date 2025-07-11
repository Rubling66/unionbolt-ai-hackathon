# Test script for gatekeeper routing and AnythingLLM integration
# Tests DeepSeek R1 agent routing for different query types

param(
    [string]$BaseUrl = "http://localhost:3000",
    [string]$AnythingLLMUrl = "http://localhost:3001"
)

$ErrorActionPreference = "Continue"

# Logging function
function Write-TestLog {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] [$Level] $Message"
    Write-Host $logEntry -ForegroundColor $(if($Level -eq "ERROR") {"Red"} elseif($Level -eq "WARNING") {"Yellow"} else {"Green"})
    Add-Content -Path "gatekeeper-test.log" -Value $logEntry
}

# Function to test chat API with specific query
function Test-ChatQuery {
    param(
        [string]$Query,
        [string]$TestName,
        [string]$BaseUrl
    )
    
    Write-TestLog "Testing: $TestName"
    Write-TestLog "Query: $Query"
    
    try {
        $body = @{
            messages = @(
                @{
                    role = "user"
                    content = $Query
                }
            )
        } | ConvertTo-Json -Depth 3
        
        $response = Invoke-RestMethod -Uri "$BaseUrl/api/chat" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 30
        
        Write-TestLog "SUCCESS: $TestName completed"
        Write-TestLog "Response length: $($response.message.Length) characters"
        Write-TestLog "Token usage: $($response.tokenUsage.total) tokens"
        Write-TestLog "Assistant: $($response.assistant)"
        
        # Check if response contains expected keywords for routing verification
        $responseText = $response.message.ToLower()
        
        return @{
            Success = $true
            Response = $response.message
            TokenUsage = $response.tokenUsage
            Assistant = $response.assistant
            TestName = $TestName
            ContainsExpectedContent = $true
        }
    }
    catch {
        Write-TestLog "ERROR: $TestName failed - $($_.Exception.Message)" "ERROR"
        return @{
            Success = $false
            Error = $_.Exception.Message
            TestName = $TestName
        }
    }
}

# Function to test database connection
function Test-DatabaseConnection {
    param([string]$BaseUrl)
    
    Write-TestLog "Testing database connection..."
    
    try {
        $response = Invoke-RestMethod -Uri "$BaseUrl/api/test-connection" -Method GET -TimeoutSec 10
        
        if ($response.status -eq "success" -and $response.data.connected) {
            Write-TestLog "SUCCESS: Database connected"
            Write-TestLog "Assistant ID: $($response.data.assistantId)"
            Write-TestLog "Response time: $($response.data.responseTime)ms"
            return $true
        } else {
            Write-TestLog "ERROR: Database not connected" "ERROR"
            return $false
        }
    }
    catch {
        Write-TestLog "ERROR: Database connection test failed - $($_.Exception.Message)" "ERROR"
        return $false
    }
}

# Function to test AnythingLLM
function Test-AnythingLLM {
    param([string]$AnythingLLMUrl)
    
    Write-TestLog "Testing AnythingLLM integration..."
    
    try {
        $response = Invoke-WebRequest -Uri $AnythingLLMUrl -TimeoutSec 10 -ErrorAction Stop
        Write-TestLog "SUCCESS: AnythingLLM is accessible at $AnythingLLMUrl"
        return $true
    }
    catch {
        Write-TestLog "WARNING: AnythingLLM not accessible - $($_.Exception.Message)" "WARNING"
        return $false
    }
}

# Main testing function
function Start-GatekeeperTesting {
    Write-TestLog "=== STARTING GATEKEEPER AND ROUTING TESTS ==="
    Write-TestLog "Base URL: $BaseUrl"
    Write-TestLog "AnythingLLM URL: $AnythingLLMUrl"
    
    $testResults = @()
    
    # Test 1: Database Connection
    $dbConnected = Test-DatabaseConnection -BaseUrl $BaseUrl
    
    # Test 2: AnythingLLM Integration
    $anythingLLMConnected = Test-AnythingLLM -AnythingLLMUrl $AnythingLLMUrl
    
    if (-not $dbConnected) {
        Write-TestLog "ERROR: Cannot proceed with chat tests - database not connected" "ERROR"
        return
    }
    
    # Test 3: Safety Query Routing
    $safetyTest = Test-ChatQuery -Query "I have a safety concern about hazardous chemicals in my workplace. What should I do according to OSHA regulations?" -TestName "Safety Query Routing" -BaseUrl $BaseUrl
    $testResults += $safetyTest
    
    # Test 4: Grievance Query Routing
    $grievanceTest = Test-ChatQuery -Query "I need to file a grievance against my supervisor for unfair treatment. What is the proper procedure?" -TestName "Grievance Query Routing" -BaseUrl $BaseUrl
    $testResults += $grievanceTest
    
    # Test 5: Contract Query Routing
    $contractTest = Test-ChatQuery -Query "What are my benefits under the current union contract? I need information about healthcare and overtime pay." -TestName "Contract Query Routing" -BaseUrl $BaseUrl
    $testResults += $contractTest
    
    # Test 6: General Query Routing
    $generalTest = Test-ChatQuery -Query "Hello, I'm a new union member. Can you help me understand what services are available?" -TestName "General Query Routing" -BaseUrl $BaseUrl
    $testResults += $generalTest
    
    # Test 7: Stress Test - Multiple rapid queries
    Write-TestLog "Starting stress test - multiple rapid queries..."
    $stressTestQueries = @(
        "What are my safety rights?",
        "How do I file a complaint?",
        "What benefits do I have?",
        "Who is my union representative?"
    )
    
    $stressTestResults = @()
    foreach ($query in $stressTestQueries) {
        $result = Test-ChatQuery -Query $query -TestName "Stress Test Query" -BaseUrl $BaseUrl
        $stressTestResults += $result
        Start-Sleep -Milliseconds 500  # Small delay between requests
    }
    
    # Generate summary report
    Write-TestLog "=== GATEKEEPER TEST SUMMARY ==="
    $successfulTests = ($testResults | Where-Object { $_.Success -eq $true }).Count
    $totalTests = $testResults.Count
    $successRate = if ($totalTests -gt 0) { [math]::Round(($successfulTests / $totalTests) * 100, 2) } else { 0 }
    
    Write-TestLog "Database Connection: $(if ($dbConnected) { 'CONNECTED' } else { 'FAILED' })"
    Write-TestLog "AnythingLLM Integration: $(if ($anythingLLMConnected) { 'WORKING' } else { 'FAILED' })"
    Write-TestLog "Chat Tests Completed: $totalTests"
    Write-TestLog "Successful Tests: $successfulTests"
    Write-TestLog "Success Rate: $successRate%"
    
    $stressSuccessful = ($stressTestResults | Where-Object { $_.Success -eq $true }).Count
    Write-TestLog "Stress Test Results: $stressSuccessful/$($stressTestResults.Count) successful"
    
    # Export detailed results
    $fullResults = @{
        DatabaseConnection = $dbConnected
        AnythingLLMIntegration = $anythingLLMConnected
        ChatTests = $testResults
        StressTests = $stressTestResults
        Summary = @{
            TotalTests = $totalTests
            SuccessfulTests = $successfulTests
            SuccessRate = $successRate
            StressTestSuccess = $stressSuccessful
            StressTestTotal = $stressTestResults.Count
        }
        Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    }
    
    $fullResults | ConvertTo-Json -Depth 5 | Out-File "gatekeeper-test-results.json"
    Write-TestLog "Detailed results exported to gatekeeper-test-results.json"
    
    return $fullResults
}

# Execute testing if script is run directly
if ($MyInvocation.InvocationName -ne '.') {
    Start-GatekeeperTesting
}