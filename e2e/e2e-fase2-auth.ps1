# Puerta Fase 2: anti-enumeracion por timing, rate limiting 429, body sin refreshToken.
$ErrorActionPreference = "Stop"
$Base = "http://localhost:5050"
$global:pass = 0; $global:fail = 0
function Check([string]$name, [bool]$cond, [string]$detail = "") {
  if ($cond) { $global:pass++; Write-Host "  PASS $name" }
  else { $global:fail++; Write-Host "  FAIL $name $detail" }
}
function Login-Code([string]$user, [string]$pass) {
  $p = @{Uri = "$Base/login"; Method = "POST"; ContentType = "application/json";
    Body = (@{username = $user; password = $pass } | ConvertTo-Json);
    SkipHttpErrorCheck = $true; StatusCodeVariable = "sc" }
  $r = Invoke-RestMethod @p
  return @{status = [int]$sc; body = $r }
}
function Login-Time([string]$user, [string]$pass) {
  $sw = [Diagnostics.Stopwatch]::StartNew()
  $null = Login-Code $user $pass
  $sw.Stop()
  return $sw.ElapsedMilliseconds
}

Write-Host "== 2.3 login body sin refreshToken =="
$S = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$u = "f2rate_$S"
$null = Invoke-RestMethod -Uri "$Base/signup" -Method POST -ContentType "application/json" -Body (@{name = "F2"; lastName = "R"; userName = $u; email = "$u@test.com"; password = "E2e_Test#12345"; confirmPassword = "E2e_Test#12345" } | ConvertTo-Json)
$raw = Invoke-WebRequest -Uri "$Base/login" -Method POST -ContentType "application/json" -Body (@{username = $u; password = "E2e_Test#12345" } | ConvertTo-Json) -SkipHttpErrorCheck -UseBasicParsing
Check "login 200" ($raw.StatusCode -eq 200) "status $($raw.StatusCode)"
Check "body sin refreshToken" ($raw.Content -notmatch "refreshToken") ""
Check "body con token" ($raw.Content -match '"token"') ""

Write-Host "== 2.2 timing existente vs inexistente =="
$tExist = 1..5 | ForEach-Object { Login-Time $u "Wrong#12345" }
Start-Sleep -Seconds 2
$tGhost = 1..5 | ForEach-Object { Login-Time "nadie_existe_$S" "Wrong#12345" }
$avgE = ($tExist | Measure-Object -Average).Average
$avgG = ($tGhost | Measure-Object -Average).Average
$delta = [Math]::Abs($avgE - $avgG)
Write-Host ("  existente={0:N0}ms inexistente={1:N0}ms delta={2:N0}ms" -f $avgE, $avgG, $delta)
Check "delta < 200ms" ($delta -lt 200) ""

Write-Host "== 2.1 rate limiting (35 intentos malos) =="
$codes = 1..35 | ForEach-Object { (Login-Code $u "Wrong#12345").status }
$n429 = @($codes | Where-Object { $_ -eq 429 }).Count
Write-Host "  statuses: $(($codes | Group-Object | ForEach-Object { "$($_.Name)x$($_.Count)" }) -join ' ')"
Check "hay 429s" ($n429 -ge 5) "solo $n429"
$r429 = Login-Code $u "Wrong#12345"
Check "429 con envelope" ($r429.body.message -match "Demasiados intentos") "$($r429.body.message)"

Write-Host ""
Write-Host "RESULTADO: $global:pass pass, $global:fail fail"
if ($global:fail -gt 0) { exit 1 }
