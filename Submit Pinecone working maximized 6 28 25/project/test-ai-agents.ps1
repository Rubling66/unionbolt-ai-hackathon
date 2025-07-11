# AI Agents Testing Script for UnionBolt
# Tests all 19 union management AI agents

param(
    [string]$BaseUrl = "http://localhost:3000",
    [string]$AnythingLLMUrl = "http://localhost:3001",
    [int]$TimeoutSeconds = 30
)

$ErrorActionPreference = "Continue"

# Define the 19 Union Management AI Agents
$UnionAgents = @(
    @{ Name = "Contract Negotiator"; Endpoint = "/api/agents/contract-negotiator"; Description = "Handles contract negotiations and terms" },
    @{ Name = "Grievance Handler"; Endpoint = "/api/agents/grievance-handler"; Description = "Processes member grievances and complaints" },
    @{ Name = "Benefits Coordinator"; Endpoint = "/api/agents/benefits-coordinator"; Description = "Manages member benefits and healthcare" },
    @{ Name = "Safety Inspector"; Endpoint = "/api/agents/safety-inspector"; Description = "Monitors workplace safety compliance" },
    @{ Name = "Training Coordinator"; Endpoint = "/api/agents/training-coordinator"; Description = "Organizes member training programs" },
    @{ Name = "Membership Manager"; Endpoint = "/api/agents/membership-manager"; Description = "Handles member enrollment and records" },
    @{ Name = "Strike Coordinator"; Endpoint = "/api/agents/strike-coordinator"; Description = "Organizes and manages strike activities" },
    @{ Name = "Legal Advisor"; Endpoint = "/api/agents/legal-advisor"; Description = "Provides legal guidance and support" },
    @{ Name = "Communications Director"; Endpoint = "/api/agents/communications-director"; Description = "Manages internal and external communications" },
    @{ Name = "Financial Analyst"; Endpoint = "/api/agents/financial-analyst"; Description = "Analyzes union finances and budgets" },
    @{ Name = "Political Liaison"; Endpoint = "/api/agents/political-liaison"; Description = "Handles political advocacy and lobbying" },
    @{ Name = "Workplace Organizer"; Endpoint = "/api/agents/workplace-organizer"; Description = "Organizes new workplaces and campaigns" },
    @{ Name = "Pension Administrator"; Endpoint = "/api/agents/pension-administrator"; Description = "Manages retirement and pension plans" },
    @{ Name = "Health & Safety Officer"; Endpoint = "/api/agents/health-safety-officer"; Description = "Ensures workplace health standards" },
    @{ Name = "Education Director"; Endpoint = "/api/agents/education-director"; Description = "Develops educational programs for members" },
    @{ Name = "Research Analyst"; Endpoint = "/api/agents/research-analyst"; Description = "Conducts research on labor issues" },
    @{ Name = "Event Coordinator"; Endpoint = "/api/agents/event-coordinator"; Description = "Plans union events and meetings" },
    @{ Name = "Technology Specialist"; Endpoint = "/api/agents/technology-specialist"; Description = "Manages union technology and systems" },
    @{ Name = "International Relations"; Endpoint = "/api/agents/international-relations"; Description = "Handles international union partnerships" }
)

# Logging function
function Write-TestLog {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] [$Level] $Message"
    Write-Host $logEntry
    Add-Content -Path "ai-agents-test.log" -Value $logEntry
}

# Function to test individual agent
function Test-Agent {
    param(
        [hashtable]$Agent,
        [string]$BaseUrl,
        [int]$Timeout
    )
    
    $testResults = @{
        Name = $Agent.Name
        Endpoint = $Agent.Endpoint
        Status = "UNKNOWN"
        ResponseTime = 0
        Error = ""
    }
    
    try {
        $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
        
        # Test agent endpoint
        $fullUrl = "$BaseUrl$($Agent.Endpoint)"
        $response = Invoke-WebRequest -Uri $fullUrl -TimeoutSec $Timeout -ErrorAction Stop
        
        $stopwatch.Stop()
        $testResults.ResponseTime = $stopwatch.ElapsedMilliseconds
        
        if ($response.StatusCode -eq 200) {
            $testResults.Status = "ONLINE"
        } else {
            $testResults.Status = "ERROR"
            $testResults.Error = "HTTP $($response.StatusCode)"
        }
    }
    catch {
        $stopwatch.Stop()
        $testResults.Status = "OFFLINE"
        $testResults.Error = $_.Exception.Message
    }
    
    return $testResults
}

