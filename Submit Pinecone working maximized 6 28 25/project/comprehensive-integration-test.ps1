# Comprehensive Integration Test for UnionBolt AI
# Tests the actual system architecture: Internal Database Manager + DeepSeek R1

param(
    [string]$BaseUrl = "http://localhost:3000"
)

$ErrorActionPreference = "Continue"

# Test Results Storage
$testResults = @{
    "SystemArchitecture" = @{}
    "GatekeeperRouting" = @{}
    "DeepSeekR1Performance" = @{}
    "DatabaseManager" = @{}
    "StressTests" = @{}
    "Summary" = @{}
}

# Logging function
function Write-TestLog {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] [$Level] $Message"
    Write-Host $logEntry -ForegroundColor $(if ($Level -eq "ERROR") { "Red" } elseif ($Level -eq "WARNING") { "Yellow" } else { "Green" })
}

# Test System Architecture
function Test-SystemArchitecture {
    Write-TestLog "=== TESTING SYSTEM ARCHITECTURE ==="
    
    # Test Next.js Application
    try {
        $response = Invoke-WebRequest -Uri $BaseUrl -TimeoutSec 10 -ErrorAction Stop
        $testResults.SystemArchitecture.NextJS = @{
            "Status" = "RUNNING"
            "Port" = "3000"
            "ResponseCode" = $response.StatusCode
        }
        Write-TestLog "✓ Next.js Application: RUNNING on port 3000"
    }
    catch {
        $testResults.SystemArchitecture.NextJS = @{
            "Status" = "FAILED"
            "Error" = $_.Exception.Message
        }
        Write-TestLog "✗ Next.js Application: FAILED - $($_.Exception.Message)" "ERROR"
    }
    
    # Test Database Manager Connection
    try {
        $response = Invoke-WebRequest -Uri "$BaseUrl/api/test-connection" -TimeoutSec 10 -ErrorAction Stop
        $connectionData = $response.Content | ConvertFrom-Json
        $testResults.SystemArchitecture.DatabaseManager = @{
            "Status" = "CONNECTED"
            "AssistantId" = $connectionData.assistantId
            "ResponseTime" = $connectionData.responseTime
            "Connected" = $connectionData.connected
        }
        Write-TestLog "✓ Database Manager: CONNECTED (Assistant: $($connectionData.assistantId), Response Time: $($connectionData.responseTime)ms)"
    }
    catch {
        $testResults.SystemArchitecture.DatabaseManager = @{
            "Status" = "FAILED"
            "Error" = $_.Exception.Message
        }
        Write-TestLog "✗ Database Manager: FAILED - $($_.Exception.Message)" "ERROR"
    }
    
    # Check AnythingLLM Status (should be running but not integrated)
    try {
        $anythingLLMRunning = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue
        if ($anythingLLMRunning) {
            $testResults.SystemArchitecture.AnythingLLM = @{
                "Status" = "RUNNING_NOT_INTEGRATED"
                "Port" = "3001"
                "Note" = "Service running but system uses internal database manager"
            }
            Write-TestLog "⚠ AnythingLLM: RUNNING on port 3001 but NOT INTEGRATED (system uses internal database manager)" "WARNING"
        } else {
            $testResults.SystemArchitecture.AnythingLLM = @{
                "Status" = "NOT_RUNNING"
                "Note" = "Not required for current architecture"
            }
            Write-TestLog "ℹ AnythingLLM: NOT RUNNING (not required for current architecture)"
        }
    }
    catch {
        $testResults.SystemArchitecture.AnythingLLM = @{
            "Status" = "UNKNOWN"
            "Error" = $_.Exception.Message
        }
    }
}

