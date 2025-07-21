# UnionBolt AI Deployment Status Verification
# Comprehensive status check for all automation components

param(
    [switch]$Detailed
)

$ErrorActionPreference = "Continue"

# Configuration
$LocalNextJS = "http://localhost:3000"
$LocalAnythingLLM = "http://localhost:3001"
$NgrokAPI = "http://localhost:4040/api/tunnels"
$ProjectDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Colors for output
function Write-Status {
    param([string]$Message, [string]$Status = "INFO")
    $color = switch ($Status) {
        "SUCCESS" { "Green" }
        "ERROR" { "Red" }
        "WARNING" { "Yellow" }
        "INFO" { "Cyan" }
        default { "White" }
    }
    Write-Host "[$Status] $Message" -ForegroundColor $color
}

# Function to test HTTP endpoint
function Test-Endpoint {
    param([string]$Url, [int]$TimeoutSec = 10)
    try {
        $response = Invoke-WebRequest -Uri $Url -TimeoutSec $TimeoutSec -ErrorAction Stop
        return @{
            Status = "SUCCESS"
            StatusCode = $response.StatusCode
            ResponseTime = 0
        }
    }
    catch {
        return @{
            Status = "ERROR"
            Error = $_.Exception.Message
            StatusCode = 0
        }
    }
}

# Function to get ngrok tunnel info
function Get-NgrokTunnel {
    try {
        $tunnels = Invoke-RestMethod -Uri $NgrokAPI -ErrorAction Stop
        if ($tunnels.tunnels -and $tunnels.tunnels.Count -gt 0) {
            return $tunnels.tunnels[0].public_url
        }
        return $null
    }
    catch {
        return $null
    }
}

# Function to check process on port
function Test-PortInUse {
    param([int]$Port)
    try {
        $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        return $connection -ne $null
    }
    catch {
        return $false
    }
}

# Function to test AI agents endpoints
function Test-AIAgents {
    param([string]$BaseUrl)
    
    $agents = @(
        "contract-negotiator", "grievance-handler", "benefits-coordinator",
        "safety-inspector", "training-coordinator", "membership-manager",
        "strike-coordinator", "legal-advisor", "communications-director",
        "financial-analyst", "political-liaison", "workplace-organizer",
        "pension-administrator", "health-safety-officer", "education-director",
        "research-analyst", "event-coordinator", "technology-specialist",
        "international-relations"
    )
    
    $results = @()
    foreach ($agent in $agents) {
        $endpoint = "$BaseUrl/api/agents/$agent"
        $test = Test-Endpoint -Url $endpoint -TimeoutSec 5
        $results += @{
            Agent = $agent
            Status = $test.Status
            Endpoint = $endpoint
        }
    }
    
    return $results
}

Clear-Host
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "    UnionBolt AI Deployment Status Report    " -ForegroundColor Yellow
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

# Check 1: Next.js Application
Write-Status "Checking Next.js Application..." "INFO"
$nextjsPort = Test-PortInUse -Port 3000
if ($nextjsPort) {
    $nextjsTest = Test-Endpoint -Url $LocalNextJS
    if ($nextjsTest.Status -eq "SUCCESS") {
        Write-Status "✓ Next.js app is running at $LocalNextJS" "SUCCESS"
    } else {
        Write-Status "✗ Next.js app port is occupied but not responding" "ERROR"
    }
} else {
    Write-Status "✗ Next.js app is not running on port 3000" "ERROR"
}

# Check 2: AnythingLLM
Write-Status "Checking AnythingLLM..." "INFO"
$anythingllmPort = Test-PortInUse -Port 3001
if ($anythingllmPort) {
    $anythingllmTest = Test-Endpoint -Url $LocalAnythingLLM
    if ($anythingllmTest.Status -eq "SUCCESS") {
        Write-Status "✓ AnythingLLM is running at $LocalAnythingLLM" "SUCCESS"
    } else {
        Write-Status "⚠ AnythingLLM port is occupied but may not be fully accessible" "WARNING"
    }
} else {
    Write-Status "✗ AnythingLLM is not running on port 3001" "ERROR"
}

