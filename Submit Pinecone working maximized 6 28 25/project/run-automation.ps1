# UnionBolt AI Automation Runner
# Quick setup and execution script

param(
    [switch]$SkipTokenPrompts,
    [string]$VercelToken = "",
    [string]$NgrokToken = ""
)

# Set execution policy for current session
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force

# Clear screen and show banner
Clear-Host
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "    UnionBolt AI Complete Automation Suite    " -ForegroundColor Yellow
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This script will automate:" -ForegroundColor Green
Write-Host "1. AnythingLLM diagnosis and setup" -ForegroundColor White
Write-Host "2. 19 AI agents verification" -ForegroundColor White
Write-Host "3. ngrok tunnel creation" -ForegroundColor White
Write-Host "4. Vercel environment update" -ForegroundColor White
Write-Host "5. Platform deployment" -ForegroundColor White
Write-Host "6. End-to-end connectivity testing" -ForegroundColor White
Write-Host ""

# Function to get secure input
function Get-SecureToken {
    param([string]$TokenName)
    
    Write-Host "Enter your $TokenName (or press Enter to skip): " -NoNewline -ForegroundColor Yellow
    $secureString = Read-Host -AsSecureString
    $ptr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureString)
    $token = [System.Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
    [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
    
    return $token
}

# Get tokens if not provided and not skipping prompts
if (-not $SkipTokenPrompts) {
    if (-not $VercelToken) {
        Write-Host "For full automation, we need your Vercel token." -ForegroundColor Cyan
        $VercelToken = Get-SecureToken "Vercel Token"
    }
    
    if (-not $NgrokToken) {
        Write-Host "For ngrok tunneling, we need your ngrok auth token." -ForegroundColor Cyan
        $NgrokToken = Get-SecureToken "ngrok Auth Token"
    }
}

# Validate script location
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$mainScript = Join-Path $scriptDir "automate-unionbolt-ai.ps1"
$testScript = Join-Path $scriptDir "test-ai-agents.ps1"
$configFile = Join-Path $scriptDir "automation-config.json"

if (-not (Test-Path $mainScript)) {
    Write-Host "Error: Main automation script not found at $mainScript" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $testScript)) {
    Write-Host "Error: AI agents test script not found at $testScript" -ForegroundColor Red
    exit 1
}

# Show configuration
Write-Host "Configuration:" -ForegroundColor Green
Write-Host "- Vercel Token: $(if ($VercelToken) { 'Provided' } else { 'Not provided (deployment will be skipped)' })" -ForegroundColor White
Write-Host "- ngrok Token: $(if ($NgrokToken) { 'Provided' } else { 'Not provided (may use free tier)' })" -ForegroundColor White
Write-Host "- Project Directory: $scriptDir" -ForegroundColor White
Write-Host ""

# Confirm execution
if (-not $SkipTokenPrompts) {
    Write-Host "Press Enter to start automation or Ctrl+C to cancel..." -ForegroundColor Yellow
    Read-Host
}

# Start automation
Write-Host "Starting UnionBolt AI automation..." -ForegroundColor Green
Write-Host ""

try {
    # Load and execute main automation script
    . $mainScript
    
    # Execute automation with parameters
    $automationResult = Start-UnionBoltAutomation
    
    if ($automationResult) {
        Write-Host "" 
        Write-Host "=== AUTOMATION COMPLETED SUCCESSFULLY ===" -ForegroundColor Green
        Write-Host ""
        
        # Run comprehensive AI agents testing
        Write-Host "Running comprehensive AI agents testing..." -ForegroundColor Cyan
        . $testScript
        $testResults = Start-AIAgentsTesting
        
        # Display final summary
        Write-Host "" 
        Write-Host "=== FINAL SUMMARY ===" -ForegroundColor Yellow
        Write-Host "AnythingLLM: http://localhost:3001" -ForegroundColor White
        Write-Host "Next.js App: http://localhost:3000" -ForegroundColor White
        Write-Host "AI Agents Online: $($testResults.OnlineAgents)/$($testResults.TotalAgents)" -ForegroundColor White
        Write-Host "Success Rate: $([math]::Round($testResults.SuccessRate, 2))%" -ForegroundColor White
        
        if ($NgrokToken) {
            Write-Host "ngrok Tunnel: Check automation logs for URL" -ForegroundColor White
        }
        
        if ($VercelToken) {
            Write-Host "Vercel Deployment: Completed" -ForegroundColor White
        }
        
        Write-Host "" 
        Write-Host "Check the following log files for details:" -ForegroundColor Cyan
        Write-Host "- unionbolt-automation.log" -ForegroundColor White
        Write-Host "- ai-agents-test.log" -ForegroundColor White
        Write-Host "- ai-agents-test-results.json" -ForegroundColor White
        
    } else {
        Write-Host "Automation failed. Check unionbolt-automation.log for details." -ForegroundColor Red
        exit 1
    }
    
} catch {
    Write-Host "Error during automation: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Stack trace: $($_.ScriptStackTrace)" -ForegroundColor Red
    exit 1
}

Write-Host "" 
Write-Host "UnionBolt AI automation completed!" -ForegroundColor Green
Write-Host "Press Enter to exit..." -ForegroundColor Yellow
Read-Host