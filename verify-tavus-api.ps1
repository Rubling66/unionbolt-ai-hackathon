# Tavus API Key Verification Script
# Tests the provided API key against Tavus endpoints

param(
    [string]$ApiKey = "4fed836b3cf943918a0f8931eb6ee967"
)

$ErrorActionPreference = "Continue"

function Write-Status {
    param(
        [string]$Message,
        [string]$Type = "INFO"
    )
    
    $color = switch ($Type) {
        "SUCCESS" { "Green" }
        "ERROR" { "Red" }
        "WARNING" { "Yellow" }
        default { "White" }
    }
    
    Write-Host "[$Type] $Message" -ForegroundColor $color
}

function Test-TavusAPI {
    param(
        [string]$ApiKey,
        [string]$Endpoint
    )
    
    try {
        $headers = @{
            "x-api-key" = $ApiKey
            "Content-Type" = "application/json"
        }
        
        Write-Status "Testing endpoint: $Endpoint" "INFO"
        
        $response = Invoke-RestMethod -Uri $Endpoint -Method GET -Headers $headers -TimeoutSec 30
        
        return @{
            Success = $true
            Response = $response
            StatusCode = 200
        }
    }
    catch {
        $statusCode = if ($_.Exception.Response) { $_.Exception.Response.StatusCode.value__ } else { "Unknown" }
        return @{
            Success = $false
            Error = $_.Exception.Message
            StatusCode = $statusCode
        }
    }
}

Write-Host "=== TAVUS API KEY VERIFICATION ===" -ForegroundColor Cyan
Write-Host "API Key: $($ApiKey.Substring(0,8))..." -ForegroundColor White
Write-Host ""

# Test 1: Replicas endpoint
Write-Status "Testing Replicas endpoint..." "INFO"
$replicasResult = Test-TavusAPI -ApiKey $ApiKey -Endpoint "https://tavusapi.com/v2/replicas"

if ($replicasResult.Success) {
    Write-Status "✅ Replicas API: SUCCESS" "SUCCESS"
    Write-Host "Response: $($replicasResult.Response | ConvertTo-Json -Depth 2)" -ForegroundColor Gray
} else {
    Write-Status "❌ Replicas API: FAILED (Status: $($replicasResult.StatusCode))" "ERROR"
    Write-Host "Error: $($replicasResult.Error)" -ForegroundColor Red
}

Write-Host ""

# Test 2: Personas endpoint
Write-Status "Testing Personas endpoint..." "INFO"
$personasResult = Test-TavusAPI -ApiKey $ApiKey -Endpoint "https://tavusapi.com/v2/personas"

if ($personasResult.Success) {
    Write-Status "✅ Personas API: SUCCESS" "SUCCESS"
    Write-Host "Response: $($personasResult.Response | ConvertTo-Json -Depth 2)" -ForegroundColor Gray
} else {
    Write-Status "❌ Personas API: FAILED (Status: $($personasResult.StatusCode))" "ERROR"
    Write-Host "Error: $($personasResult.Error)" -ForegroundColor Red
}

Write-Host ""

# Test 3: Check specific assets mentioned in Phase 1
Write-Status "Testing specific Replica ID: r92debe21318" "INFO"
$specificReplicaResult = Test-TavusAPI -ApiKey $ApiKey -Endpoint "https://tavusapi.com/v2/replicas/r92debe21318"

if ($specificReplicaResult.Success) {
    Write-Status "✅ Replica r92debe21318: CONFIRMED" "SUCCESS"
    Write-Host "Response: $($specificReplicaResult.Response | ConvertTo-Json -Depth 2)" -ForegroundColor Gray
} else {
    Write-Status "❌ Replica r92debe21318: NOT FOUND (Status: $($specificReplicaResult.StatusCode))" "ERROR"
    Write-Host "Error: $($specificReplicaResult.Error)" -ForegroundColor Red
}

Write-Host ""

Write-Status "Testing specific Persona ID: pf3f7150ee47" "INFO"
$specificPersonaResult = Test-TavusAPI -ApiKey $ApiKey -Endpoint "https://tavusapi.com/v2/personas/pf3f7150ee47"

if ($specificPersonaResult.Success) {
    Write-Status "✅ Persona pf3f7150ee47: CONFIRMED" "SUCCESS"
    Write-Host "Response: $($specificPersonaResult.Response | ConvertTo-Json -Depth 2)" -ForegroundColor Gray
} else {
    Write-Status "❌ Persona pf3f7150ee47: NOT FOUND (Status: $($specificPersonaResult.StatusCode))" "ERROR"
    Write-Host "Error: $($specificPersonaResult.Error)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== VERIFICATION COMPLETE ===" -ForegroundColor Cyan

# Summary
$apiWorking = $replicasResult.Success -or $personasResult.Success
$replicaConfirmed = $specificReplicaResult.Success
$personaConfirmed = $specificPersonaResult.Success

Write-Host "=== PHASE 1 COMPLETION REPORT ===" -ForegroundColor Yellow
Write-Host "Status: $(if ($apiWorking) { 'SUCCESS' } else { 'FAILED' })" -ForegroundColor $(if ($apiWorking) { 'Green' } else { 'Red' })
Write-Host "API Access: $(if ($apiWorking) { 'WORKING' } else { 'NOT WORKING' })" -ForegroundColor $(if ($apiWorking) { 'Green' } else { 'Red' })
Write-Host "Persona ID pf3f7150ee47: $(if ($personaConfirmed) { 'CONFIRMED' } else { 'MISSING' })" -ForegroundColor $(if ($personaConfirmed) { 'Green' } else { 'Red' })
Write-Host "Replica ID r92debe21318: $(if ($replicaConfirmed) { 'CONFIRMED' } else { 'MISSING' })" -ForegroundColor $(if ($replicaConfirmed) { 'Green' } else { 'Red' })
Write-Host "Account Status: $(if ($apiWorking) { 'ACTIVE' } else { 'ISSUES' })" -ForegroundColor $(if ($apiWorking) { 'Green' } else { 'Red' })
Write-Host "Plan Type: $(if ($apiWorking) { 'To be determined from API response' } else { 'UNKNOWN' })" -ForegroundColor White
Write-Host "Usage Quota: $(if ($apiWorking) { 'To be determined from API response' } else { 'UNKNOWN' })" -ForegroundColor White
Write-Host ""
Write-Host "Phase 1 Complete. Awaiting Phase 2 instructions." -ForegroundColor Cyan