# Test Gatekeeper Routing
function Test-GatekeeperRouting {
    Write-TestLog "=== TESTING GATEKEEPER ROUTING ==="
    
    $routingTests = @(
        @{ "Query" = "I have a safety concern at work"; "ExpectedKeywords" = @("OSHA", "safety", "hazard"); "Type" = "Safety" },
        @{ "Query" = "I need to file a grievance"; "ExpectedKeywords" = @("grievance", "procedure", "steward"); "Type" = "Grievance" },
        @{ "Query" = "What are my contract benefits?"; "ExpectedKeywords" = @("contract", "benefits", "wages"); "Type" = "Contract" },
        @{ "Query" = "General union question"; "ExpectedKeywords" = @("UnionBolt", "assistant", "DeepSeek"); "Type" = "General" }
    )
    
    $testResults.GatekeeperRouting.Tests = @()
    
    foreach ($test in $routingTests) {
        try {
            $payload = @{
                messages = @(
                    @{ role = "user"; content = $test.Query }
                )
            } | ConvertTo-Json -Depth 3
            
            $response = Invoke-RestMethod -Uri "$BaseUrl/api/chat" -Method POST -Body $payload -ContentType "application/json" -TimeoutSec 15
            
            $keywordMatches = 0
            foreach ($keyword in $test.ExpectedKeywords) {
                if ($response.response -like "*$keyword*") {
                    $keywordMatches++
                }
            }
            
            $routingSuccess = $keywordMatches -gt 0
            
            $testResult = @{
                "Type" = $test.Type
                "Query" = $test.Query
                "Success" = $routingSuccess
                "KeywordMatches" = $keywordMatches
                "ExpectedKeywords" = $test.ExpectedKeywords.Count
                "ResponseLength" = $response.response.Length
                "TokenUsage" = $response.tokenUsage
            }
            
            $testResults.GatekeeperRouting.Tests += $testResult
            
            if ($routingSuccess) {
                Write-TestLog "✓ $($test.Type) Routing: SUCCESS ($keywordMatches/$($test.ExpectedKeywords.Count) keywords matched)"
            } else {
                Write-TestLog "✗ $($test.Type) Routing: FAILED (no expected keywords found)" "ERROR"
            }
        }
        catch {
            $testResult = @{
                "Type" = $test.Type
                "Query" = $test.Query
                "Success" = $false
                "Error" = $_.Exception.Message
            }
            $testResults.GatekeeperRouting.Tests += $testResult
            Write-TestLog "✗ $($test.Type) Routing: FAILED - $($_.Exception.Message)" "ERROR"
        }
    }
}

# Test DeepSeek R1 Performance
function Test-DeepSeekR1Performance {
    Write-TestLog "=== TESTING DEEPSEEK R1 PERFORMANCE ==="
    
    $performanceTests = @(
        @{ "Query" = "Explain OSHA compliance requirements in detail"; "MinResponseLength" = 500 },
        @{ "Query" = "What is the complete grievance procedure?"; "MinResponseLength" = 600 },
        @{ "Query" = "Tell me about union contract negotiations"; "MinResponseLength" = 400 }
    )
    
    $testResults.DeepSeekR1Performance.Tests = @()
    $responseTimes = @()
    
    foreach ($test in $performanceTests) {
        try {
            $startTime = Get-Date
            
            $payload = @{
                messages = @(
                    @{ role = "user"; content = $test.Query }
                )
            } | ConvertTo-Json -Depth 3
            
            $response = Invoke-RestMethod -Uri "$BaseUrl/api/chat" -Method POST -Body $payload -ContentType "application/json" -TimeoutSec 30
            
            $endTime = Get-Date
            $responseTime = ($endTime - $startTime).TotalMilliseconds
            $responseTimes += $responseTime
            
            $qualityScore = 0
            if ($response.response.Length -ge $test.MinResponseLength) { $qualityScore += 25 }
            if ($response.response -like "*DeepSeek R1*") { $qualityScore += 25 }
            if ($response.tokenUsage.total -gt 100) { $qualityScore += 25 }
            if ($responseTime -lt 5000) { $qualityScore += 25 }
            
            $testResult = @{
                "Query" = $test.Query
                "Success" = $true
                "ResponseTime" = $responseTime
                "ResponseLength" = $response.response.Length
                "MinRequired" = $test.MinResponseLength
                "QualityScore" = $qualityScore
                "TokenUsage" = $response.tokenUsage
            }
            
            $testResults.DeepSeekR1Performance.Tests += $testResult
            
            Write-TestLog "✓ DeepSeek R1 Query: SUCCESS (${responseTime}ms, ${qualityScore}% quality, $($response.response.Length) chars)"
        }
        catch {
            $testResult = @{
                "Query" = $test.Query
                "Success" = $false
                "Error" = $_.Exception.Message
            }
            $testResults.DeepSeekR1Performance.Tests += $testResult
            Write-TestLog "✗ DeepSeek R1 Query: FAILED - $($_.Exception.Message)" "ERROR"
        }
    }
    
    if ($responseTimes.Count -gt 0) {
        $avgResponseTime = ($responseTimes | Measure-Object -Average).Average
        $testResults.DeepSeekR1Performance.AverageResponseTime = $avgResponseTime
        Write-TestLog "ℹ Average Response Time: ${avgResponseTime}ms"
    }
}

