# Puerta Fase 4: 10 pagos concurrentes -> folios unicos, cero 500s.
$ErrorActionPreference = "Stop"
$Base = "http://localhost:5050"
function Api([string]$method, [string]$path, $body = $null, [string]$token = $null) {
  if ($method -eq "GET" -and $body -is [string]) { $token = $body; $body = $null }
  $h = @{"Content-Type" = "application/json" }
  if ($token) { $h["Authorization"] = "Bearer $token" }
  $p = @{Uri = "$Base$path"; Method = $method; Headers = $h; SkipHttpErrorCheck = $true; StatusCodeVariable = "sc" }
  if ($null -ne $body) { $p["Body"] = ($body | ConvertTo-Json -Depth 8) }
  $r = Invoke-RestMethod @p
  return @{status = [int]$sc; body = $r }
}
$S = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$u = "f4race_$S"
$null = Api POST "/signup" @{name = "F4"; lastName = "R"; userName = $u; email = "$u@test.com"; password = "E2e_Test#12345"; confirmPassword = "E2e_Test#12345" }
$tok = (Api POST "/login" @{username = $u; password = "E2e_Test#12345" }).body.data.token
$null = Api PATCH "/User/folio-start" @{folioStart = 7000 } $tok
$cid = (Api POST "/Client" @{name = "Race"; lastName = "C"; phone = "5500" } $tok).body.data.id
$pvid = (Api POST "/Provider" @{name = "RaceP $S"; acronym = "RP"; email = "rp_$S@t.com"; phone = "5511"; providerContactName = "C" } $tok).body.data.id
$travel = (Get-Date).ToUniversalTime().AddDays(60).ToString("o")
$sid = (Api POST "/Sale" @{clientId = $cid; providers = @(@{providerId = $pvid; reservationNumber = "RACE-$S" }); totalAmount = 100000; travelDate = $travel } $tok).body.data.id
Write-Host "sale=$sid, lanzando 10 pagos concurrentes..."
$jobs = 1..10 | ForEach-Object -Parallel {
  $b = @{saleId = $using:sid; paymentDate = (Get-Date).ToUniversalTime().ToString("o"); amount = 100 } | ConvertTo-Json
  try {
    $r = Invoke-RestMethod -Uri "$using:Base/Payment" -Method POST -ContentType "application/json" -Headers @{Authorization = "Bearer $($using:tok)" } -Body $b -SkipHttpErrorCheck -StatusCodeVariable sc
    [pscustomobject]@{status = [int]$sc; folio = $r.data.folioNumber; msg = $r.message }
  } catch { [pscustomobject]@{status = -1; folio = $null } }
} -ThrottleLimit 10
$ok = @($jobs | Where-Object { $_.status -eq 200 }).Count
$folios = @($jobs | Where-Object { $_.folio -ne $null } | ForEach-Object { $_.folio })
$uniq = @($folios | Sort-Object -Unique).Count
Write-Host "  jobs=$($jobs.Count) ok=$ok folios=[$($folios -join ',')] unicos=$uniq"
$pass = ($ok -eq 10) -and ($uniq -eq 10)
$lp = Api GET "/Payment?saleId=$sid&page=1&pageSize=20" $tok
$pass = $pass -and ($lp.body.data.total -eq 10)
Write-Host ("  total en BD={0}" -f $lp.body.data.total)
if ($pass) { Write-Host "RACE-PASS"; exit 0 } else { Write-Host "RACE-FAIL"; exit 1 }
