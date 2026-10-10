# E2E SaaS: aislamiento multi-tenant via API Gateway (http://localhost:5050)
# 2 tenants, 3 proveedores c/u, 5 ventas + bateria de seguridad cross-tenant.
$ErrorActionPreference = "Stop"
$Base = "http://localhost:5050"
$S = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$global:pass = 0; $global:fail = 0
function Check([string]$name, [bool]$cond, [string]$detail = "") {
  if ($cond) { $global:pass++; Write-Host "  PASS $name" }
  else { $global:fail++; Write-Host "  FAIL $name $detail" }
}
function Api([string]$method, [string]$path, $body = $null, [string]$token = $null) {
  if ($method -eq "GET" -and $body -is [string]) { $token = $body; $body = $null }
  $h = @{"Content-Type" = "application/json" }
  if ($token) { $h["Authorization"] = "Bearer $token" }
  $p = @{Uri = "$Base$path"; Method = $method; Headers = $h; SkipHttpErrorCheck = $true; StatusCodeVariable = "sc" }
  if ($null -ne $body) { $p["Body"] = ($body | ConvertTo-Json -Depth 8) }
  $r = Invoke-RestMethod @p
  return @{status = [int]$sc; body = $r }
}
function Ok($r) { return ($null -ne $r.body -and $r.body.isSuccess -eq $true) }
function Jwt($token) {
  $seg = $token.Split('.')[1].Replace('-', '+').Replace('_', '/')
  switch ($seg.Length % 4) { 2 { $seg += '==' } 3 { $seg += '=' } }
  return [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($seg)) | ConvertFrom-Json
}
function New-User([string]$tag) {
  $u = "e2e_${tag}_$S"; $p = "E2e_Test#12345"
  $s = Api POST "/signup" @{name = "E2E"; lastName = $tag; userName = $u; email = "$u@test.com"; password = $p; confirmPassword = $p }
  Check "signup $tag" (Ok $s) ($s.body.message)
  $l = Api POST "/login" @{username = $u; password = $p; rememberMe = $false }
  Check "login $tag" (Ok $l) ($l.body.message)
  $tok = $l.body.data.token
  $claims = Jwt $tok
  return @{user = $u; pass = $p; token = $tok; accountId = $claims.accountId; role = $claims.role }
}
function New-Provider($tok, [string]$name, [string]$email) {
  $r = Api POST "/Provider" @{name = $name; acronym = $name.Substring(0, 3).ToUpper(); email = $email; phone = "5512345678"; providerContactName = "Contacto $name"; depositPercentage = 30; finalPaymentDaysBefore = 7; profitPercentage = 15 } $tok
  Check "provider $name" (Ok $r) ($r.body.message)
  return $r.body.data.id
}
function New-Client($tok, [string]$tag) {
  $r = Api POST "/Client" @{name = "Cli"; lastName = $tag; address = "Calle 123"; phone = "+56912345678"; email = "cli_${tag}_$S@test.com"; birthDate = "1990-05-15" } $tok
  Check "client $tag" (Ok $r) ($r.body.message)
  return $r.body.data.id
}
function New-Sale($tok, $clientId, $providers, $total, $deposit, $res) {
  $travel = (Get-Date).ToUniversalTime().AddDays(60).ToString("o")
  $ret = (Get-Date).ToUniversalTime().AddDays(67).ToString("o")
  $due = (Get-Date).ToUniversalTime().AddDays(30).ToString("o")
  $b = @{clientId = $clientId; providers = $providers; description = "E2E $res"; totalAmount = $total; isDollar = $false; profitPercentage = 10; requiredDeposit = $deposit; finalPaymentDueDate = $due; travelDate = $travel; returnDate = $ret }
  $r = Api POST "/Sale" $b $tok
  Check "sale $res" (Ok $r) ($r.body.message)
  return $r.body.data.id
}

Write-Output "== 1. Alta y login de 2 tenants =="
$A = New-User "a"; $B = New-User "b"
Check "accountIds distintos" ($A.accountId -ne $B.accountId) "$($A.accountId) vs $($B.accountId)"
Check "roles owner" ($A.role -eq "owner" -and $B.role -eq "owner")

Write-Output "== 2. Folio inicial por cuenta (gateway PATCH) =="
$fA = Api PATCH "/User/folio-start" @{folioStart = 1000 } $A.token
$fB = Api PATCH "/User/folio-start" @{folioStart = 5000 } $B.token
Check "folio A=1000" (Ok $fA) ($fA.body.message)
Check "folio B=5000" (Ok $fB) ($fB.body.message)

Write-Output "== 3. Proveedores (3 por tenant) =="
$PA = @(); $PB = @()
1..3 | ForEach-Object { $PA += New-Provider $A.token "ProvA$($_)_$S" "pa$($_)_$S@test.com" }
1..3 | ForEach-Object { $PB += New-Provider $B.token "ProvB$($_)_$S" "pb$($_)_$S@test.com" }

Write-Output "== 4. Clientes =="
$CA = New-Client $A.token "TenantA$S"; $CB = New-Client $B.token "TenantB$S"

