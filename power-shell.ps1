param(
    [switch]$sync,
    [int]$minutes
)

function Toggle-TimeSync {
    param([string]$action)
    if ($action -eq "off") {
        w32tm /config /manualpeerlist:127.0.0.1 /syncfromflags:manual /reliable:YES /update
        Stop-Service w32time
    }
    elseif ($action -eq "on") {
        Start-Service w32time
        w32tm /resync
    }
}

if ($sync.IsPresent) {
    Toggle-TimeSync -action "off"
}

$CurrentTime = Get-Date
$NewTime = $CurrentTime.AddMinutes($minutes)

Set-Date -Date $NewTime
Start-Sleep -Seconds 1
Set-Date -Date $CurrentTime

if ($sync.IsPresent) {
    Toggle-TimeSync -action "on"
}
