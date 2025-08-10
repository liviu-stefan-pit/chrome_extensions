$ErrorActionPreference = 'Stop'
$Base = 'c:\prod\MyChromeExtensions\slang-tutor\public\icons'
New-Item -ItemType Directory -Path $Base -Force | Out-Null

Add-Type -AssemblyName System.Drawing
$bg = [System.Drawing.Color]::FromArgb(12,74,110)   # slate/sky
$fg = [System.Drawing.Color]::FromArgb(255,255,255) # white text

$sizes = 16,32,48,128
foreach ($s in $sizes) {
  $bmp = New-Object System.Drawing.Bitmap($s, $s)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.Clear($bg)

  $text = 'ST'
  $fontSize = [Math]::Max(10, [Math]::Floor($s * 0.5))
  $font = New-Object System.Drawing.Font('Segoe UI', $fontSize, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
  $format = New-Object System.Drawing.StringFormat
  $format.Alignment = [System.Drawing.StringAlignment]::Center
  $format.LineAlignment = [System.Drawing.StringAlignment]::Center
  $brush = New-Object System.Drawing.SolidBrush($fg)
  $rect = New-Object System.Drawing.RectangleF(0, 0, $s, $s)
  $g.DrawString($text, $font, $brush, $rect, $format)

  $brush.Dispose(); $font.Dispose(); $format.Dispose(); $g.Dispose()

  $out = Join-Path $Base ("icon{0}.png" -f $s)
  $bmp.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
}