Write-Output "== 5. Ventas (5) =="
$SA1 = New-Sale $A.token $CA @(@{providerId = $PA[0]; reservationNumber = "RESA1-$S" }) 10000 2000 "SA1"
$SA2 = New-Sale $A.token $CA @(@{providerId = $PA[1]; reservationNumber = "RESA2-$S" }) 8000 $null "SA2"
$SA3 = New-Sale $A.token $CA @(@{providerId = $PA[0]; reservationNumber = "RESA3a-$S" }, @{providerId = $PA[2]; reservationNumber = "RESA3b-$S" }) 12000 $null "SA3-multi"
$SB1 = New-Sale $B.token $CB @(@{providerId = $PB[0]; reservationNumber = "RESB1-$S" }) 9000 1000 "SB1"
$SB2 = New-Sale $B.token $CB @(@{providerId = $PB[1]; reservationNumber = "RESB2a-$S" }, @{providerId = $PB[2]; reservationNumber = "RESB2b-$S" }) 7000 $null "SB2-multi"
$saleA = @($SA1, $SA2, $SA3); $saleB = @($SB1, $SB2)

Write-Output "== 6. Pago explicito + secuencia de folios por cuenta =="
$pay = Api POST "/Payment" @{saleId = $SA2; paymentDate = (Get-Date).ToUniversalTime().ToString("o"); amount = 500; notes = "abono e2e" } $A.token
Check "pago en SA2" (Ok $pay) ($pay.body.message)
$lpA = Api GET "/Payment?saleId=$SA1" $A.token
$lpA2 = Api GET "/Payment?saleId=$SA2" $A.token
$lpB = Api GET "/Payment?saleId=$SB1" $B.token
$folioA1 = ($lpA.body.data.items | Select-Object -First 1).folioNumber
$folioA2 = ($lpA2.body.data.items | Select-Object -First 1).folioNumber
$folioB1 = ($lpB.body.data.items | Select-Object -First 1).folioNumber
Check "folio A inicia en 1000" ($folioA1 -eq 1000) "fue $folioA1"
Check "folio A segundo es 1001" ($folioA2 -eq 1001) "fue $folioA2"
Check "folio B inicia en 5000" ($folioB1 -eq 5000) "fue $folioB1"

Write-Output "== 7. AgencyInfo aislada =="
$gA = Api PUT "/AgencyInfo" @{name = "Agencia A $S"; phone = "111"; email = "a_$S@t.com" } $A.token
$gB = Api PUT "/AgencyInfo" @{name = "Agencia B $S"; phone = "222"; email = "b_$S@t.com" } $B.token
Check "agency A" (Ok $gA) ($gA.body.message)
Check "agency B" (Ok $gB) ($gB.body.message)
$rA = Api GET "/AgencyInfo" $A.token; $rB = Api GET "/AgencyInfo" $B.token
Check "A ve su agencia" ($rA.body.data.name -eq "Agencia A $S")
Check "B ve su agencia" ($rB.body.data.name -eq "Agencia B $S")

Write-Output "== 8. Subcuenta hereda tenant + owner-only =="
$sub = Api POST "/User/subaccounts" @{name = "Sub"; lastName = "Uno"; userName = "e2e_sub_$S"; email = "sub_$S@test.com"; password = "E2e_Test#12345"; confirmPassword = "E2e_Test#12345" } $A.token
Check "crear subcuenta" (Ok $sub) ($sub.body.message)
$sl = Api POST "/login" @{username = "e2e_sub_$S"; password = "E2e_Test#12345"; rememberMe = $false }
Check "login subcuenta" (Ok $sl)
$subTok = $sl.body.data.token
$subSales = Api GET "/Sale" $subTok
$subIds = @($subSales.body.data.items | ForEach-Object { $_.id })
Check "subcuenta ve ventas de A" ((($subIds | Sort-Object) -join ",") -eq ((($saleA | Sort-Object) -join ","))) ($subIds -join ",")
$subFolio = Api PATCH "/User/folio-start" @{folioStart = 9 } $subTok
Check "subcuenta NO configura folio" (-not (Ok $subFolio))
$subAg = Api PUT "/AgencyInfo" @{name = "Hack $S" } $subTok
Check "subcuenta NO edita agencia" (-not (Ok $subAg))

Write-Output "== 9. Listados solo propios =="
$lCA = Api GET "/Client" $A.token; $lCB = Api GET "/Client" $B.token
Check "A lista 1 cliente propio" (($lCA.body.data.items.Count -eq 1) -and ($lCA.body.data.items[0].id -eq $CA))
Check "B lista 1 cliente propio" (($lCB.body.data.items.Count -eq 1) -and ($lCB.body.data.items[0].id -eq $CB))
$lPA = Api GET "/Provider" $A.token; $lPB = Api GET "/Provider" $B.token
Check "A lista 3 proveedores" ($lPA.body.data.items.Count -eq 3)
Check "B lista 3 proveedores" ($lPB.body.data.items.Count -eq 3)
$lSA = Api GET "/Sale" $A.token; $lSB = Api GET "/Sale" $B.token
$aIds = @($lSA.body.data.items | ForEach-Object { $_.id } | Sort-Object); $bIds = @($lSB.body.data.items | ForEach-Object { $_.id } | Sort-Object)
Check "A lista sus 3 ventas" (($aIds -join ",") -eq ((($saleA | Sort-Object) -join ",")))
Check "B lista sus 2 ventas" (($bIds -join ",") -eq ((($saleB | Sort-Object) -join ",")))

