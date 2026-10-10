# Seed Fase 3: 1 tenant con 200 ventas + medicion de /Sale y charts.
$ErrorActionPreference = "Stop"
$Base = "http://localhost:5050"
$S = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
function Api([string]$method, [string]$path, $body = $null, [string]$token = $null) {
  if ($method -eq "GET" -and $body -is [string]) { $token = $body; $body = $null }
  $h = @{"Content-Type" = "application/json" }
  if ($token) { $h["Authorization"] = "Bearer $token" }
  $p = @{Uri = "$Base$path"; Method = $method; Headers = $h; SkipHttpErrorCheck = $true; StatusCodeVariable = "sc" }
  if ($null -ne $body) { $p["Body"] = ($body | ConvertTo-Json -Depth 8) }
  $r = Invoke-RestMethod @p
  return @{status = [int]$sc; body = $r }
}
$u = "seed3_$S"
$null = Api POST "/signup" @{name = "Seed"; lastName = "Tres"; userName = $u; email = "$u@test.com"; password = "E2e_Test#12345"; confirmPassword = "E2e_Test#12345" }
$l = Api POST "/login" @{username = $u; password = "E2e_Test#12345" }
$tok = $l.body.data.token
$null = Api PATCH "/User/folio-start" @{folioStart = 1 } $tok
$c = Api POST "/Client" @{name = "Seed"; lastName = "Cli"; phone = "5500000000"; email = "seedcli_$S@test.com" } $tok
$cid = $c.body.data.id
$p1 = (Api POST "/Provider" @{name = "SeedP1 $S"; acronym = "SP1"; email = "sp1_$S@t.com"; phone = "5511"; providerContactName = "C1" } $tok).body.data.id
$p2 = (Api POST "/Provider" @{name = "SeedP2 $S"; acronym = "SP2"; email = "sp2_$S@t.com"; phone = "5522"; providerContactName = "C2" } $tok).body.data.id
$travel = (Get-Date).ToUniversalTime().AddDays(60).ToString("o")
$sw = [Diagnostics.Stopwatch]::StartNew()
1..200 | ForEach-Object {
  $null = Api POST "/Sale" @{clientId = $cid; providers = @(@{providerId = $p1; reservationNumber = "SEED-$S-$_" }); totalAmount = 5000; travelDate = $travel } $tok
  if ($_ % 50 -eq 0) { Write-Host "  $_ ventas..." }
}
$sw.Stop()
Write-Host "SEED 200 ventas en $($sw.Elapsed.TotalSeconds.ToString('N1'))s"
function Time-Get([string]$path, [string]$token) {
  $sw2 = [Diagnostics.Stopwatch]::StartNew()
  $r = Api GET $path $token
  $sw2.Stop()
  return @{ms = $sw2.ElapsedMilliseconds; ok = ($r.body.isSuccess -eq $true); total = $r.body.data.total; count = $r.body.data.items.Count }
}
$m1 = Time-Get "/Sale?page=1&pageSize=20" $tok
$m2 = Time-Get "/Sale?page=10&pageSize=20" $tok
$m3 = Time-Get "/Sale?page=1&pageSize=100" $tok
Write-Host ("SALE p1x20: {0}ms ok={1} total={2} items={3}" -f $m1.ms, $m1.ok, $m1.total, $m1.count)
Write-Host ("SALE p10x20: {0}ms ok={1} items={2}" -f $m2.ms, $m2.ok, $m2.count)
Write-Host ("SALE p1x100: {0}ms ok={1} items={2}" -f $m3.ms, $m3.ok, $m3.count)
$sw3 = [Diagnostics.Stopwatch]::StartNew()
$null = Api GET "/Dashboard/charts/monthly-sales" $tok
$null = Api GET "/Dashboard/charts/monthly-profits" $tok
$null = Api GET "/Dashboard/charts/sales-by-provider" $tok
$sw3.Stop()
$round1 = $sw3.ElapsedMilliseconds
$sw3.Restart()
$null = Api GET "/Dashboard/charts/monthly-sales" $tok
$null = Api GET "/Dashboard/charts/monthly-profits" $tok
$null = Api GET "/Dashboard/charts/sales-by-provider" $tok
$sw3.Stop()
Write-Host ("CHARTS x3 ronda1(fria): {0}ms ronda2(cache): {1}ms" -f $round1, $sw3.ElapsedMilliseconds)