# Check 3: ngrok Tunnel
Write-Status "Checking ngrok Tunnel..." "INFO"
$ngrokUrl = Get-NgrokTunnel
if ($ngrokUrl) {
    Write-Status "✓ ngrok tunnel is active: $ngrokUrl" "SUCCESS"
    
    # Test tunnel accessibility
    $tunnelTest = Test-Endpoint -Url $ngrokUrl -TimeoutSec 15
    if ($tunnelTest.Status -eq "SUCCESS") {
        Write-Status "✓ ngrok tunnel is accessible from internet" "SUCCESS"
    } else {
        Write-Status "⚠ ngrok tunnel exists but may not be accessible" "WARNING"
    }
} else {
    Write-Status "✗ ngrok tunnel is not active" "ERROR"
}

# Check 4: AI Agents (if detailed check requested)
if ($Detailed) {
    Write-Status "Checking AI Agents (detailed)..." "INFO"
    
    if ($nextjsPort) {
        $agentResults = Test-AIAgents -BaseUrl $LocalNextJS
        $onlineAgents = ($agentResults | Where-Object { $_.Status -eq "SUCCESS" }).Count
        $totalAgents = $agentResults.Count
        
        Write-Status "AI Agents Status: $onlineAgents/$totalAgents online" "INFO"
        
        if ($onlineAgents -gt 0) {
            Write-Status "✓ Some AI agents are responding" "SUCCESS"
        } else {
            Write-Status "✗ No AI agents are responding" "ERROR"
        }
        
        # Show individual agent status
        foreach ($result in $agentResults) {
            $status = if ($result.Status -eq "SUCCESS") { "✓" } else { "✗" }
            Write-Host "  $status $($result.Agent)" -ForegroundColor $(if ($result.Status -eq "SUCCESS") { "Green" } else { "Red" })
        }
    } else {
        Write-Status "Cannot test AI agents - Next.js app not running" "ERROR"
    }
}

# Check 5: Log Files
Write-Status "Checking Log Files..." "INFO"
$logFile = Join-Path $ProjectDir "unionbolt-automation.log"
if (Test-Path $logFile) {
    $logContent = Get-Content $logFile -Tail 5
    Write-Status "✓ Automation log file exists" "SUCCESS"
    Write-Host "Last 5 log entries:" -ForegroundColor Gray
    foreach ($line in $logContent) {
        Write-Host "  $line" -ForegroundColor Gray
    }
} else {
    Write-Status "✗ Automation log file not found" "ERROR"
}

# Summary
Write-Host ""
Write-Host "=== DEPLOYMENT SUMMARY ===" -ForegroundColor Yellow

$components = @(
    @{ Name = "Next.js App"; Status = $nextjsPort -and (Test-Endpoint -Url $LocalNextJS).Status -eq "SUCCESS" },
    @{ Name = "AnythingLLM"; Status = $anythingllmPort },
    @{ Name = "ngrok Tunnel"; Status = $ngrokUrl -ne $null },
    @{ Name = "Internet Access"; Status = $ngrokUrl -and (Test-Endpoint -Url $ngrokUrl -TimeoutSec 10).Status -eq "SUCCESS" }
)

foreach ($component in $components) {
    $status = if ($component.Status) { "✓ WORKING" } else { "✗ FAILED" }
    $color = if ($component.Status) { "Green" } else { "Red" }
    Write-Host "$($component.Name): $status" -ForegroundColor $color
}

# URLs Summary
Write-Host ""
Write-Host "=== ACCESS URLS ===" -ForegroundColor Yellow
Write-Host "Local Next.js: $LocalNextJS" -ForegroundColor White
Write-Host "Local AnythingLLM: $LocalAnythingLLM" -ForegroundColor White
if ($ngrokUrl) {
    Write-Host "Public URL: $ngrokUrl" -ForegroundColor Green
} else {
    Write-Host "Public URL: Not available" -ForegroundColor Red
}

# Recommendations
Write-Host ""
Write-Host "=== RECOMMENDATIONS ===" -ForegroundColor Yellow

if (-not $nextjsPort) {
    Write-Host "• Start Next.js development server: npm run dev" -ForegroundColor Yellow
}

if (-not $anythingllmPort) {
    Write-Host "• Install and start AnythingLLM: npm install -g @mintplex-labs/anythingllm && anythingllm" -ForegroundColor Yellow
}

if (-not $ngrokUrl) {
    Write-Host "• Start ngrok tunnel: ngrok http 3001" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Run with -Detailed flag for comprehensive AI agents testing" -ForegroundColor Cyan
Write-Host "Example: .\verify-deployment-status.ps1 -Detailed" -ForegroundColor Cyan