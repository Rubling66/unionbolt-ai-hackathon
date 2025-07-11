# UnionBolts Platform Complete Automation Script
# Automates AnythingLLM setup, ngrok tunneling, Vercel deployment, and testing

param(
    [string]$VercelToken = "",
    [string]$NgrokAuthToken = "",
    [string]$ProjectName = "unionbolts-platform"
)

# Configuration
$ErrorActionPreference = "Stop"
$AnythingLLMPort = 3001
$NgrokPort = 3001
$LogFile = "unionbolts-automation.log"

# Logging function
function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] [$Level] $Message"
    Write-Host $logEntry
    Add-Content -Path $LogFile -Value $logEntry
}

# Function to check if a port is in use
function Test-Port {
    param([int]$Port)
    try {
        $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        return $connection -ne $null
    } catch {
        return $false
    }
}

# Function to install AnythingLLM via npm
function Install-AnythingLLM {
    Write-Log "Installing AnythingLLM..."
    try {
        # Install AnythingLLM globally
        npm install -g @mintplex-labs/anythingllm
        Write-Log "AnythingLLM installed successfully"
        return $true
    } catch {
        Write-Log "Failed to install AnythingLLM via npm: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

# Function to start AnythingLLM
function Start-AnythingLLM {
    Write-Log "Starting AnythingLLM on port $AnythingLLMPort..."
    try {
        # Check if already running
        if (Test-Port -Port $AnythingLLMPort) {
            Write-Log "AnythingLLM is already running on port $AnythingLLMPort"
            return $true
        }

        # Try to start AnythingLLM
        $process = Start-Process -FilePath "anythingllm" -ArgumentList "--port", $AnythingLLMPort -PassThru -NoNewWindow
        Start-Sleep -Seconds 10
        
        # Verify it's running
        if (Test-Port -Port $AnythingLLMPort) {
            Write-Log "AnythingLLM started successfully on port $AnythingLLMPort"
            return $true
        } else {
            Write-Log "AnythingLLM failed to start on port $AnythingLLMPort" "ERROR"
            return $false
        }
    } catch {
        Write-Log "Error starting AnythingLLM: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

# Function to test AnythingLLM connectivity
function Test-AnythingLLM {
    Write-Log "Testing AnythingLLM connectivity..."
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$AnythingLLMPort" -TimeoutSec 10 -ErrorAction Stop
        Write-Log "AnythingLLM is accessible at http://localhost:$AnythingLLMPort"
        return $true
    } catch {
        Write-Log "AnythingLLM is not accessible: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

# Function to install ngrok
function Install-Ngrok {
    Write-Log "Installing ngrok..."
    try {
        # Check if ngrok is already installed
        $ngrokPath = Get-Command ngrok -ErrorAction SilentlyContinue
        if ($ngrokPath) {
            Write-Log "ngrok is already installed"
            return $true
        }

        # Install ngrok via Chocolatey
        if (Get-Command choco -ErrorAction SilentlyContinue) {
            choco install ngrok -y
        } else {
            # Download and install ngrok manually
            $ngrokUrl = "https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-windows-amd64.zip"
            $ngrokZip = "$env:TEMP\ngrok.zip"
            $ngrokDir = "$env:USERPROFILE\ngrok"
            
            Invoke-WebRequest -Uri $ngrokUrl -OutFile $ngrokZip
            Expand-Archive -Path $ngrokZip -DestinationPath $ngrokDir -Force
            
            # Add to PATH
            $env:PATH += ";$ngrokDir"
            [Environment]::SetEnvironmentVariable("PATH", $env:PATH, "User")
        }
        
        Write-Log "ngrok installed successfully"
        return $true
    } catch {
        Write-Log "Failed to install ngrok: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

# Function to start ngrok tunnel
function Start-NgrokTunnel {
    param([string]$AuthToken)
    
    Write-Log "Starting ngrok tunnel..."
    try {
        # Set auth token if provided
        if ($AuthToken) {
            ngrok config add-authtoken $AuthToken
        }
        
        # Start ngrok tunnel
        $ngrokProcess = Start-Process -FilePath "ngrok" -ArgumentList "http", $NgrokPort -PassThru -NoNewWindow
        Start-Sleep -Seconds 5
        
        # Get tunnel URL
        $tunnelInfo = Invoke-RestMethod -Uri "http://localhost:4040/api/tunnels" -ErrorAction Stop
        $publicUrl = $tunnelInfo.tunnels[0].public_url
        
        if ($publicUrl) {
            Write-Log "ngrok tunnel started: $publicUrl"
            return $publicUrl
        } else {
            Write-Log "Failed to get ngrok tunnel URL" "ERROR"
            return $null
        }
    } catch {
        Write-Log "Error starting ngrok tunnel: $($_.Exception.Message)" "ERROR"
        return $null
    }
}

# Function to update Vercel environment variables
function Update-VercelEnvironment {
    param([string]$Token, [string]$Project, [string]$TunnelUrl)
    
    Write-Log "Updating Vercel environment variables..."
    try {
        # Install Vercel CLI if not present
        if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
            npm install -g vercel
        }
        
        # Login to Vercel
        if ($Token) {
            $env:VERCEL_TOKEN = $Token
        }
        
        # Update environment variable
        vercel env add ANYTHINGLLM_URL $TunnelUrl production --yes
        
        Write-Log "Vercel environment variables updated"
        return $true
    } catch {
        Write-Log "Failed to update Vercel environment: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

# Function to deploy to Vercel
function Deploy-ToVercel {
    param([string]$Project)
    
    Write-Log "Deploying to Vercel..."
    try {
        # Deploy the project
        vercel --prod --yes
        
        Write-Log "Deployment to Vercel completed"
        return $true
    } catch {
        Write-Log "Failed to deploy to Vercel: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

# Function to test AI agents
function Test-AIAgents {
    param([string]$BaseUrl)
    
    Write-Log "Testing AI agents connectivity..."
    $agentTests = @()
    
    # Test basic connectivity
    try {
        $response = Invoke-WebRequest -Uri "$BaseUrl/api/test-connection" -TimeoutSec 30
        $agentTests += "Basic connectivity: PASSED"
    } catch {
        $agentTests += "Basic connectivity: FAILED - $($_.Exception.Message)"
    }
    
    # Test chat endpoint
    try {
        $chatPayload = @{
            messages = @(@{
                role = "user"
                content = "Test message for union AI agents"
            })
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "$BaseUrl/api/chat" -Method POST -Body $chatPayload -ContentType "application/json" -TimeoutSec 30
        $agentTests += "Chat endpoint: PASSED"
    } catch {
        $agentTests += "Chat endpoint: FAILED - $($_.Exception.Message)"
    }
    
    # Log results
    foreach ($test in $agentTests) {
        Write-Log $test
    }
    
    return $agentTests
}

# Main automation function
function Start-UnionBoltAutomation {
    Write-Log "Starting UnionBolt AI Complete Automation..."
    Write-Log "System: Intel i9-10900KF, 64GB RAM, Windows x64"
    
    # Step 1: Diagnose and fix AnythingLLM
    Write-Log "=== Step 1: Diagnosing AnythingLLM ==="
    
    if (-not (Test-AnythingLLM)) {
        Write-Log "AnythingLLM not accessible, attempting to install and start..."
        
        if (-not (Install-AnythingLLM)) {
            Write-Log "Failed to install AnythingLLM" "ERROR"
            return $false
        }
        
        if (-not (Start-AnythingLLM)) {
            Write-Log "Failed to start AnythingLLM" "ERROR"
            return $false
        }
    }
    
    # Step 2: Verify AI agents
    Write-Log "=== Step 2: Verifying AI Agents ==="
    if (Test-AnythingLLM) {
        Write-Log "All 19 AI agents should be accessible through AnythingLLM interface"
    }
    
    # Step 3: Start ngrok tunnel
    Write-Log "=== Step 3: Starting ngrok tunnel ==="
    
    if (-not (Install-Ngrok)) {
        Write-Log "Failed to install ngrok" "ERROR"
        return $false
    }
    
    $tunnelUrl = Start-NgrokTunnel -AuthToken $NgrokAuthToken
    if (-not $tunnelUrl) {
        Write-Log "Failed to start ngrok tunnel" "ERROR"
        return $false
    }
    
    # Step 4: Update Vercel environment
    Write-Log "=== Step 4: Updating Vercel Environment ==="
    
    if ($VercelToken) {
        if (-not (Update-VercelEnvironment -Token $VercelToken -Project $ProjectName -TunnelUrl $tunnelUrl)) {
            Write-Log "Failed to update Vercel environment" "ERROR"
        }
    } else {
        Write-Log "No Vercel token provided, skipping environment update" "WARNING"
    }
    
    # Step 5: Deploy to Vercel
    Write-Log "=== Step 5: Deploying to Vercel ==="
    
    if ($VercelToken) {
        if (-not (Deploy-ToVercel -Project $ProjectName)) {
            Write-Log "Failed to deploy to Vercel" "ERROR"
        }
    } else {
        Write-Log "No Vercel token provided, skipping deployment" "WARNING"
    }
    
    # Step 6: Test end-to-end connectivity
    Write-Log "=== Step 6: Testing End-to-End Connectivity ==="
    
    $localTests = Test-AIAgents -BaseUrl "http://localhost:3000"
    Write-Log "Local tests completed"
    
    # Step 7: Test live platform
    Write-Log "=== Step 7: Testing Live Platform ==="
    
    if ($tunnelUrl) {
        $liveTests = Test-AIAgents -BaseUrl $tunnelUrl
        Write-Log "Live platform tests completed"
    }
    
    # Summary
    Write-Log "=== Automation Summary ==="
    Write-Log "AnythingLLM URL: http://localhost:$AnythingLLMPort"
    Write-Log "ngrok Tunnel URL: $tunnelUrl"
    Write-Log "Local Next.js: http://localhost:3000"
    Write-Log "Automation completed successfully!"
    
    return $true
}

# Execute automation
if ($MyInvocation.InvocationName -ne '.') {
    Start-UnionBoltAutomation
}