Write-Output "== 10. Lectura cross-tenant prohibida =="
Check "B NO lee cliente A" (-not (Ok (Api GET "/Client/$CA" $B.token)))
Check "B NO lee proveedor A" (-not (Ok (Api GET "/Provider/$($PA[0])" $B.token)))
Check "B NO lee venta A" (-not (Ok (Api GET "/Sale/$SA1" $B.token)))
$payIdA = ($lpA.body.data.items | Select-Object -First 1).id
Check "B NO lee pago A" (-not (Ok (Api GET "/Payment/$payIdA" $B.token)))
Check "A NO lee venta B" (-not (Ok (Api GET "/Sale/$SB1" $A.token)))
$lpCross = Api GET "/Payment?saleId=$SA1" $B.token
Check "B pagos de venta A = vacio" ((Ok $lpCross) -and ($lpCross.body.data.items.Count -eq 0))

Write-Output "== 11. Mutacion cross-tenant prohibida =="
$uCli = Api PUT "/Client/$CA" @{name = "Hack"; lastName = "X"; phone = "000"; email = "hack_$S@t.com" } $B.token
Check "B NO edita cliente A" (-not (Ok $uCli))
$uSale = Api PUT "/Sale/$SA1" @{clientId = $CB; providers = @(@{providerId = $PB[0]; reservationNumber = "HACK" }); totalAmount = 1; travelDate = (Get-Date).ToUniversalTime().AddDays(60).ToString("o"); active = $true } $B.token
Check "B NO edita venta A" (-not (Ok $uSale))
$dSale = Api DELETE "/Sale/$SA1" $B.token
Check "B NO elimina venta A" (-not (Ok $dSale))
$dProv = Api DELETE "/Provider/$($PA[0])" $B.token
Check "B NO elimina proveedor A" (-not (Ok $dProv))
$xPay = Api POST "/Payment" @{saleId = $SA1; paymentDate = (Get-Date).ToUniversalTime().ToString("o"); amount = 100 } $B.token
Check "B NO paga venta A" (-not (Ok $xPay))
$still = Api GET "/Sale/$SA1" $A.token
Check "venta A intacta" (Ok $still)

Write-Output "== 12. Dashboard aislado =="
$dA = Api GET "/Dashboard/cards" $A.token; $dB = Api GET "/Dashboard/cards" $B.token
Check "dashboard A ok" (Ok $dA); Check "dashboard B ok" (Ok $dB)
$pendA = @($dA.body.data.pendingSettlementSales | ForEach-Object { $_.id })
$pendB = @($dB.body.data.pendingSettlementSales | ForEach-Object { $_.id })
$leakA = @($pendA | Where-Object { $saleB -contains $_ })
$leakB = @($pendB | Where-Object { $saleA -contains $_ })
Check "dashboard A sin ventas B" ($leakA.Count -eq 0)
Check "dashboard B sin ventas A" ($leakB.Count -eq 0)

Write-Output "== 13. Sin token = 401 =="
$noAuth = Api GET "/Sale"
Check "sin token rechazado" ($noAuth.status -eq 401) "status $($noAuth.status)"

Write-Output "== 14. Paginacion (Fase 3) =="
$p1 = Api GET "/Sale?page=1&pageSize=2" $A.token
$p2 = Api GET "/Sale?page=2&pageSize=2" $A.token
Check "pagina 1: 2 items" ((Ok $p1) -and ($p1.body.data.items.Count -eq 2)) ""
Check "pagina 1: total 3" ($p1.body.data.total -eq 3) "total $($p1.body.data.total)"
Check "pagina 1: totalPages 2" ($p1.body.data.totalPages -eq 2) ""
Check "pagina 2: 1 item" ((Ok $p2) -and ($p2.body.data.items.Count -eq 1)) ""
Check "paginas sin solape" ((($p1.body.data.items.id) | Where-Object { ($p2.body.data.items.id) -contains $_ }).Count -eq 0) ""
$pBig = Api GET "/Sale?page=1&pageSize=500" $A.token
Check "pageSize cap 100" ((Ok $pBig) -and ($pBig.body.data.pageSize -eq 100)) "pageSize $($pBig.body.data.pageSize)"
$pCli = Api GET "/Client?page=1&pageSize=1" $B.token
Check "clientes paginado" ((Ok $pCli) -and ($pCli.body.data.total -eq 1) -and ($pCli.body.data.items.Count -eq 1)) ""

Write-Output ""
Write-Output "RESULTADO: $global:pass pass, $global:fail fail"
if ($global:fail -gt 0) { exit 1 }
