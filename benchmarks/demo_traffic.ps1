param(
  [string]$ApiBaseUrl = "http://localhost:8000",
  [int]$Requests = 20,
  [int]$DelayMilliseconds = 700
)

$ErrorActionPreference = "Stop"
$phone = Read-Host "Farmer account phone number"
$securePassword = Read-Host "Farmer account password" -AsSecureString
$passwordPtr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
$password = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($passwordPtr)

try {
  $loginBody = @{ phone = $phone; password = $password } | ConvertTo-Json
  $login = Invoke-RestMethod -Method Post -Uri "$ApiBaseUrl/api/auth/login" -ContentType "application/json" -Body $loginBody
  $headers = @{ Authorization = "Bearer $($login.token)" }
  Write-Host "Logged in. Sending $Requests real advisory requests through the gateway..." -ForegroundColor Cyan

  $stages = @("germination", "tillering", "grand_growth", "maturity")
  $moisture = @(18, 32, 48, 72)
  for ($i = 0; $i -lt $Requests; $i++) {
    $body = @{
      growthStage = $stages[$i % $stages.Length]
      soilMoisturePct = $moisture[$i % $moisture.Length]
      village = "Athani"
      language = "en"
    } | ConvertTo-Json

    $result = Invoke-RestMethod -Method Post -Uri "$ApiBaseUrl/api/advisory" -Headers $headers -ContentType "application/json" -Body $body
    $queueState = if ($result.notificationQueued) { "queued in Redis" } else { "Redis enqueue failed" }
    Write-Host ("{0,2}/{1}: {2,-8} {3,5} mm | {4}" -f ($i + 1), $Requests, $result.decision, $result.irrigationMm, $queueState)
    if ($i -lt ($Requests - 1) -and $DelayMilliseconds -gt 0) { Start-Sleep -Milliseconds $DelayMilliseconds }
  }

  Write-Host "Done. Refresh Grafana and query the Redis Stream counters in Prometheus." -ForegroundColor Green
}
finally {
  if ($passwordPtr -ne [IntPtr]::Zero) { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($passwordPtr) }
  $password = $null
  $loginBody = $null
  $securePassword.Dispose()
}
