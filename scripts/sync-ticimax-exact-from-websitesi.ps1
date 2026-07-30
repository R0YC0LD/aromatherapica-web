# Sync WebSitesi zmetik HAZIR-KURULUM (canli-exact) → public/ticimax/final
$ErrorActionPreference = "Stop"
$src = "C:\Users\ongor\OneDrive\Desktop\WebSitesi\zmetik\zmetik\Ticimax\HAZIR-KURULUM"
$kat = "C:\Users\ongor\OneDrive\Desktop\WebSitesi\zmetik\zmetik\Ticimax\kategori-bloklari"
$emblemSrc = "C:\Users\ongor\OneDrive\Desktop\WebSitesi\FINAL_TICIMAX_SITE\assets\aromatherapica-emblem.png"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$dst = Join-Path $root "public\ticimax"
$final = Join-Path $dst "final"
$katDst = Join-Path $dst "kategori-bloklari"
$assets = Join-Path $dst "assets"

if (-not (Test-Path $src)) { throw "WebSitesi HAZIR-KURULUM bulunamadı: $src" }

New-Item -ItemType Directory -Force -Path $final, $katDst, $assets | Out-Null

$map = [ordered]@{
  "01-tum-sayfalar-canli-exact.txt" = "01-tum-sayfalar.txt"
  "02-anasayfa-canli-exact.txt"     = "02-anasayfa.txt"
  "03-kategori.txt"                 = "03-kategori.txt"
  "04-marka.txt"                    = "04-marka.txt"
  "05-urun-detay.txt"               = "05-urun-detay.txt"
  "06-siparis-tamamlandi.txt"       = "06-siparis-tamamlandi.txt"
  "07-sepet.txt"                    = "07-sepet.txt"
  "08-uye-ol-sayfasi.txt"           = "08-uye-ol-sayfasi.txt"
  "09-uyelik-tamamlandi.txt"        = "09-uyelik-tamamlandi.txt"
  "13-arama.txt"                    = "13-arama.txt"
  "14-siparis-tamamla.txt"          = "14-siparis-tamamla.txt"
}

foreach ($entry in $map.GetEnumerator()) {
  Copy-Item -LiteralPath (Join-Path $src $entry.Key) -Destination (Join-Path $final $entry.Value) -Force
}

$header = @"
<!-- Aromatherapica / Ticimax – Tüm Sayfalar Header (WebSitesi birebir) -->
<meta name="theme-color" content="#082f6b">
<meta name="color-scheme" content="light">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Italiana&display=swap" rel="stylesheet">
<script>
document.documentElement.classList.add("ar-exact-shell");
</script>
"@
[System.IO.File]::WriteAllText((Join-Path $final "10-tum-sayfalar-header.txt"), $header.TrimStart() + "`r`n", [System.Text.UTF8Encoding]::new($false))

Copy-Item -Path (Join-Path $kat "*") -Destination $katDst -Force
if (Test-Path $emblemSrc) {
  Copy-Item -LiteralPath $emblemSrc -Destination (Join-Path $assets "aromatherapica-emblem.png") -Force
}

$sums = Get-ChildItem -LiteralPath $final -File |
  Where-Object { $_.Name -ne "SHA256SUMS.txt" } |
  Sort-Object Name |
  ForEach-Object {
    $hash = (Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash.ToLowerInvariant()
    "$hash  $($_.Name)"
  }
[System.IO.File]::WriteAllText((Join-Path $final "SHA256SUMS.txt"), ($sums -join "`r`n") + "`r`n", [System.Text.UTF8Encoding]::new($false))

Write-Host "Synced WebSitesi exact theme → $final"