# Function to test chat functionality with agents
function Test-AgentChat {
    param(
        [hashtable]$Agent,
        [string]$BaseUrl,
        [int]$Timeout
    )
    
    try {
        $chatPayload = @{
            agent = $Agent.Name
            message = "Hello, I need assistance with union matters. Can you help?"
            context = "union_management"
        } | ConvertTo-Json
        
        $chatUrl = "$BaseUrl/api/chat"
        $response = Invoke-RestMethod -Uri $chatUrl -Method POST -Body $chatPayload -ContentType "application/json" -TimeoutSec $Timeout
        
        return @{
            Status = "SUCCESS"
            Response = $response
        }
    }
    catch {
        return @{
            Status = "FAILED"
            Error = $_.Exception.Message
        }
    }
}

# Function to test AnythingLLM integration
function Test-AnythingLLMIntegration {
    param([string]$AnythingLLMUrl, [int]$Timeout)
    
    Write-TestLog "Testing AnythingLLM integration..."
    
    try {
        # Test basic connectivity
        $response = Invoke-WebRequest -Uri $AnythingLLMUrl -TimeoutSec $Timeout
        Write-TestLog "AnythingLLM is accessible at $AnythingLLMUrl"
        
        # Test API endpoints
        $apiTests = @(
            "$AnythingLLMUrl/api/system/check",
            "$AnythingLLMUrl/api/workspaces",
            "$AnythingLLMUrl/api/system/system-vectors"
        )
        
        foreach ($apiUrl in $apiTests) {
            try {
                $apiResponse = Invoke-WebRequest -Uri $apiUrl -TimeoutSec $Timeout
                Write-TestLog "API endpoint $apiUrl: ACCESSIBLE"
            }
            catch {
                Write-TestLog "API endpoint $apiUrl: FAILED - $($_.Exception.Message)" "WARNING"
            }
        }
        
        return $true
    }
    catch {
        Write-TestLog "AnythingLLM integration test failed: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

# Main testing function
function Start-AIAgentsTesting {
    Write-TestLog "Starting comprehensive AI agents testing..."
    Write-TestLog "Base URL: $BaseUrl"
    Write-TestLog "AnythingLLM URL: $AnythingLLMUrl"
    Write-TestLog "Testing $($UnionAgents.Count) union management AI agents"
    
    $testResults = @()
    $successCount = 0
    $failureCount = 0
    
    # Test AnythingLLM integration first
    $anythingLLMStatus = Test-AnythingLLMIntegration -AnythingLLMUrl $AnythingLLMUrl -Timeout $TimeoutSeconds
    
    # Test each agent
    foreach ($agent in $UnionAgents) {
        Write-TestLog "Testing agent: $($agent.Name)"
        
        $result = Test-Agent -Agent $agent -BaseUrl $BaseUrl -Timeout $TimeoutSeconds
        $testResults += $result
        
        if ($result.Status -eq "ONLINE") {
            $successCount++
            Write-TestLog "✓ $($agent.Name): ONLINE ($($result.ResponseTime)ms)"
            
            # Test chat functionality
            $chatResult = Test-AgentChat -Agent $agent -BaseUrl $BaseUrl -Timeout $TimeoutSeconds
            if ($chatResult.Status -eq "SUCCESS") {
                Write-TestLog "✓ $($agent.Name): Chat functionality working"
            } else {
                Write-TestLog "⚠ $($agent.Name): Chat functionality failed - $($chatResult.Error)" "WARNING"
            }
        } else {
            $failureCount++
            Write-TestLog "✗ $($agent.Name): $($result.Status) - $($result.Error)" "ERROR"
        }
    }
    
    # Generate summary report
    Write-TestLog "=== AI AGENTS TEST SUMMARY ==="
    Write-TestLog "Total Agents Tested: $($UnionAgents.Count)"
    Write-TestLog "Online Agents: $successCount"
    Write-TestLog "Offline Agents: $failureCount"
    Write-TestLog "Success Rate: $([math]::Round(($successCount / $UnionAgents.Count) * 100, 2))%"
    Write-TestLog "AnythingLLM Integration: $(if ($anythingLLMStatus) { 'WORKING' } else { 'FAILED' })"
    
    # Export detailed results
    $testResults | ConvertTo-Json -Depth 3 | Out-File "ai-agents-test-results.json"
    Write-TestLog "Detailed results exported to ai-agents-test-results.json"
    
    return @{
        TotalAgents = $UnionAgents.Count
        OnlineAgents = $successCount
        OfflineAgents = $failureCount
        SuccessRate = ($successCount / $UnionAgents.Count) * 100
        AnythingLLMStatus = $anythingLLMStatus
        Results = $testResults
    }
}

# Execute testing if script is run directly
if ($MyInvocation.InvocationName -ne '.') {
    Start-AIAgentsTesting
}