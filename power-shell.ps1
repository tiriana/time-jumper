param(
    [switch]$sync,
    [int]$minutes,
    [switch]$help
)

function Show-Help {
    Write-Host "Usage: script.ps1 [-help] [-sync] <minutes>"
    Write-Host "Options:"
    Write-Host "  -help           Show this help message"
    Write-Host "  -sync           Disable and re-enable time synchronization"
    Write-Host "  <minutes>       Number of minutes to change the system time"
    exit 0
}

function Toggle-TimeSync {
    param([string]$action)
    if ($action -eq "off") {
        w32tm /config /manualpeerlist:127.0.0.1 /syncfromflags:manual /reliable:YES /update
        Stop-Service w32time
        Write-Host "Time sync disabled."
    }
    elseif ($action -eq "on") {
        Start-Service w32time
        w32tm /resync
        Write-Host "Time sync re-enabled."
    }
}

# Check for help flag
if ($help.IsPresent) {
    Show-Help
}

# Ensure minutes are defined
if (-not $minutes) {
    Write-Host "Error: Please provide the number of minutes to change the time."
    Show-Help
}

# Disable time sync if requested
if ($sync.IsPresent) {
    Toggle-TimeSync -action "off"
}

# Get current time and calculate the new time
$CurrentTime = Get-Date
$NewTime = $CurrentTime.AddMinutes($minutes)

Write-Host "Current time: $CurrentTime"
Write-Host "Changing time by $minutes minutes..."
Set-Date -Date $NewTime

# Wait for 1 second
Start-Sleep -Seconds 1

# Revert time back to original
Write-Host "Reverting time to the original..."
Set-Date -Date $CurrentTime

# Re-enable time sync if requested
if ($sync.IsPresent) {
    Toggle-TimeSync -action "on"
}
