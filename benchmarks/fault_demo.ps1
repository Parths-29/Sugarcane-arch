# Scripted kill-a-container demo
Write-Host "[1] Stopping weather service..."
# docker stop weather
Write-Host "[2] Making advisory request (should return staleWeather: true)..."
Write-Host "[3] Restarting weather service..."
# docker start weather
Write-Host "[4] Stopping notification service..."
# docker stop notification
Write-Host "[5] Making advisory requests (queue builds)..."
Write-Host "[6] Restarting notification (messages process)..."
# docker start notification
Write-Host "[7] Stopping advisory service..."
# docker stop advisory
Write-Host "[8] Making request (should return 503 while auth works)..."