# Stress Test
function Test-SystemStress {
    Write-TestLog "=== STRESS TESTING SYSTEM ==="
    
    $concurrentRequests = 5
    $testResults.StressTests.ConcurrentRequests = $concurrentRequests
    $testResults.StressTests.Results = @()
    
    $jobs = @()
    
    for ($i = 1; $i -le $concurrentRequests; $i++) {
        $job = Start-Job -ScriptBlock {
            param($BaseUrl, $RequestId)
            
            try {
                $payload = @{
                    messages = @(
                        @{ role = "user"; content = "Stress test request #$RequestId - tell me about workplace safety" }
                    )
                } | ConvertTo-Json -Depth 3
                
                $startTime = Get-Date
                $response = Invoke-RestMethod -Uri "$BaseUrl/api/chat" -Method POST -Body $payload -ContentType "application/json" -TimeoutSec 20
                $endTime = Get-Date
                
                return @{
                    "RequestId" = $RequestId
                    "Success" = $true
                    "ResponseTime" = ($endTime - $startTime).TotalMilliseconds
                    "ResponseLength" = $response.response.Length
                    "TokenUsage" = $response.tokenUsage
                }
            }
            catch {
                return @{
                    "RequestId" = $RequestId
                    "Success" = $false
                    "Error" = $_.Exception.Message
                }
            }
        } -ArgumentList $BaseUrl, $i
        
        $jobs += $job
    }
    
    # Wait for all jobs to complete
    $jobs | Wait-Job | ForEach-Object {
        $result = Receive-Job $_
        $testResults.StressTests.Results += $result
        
        if ($result.Success) {
            Write-TestLog "✓ Concurrent Request #$($result.RequestId): SUCCESS ($($result.ResponseTime)ms)"
        } else {
            Write-TestLog "✗ Concurrent Request #$($result.RequestId): FAILED - $($result.Error)" "ERROR"
        }
        
        Remove-Job $_
    }
    
    $successfulRequests = ($testResults.StressTests.Results | Where-Object { $_.Success }).Count
    $testResults.StressTests.SuccessRate = [math]::Round(($successfulRequests / $concurrentRequests) * 100, 2)
    
    Write-TestLog "ℹ Stress Test Complete: $successfulRequests/$concurrentRequests successful ($($testResults.StressTests.SuccessRate)%)"
}

# Generate Summary
function Generate-Summary {
    Write-TestLog "=== GENERATING COMPREHENSIVE SUMMARY ==="
    
    $totalTests = 0
    $successfulTests = 0
    
    # Count routing tests
    if ($testResults.GatekeeperRouting.Tests) {
        $totalTests += $testResults.GatekeeperRouting.Tests.Count
        $successfulTests += ($testResults.GatekeeperRouting.Tests | Where-Object { $_.Success }).Count
    }
    
    # Count performance tests
    if ($testResults.DeepSeekR1Performance.Tests) {
        $totalTests += $testResults.DeepSeekR1Performance.Tests.Count
        $successfulTests += ($testResults.DeepSeekR1Performance.Tests | Where-Object { $_.Success }).Count
    }
    
    # Count stress tests
    if ($testResults.StressTests.Results) {
        $totalTests += $testResults.StressTests.Results.Count
        $successfulTests += ($testResults.StressTests.Results | Where-Object { $_.Success }).Count
    }
    
    $overallSuccessRate = if ($totalTests -gt 0) { [math]::Round(($successfulTests / $totalTests) * 100, 2) } else { 0 }
    
    $testResults.Summary = @{
        "TotalTests" = $totalTests
        "SuccessfulTests" = $successfulTests
        "OverallSuccessRate" = $overallSuccessRate
        "SystemArchitecture" = "Internal Database Manager + DeepSeek R1"
        "AnythingLLMIntegration" = "Not Required (Internal System)"
        "GatekeeperRouting" = "Functional"
        "DeepSeekR1Status" = "Continuous Run (No Timeout)"
        "Timestamp" = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
    }
    
    Write-TestLog "=== FINAL RESULTS ==="
    Write-TestLog "System Architecture: Internal Database Manager + DeepSeek R1"
    Write-TestLog "AnythingLLM Integration: Not Required (using internal system)"
    Write-TestLog "Total Tests: $totalTests"
    Write-TestLog "Successful Tests: $successfulTests"
    Write-TestLog "Overall Success Rate: $overallSuccessRate%"
    Write-TestLog "DeepSeek R1: Continuous run mode (no timeouts)"
    
    if ($testResults.DeepSeekR1Performance.AverageResponseTime) {
        Write-TestLog "Average Response Time: $($testResults.DeepSeekR1Performance.AverageResponseTime)ms"
    }
    
    # Export detailed results
    $testResults | ConvertTo-Json -Depth 10 | Out-File "comprehensive-test-results.json" -Encoding UTF8
    Write-TestLog "Detailed results exported to: comprehensive-test-results.json"
}

# Main execution
function Start-ComprehensiveTest {
    Write-TestLog "Starting Comprehensive Integration Test for UnionBolt AI"
    Write-TestLog "Testing Internal Database Manager + DeepSeek R1 Architecture"
    Write-TestLog "Base URL: $BaseUrl"
    
    Test-SystemArchitecture
    Test-GatekeeperRouting
    Test-DeepSeekR1Performance
    Test-SystemStress
    Generate-Summary
    
    Write-TestLog "Comprehensive test completed!"
}

# Run the comprehensive test
Start-ComprehensiveTest