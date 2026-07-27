$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$srcRoot = 'C:\Users\meishaonvzhanshi\Desktop\Portfolio'
$repoRoot = 'D:\Samuel-工作文件夹\codex-web'
$publicRoot = Join-Path $repoRoot 'public\portfolio'
$sourceOut = Join-Path $publicRoot 'source'
$thumbOut = Join-Path $publicRoot 'thumbs'

New-Item -ItemType Directory -Force -Path $sourceOut | Out-Null
New-Item -ItemType Directory -Force -Path $thumbOut | Out-Null

function To-Slug([string]$text) {
  $s = $text.ToLowerInvariant()
  $s = $s.Replace([string][char]0x2019, '')
  $s = $s.Replace("'", '')
  $s = $s -replace '[^a-z0-9\u4e00-\u9fff]+', '-'
  $s = $s.Trim('-')
  if ([string]::IsNullOrWhiteSpace($s)) { $s = 'work' }
  return $s
}

function Clean-Base([string]$name) {
  $base = [System.IO.Path]::GetFileNameWithoutExtension($name)
  $base = $base -replace '(?i)\s*banner\s*', ' '
  $base = $base -replace '(?i)[-_ ]?(1080\s*x\s*1080|1181\s*x\s*351|1181x351|589\s*x\s*200|589x200|1024\s*x\s*512|1024x512|1200\s*x\s*630|1200x630|1200pixbb|1080x567|1080x1080|1200x600)', ' '
  $base = $base -replace '(?i)[-_ ]?(260\d+|25-\d+-\d+|251\d+|281120|60122|060401|15offttmsy|50offttmsy|umart|像素|b|c|d|a)$', ' '
  $base = $base -replace '(?i)[-_ ]?(260\d+|25-\d+-\d+|251\d+|281120|60122|060401|15offttmsy|50offttmsy)', ' '
  $base = $base -replace '\s+', ' '
  return $base.Trim(' ', '-', '_')
}

function Group-Key([string]$name) {
  $base = Clean-Base $name
  $lower = $base.ToLowerInvariant()
  if ($lower -match 'boxing') { return 'boxing-day-retail-campaign' }
  if ($lower -match 'christmas') { return 'christmas-sale-system' }
  if ($lower -match 'easter') { return 'easter-retail-campaign' }
  if ($lower -match 'eofy' -and $lower -match 'tt') { return 'tt-eofy-coupon-system' }
  if ($lower -match 'eofy' -and $lower -match 'msy') { return 'msy-eofy-coupon-system' }
  if ($lower -match 'eofy' -and $lower -match 'samsung') { return 'samsung-odyssey-eofy-sale' }
  if ($lower -match 'eofy') { return 'umart-eofy-sale-system' }
  if ($lower -match 'games workshop|warhammer') { return 'warhammer-40000-campaign' }
  if ($lower -match 'gigabyte') { return 'gigabyte-laptops-monitor-bundle' }
  if ($lower -match '^hp') { return 'hp-product-retail-campaign' }
  if ($lower -match 'labour') { return 'labour-day-campaign' }
  if ($lower -match 'mum|mother') { return 'mothers-day-retail-story' }
  if ($lower -match 'msi gpu') { return 'msi-gpu-giveaway' }
  if ($lower -match 'custom pc') { return 'msy-custom-pc-builder' }
  if ($lower -match 'odyssey oled') { return 'samsung-odyssey-oled-g8' }
  if ($lower -match 'pax') { return 'pax-gaming-sale-system' }
  if ($lower -match 'supergirl') { return 'supergirl-limited-edition' }
  if ($lower -match 'terramaster') { return 'terramaster-storage-campaign' }
  if ($lower -match 'thermal grizzly') { return 'thermal-grizzly-bfcm' }
  if ($lower -match 'tuf gaming') { return 'tuf-gaming-monitor-campaign' }
  if ($lower -match 'ai') { return 'umart-ai-pc-campaign' }
  if ($lower -match 'back to school') { return 'back-to-school-sale' }
  if ($lower -match 'uber') { return 'umart-uber-delivery-campaign' }
  if ($lower -match 'king') { return 'kings-birthday-holiday-notice' }
  if ($lower -match 'melbourne') { return 'melbourne-cup-holiday-notice' }
  if ($lower -match 'side') { return 'umart-side-banner-system' }
  if ($lower -match 'edm') { return To-Slug $base }
  if ($lower -match '光榮|仁王') { return 'nioh-3-game-collaboration' }
  return To-Slug $base
}

function Project-Title([string]$key) {
  $map = @{
    'back-to-school-sale' = 'Back to School 开学季视觉'
    'boxing-day-retail-campaign' = 'Boxing Day 零售活动视觉'
    'christmas-sale-system' = 'Christmas Sale 节日促销系统'
    'easter-retail-campaign' = 'Easter Sale 活动视觉'
    'edm-25-10-30' = '十月 EDM 长页面视觉'
    'edm-25-8-21' = '八月 EDM 长页面视觉'
    'gigabyte-laptops-monitor-bundle' = 'Gigabyte 笔记本与显示器套装视觉'
    'hp-product-retail-campaign' = 'HP 产品零售活动视觉'
    'kings-birthday-holiday-notice' = 'King''s Birthday 假日通知视觉'
    'labour-day-campaign' = 'Labour Day 假日活动视觉'
    'melbourne-cup-holiday-notice' = 'Melbourne Cup 假日通知视觉'
    'mothers-day-retail-story' = 'Mother''s Day 母亲节零售视觉'
    'msi-gpu-giveaway' = 'MSI GPU Giveaway 活动视觉'
    'msy-custom-pc-builder' = 'MSY Custom PC Builder 视觉'
    'msy-eofy-coupon-system' = 'MSY EOFY 优惠券视觉'
    'nioh-3-game-collaboration' = '仁王3 游戏联名活动视觉'
    'pax-gaming-sale-system' = 'PAX 游戏展促销视觉'
    'samsung-odyssey-eofy-sale' = 'Samsung Odyssey EOFY 销售视觉'
    'samsung-odyssey-oled-g8' = 'Samsung Odyssey OLED G8 产品视觉'
    'supergirl-limited-edition' = 'Supergirl Limited Edition 游戏视觉'
    'terramaster-storage-campaign' = 'TerraMaster 存储产品视觉'
    'thermal-grizzly-bfcm' = 'Thermal Grizzly BFCM 促销视觉'
    'tt-eofy-coupon-system' = 'Thermaltake EOFY 优惠券视觉'
    'tuf-gaming-monitor-campaign' = 'TUF Gaming 显示器活动视觉'
    'umart-ai-pc-campaign' = 'Umart AI PC 活动视觉'
    'umart-eofy-sale-system' = 'Umart EOFY 促销视觉系统'
    'umart-side-banner-system' = 'Umart 侧边栏广告视觉'
    'umart-uber-delivery-campaign' = 'Umart Uber Delivery 服务视觉'
    'warhammer-40000-campaign' = 'Warhammer 40,000 游戏活动视觉'
  }
  if ($map.ContainsKey($key)) { return $map[$key] }
  return (($key -replace '-', ' ') -replace '\b(\w)', { $args[0].Value.ToUpper() })
}

function Category-For([string]$key) {
  if ($key -match 'edm|builder') { return 'UI / 网页视觉' }
  if ($key -match 'odyssey|gigabyte|hp|terramaster|thermal|tuf|msi|asus|pc|gpu|storage') { return '数码产品视觉' }
  if ($key -match 'holiday|birthday|melbourne|labour') { return '品牌信息视觉' }
  if ($key -match 'christmas|easter|boxing|eofy|school|pax|mother|uber') { return '电商活动视觉' }
  if ($key -match 'warhammer|nioh|supergirl') { return '游戏联名视觉' }
  return '综合视觉实验'
}

function Client-For([string]$key) {
  if ($key -match 'msy') { return 'MSY' }
  if ($key -match 'samsung|odyssey') { return 'Samsung' }
  if ($key -match 'gigabyte') { return 'Gigabyte' }
  if ($key -match 'hp') { return 'HP' }
  if ($key -match 'terramaster') { return 'TerraMaster' }
  if ($key -match 'thermal') { return 'Thermal Grizzly' }
  if ($key -match 'tuf|asus') { return 'ASUS' }
  if ($key -match 'tt-') { return 'Thermaltake' }
  if ($key -match 'warhammer') { return 'Games Workshop' }
  if ($key -match 'nioh') { return 'Koei Tecmo' }
  if ($key -match 'msi') { return 'MSI' }
  return 'Umart'
}

function Tags-For([string]$category) {
  if ($category -eq '数码产品视觉') { return @('产品视觉', '促销系统', '数码科技') }
  if ($category -eq 'UI / 网页视觉') { return @('网页视觉', '信息层级', '活动页面') }
  if ($category -eq '游戏联名视觉') { return @('游戏视觉', '联名活动', '社媒传播') }
  if ($category -eq '品牌信息视觉') { return @('品牌信息', '通知视觉', '版式设计') }
  if ($category -eq '电商活动视觉') { return @('活动主视觉', '促销设计', '多尺寸延展') }
  return @('视觉设计', '电商视觉', '版式实验')
}

$files = Get-ChildItem -LiteralPath $srcRoot -Recurse -File |
  Where-Object { $_.Extension -match '^\.(png|jpg|jpeg|webp)$' } |
  Sort-Object Name

$groups = @{}
foreach ($file in $files) {
  $key = Group-Key $file.Name
  if (-not $groups.ContainsKey($key)) { $groups[$key] = @() }
  $groups[$key] += $file
}

$projects = @()
foreach ($key in ($groups.Keys | Sort-Object)) {
  $entries = @()
  foreach ($file in ($groups[$key] | Sort-Object Name)) {
    $slugName = To-Slug ([System.IO.Path]::GetFileNameWithoutExtension($file.Name))
    $ext = $file.Extension.ToLowerInvariant()
    if ($ext -eq '.jpeg') { $ext = '.jpg' }
    $destName = "$slugName$ext"
    $dest = Join-Path $sourceOut $destName
    Copy-Item -LiteralPath $file.FullName -Destination $dest -Force

    $img = [System.Drawing.Image]::FromFile($file.FullName)
    $entries += [PSCustomObject]@{
      path = "/portfolio/source/$destName"
      width = $img.Width
      height = $img.Height
      ratio = [math]::Round($img.Width / $img.Height, 3)
      name = $file.Name
    }
    $img.Dispose()
  }

  $preferred = $entries | Where-Object { [math]::Abs($_.ratio - 1) -lt 0.03 } | Select-Object -First 1
  if (-not $preferred) {
    $preferred = $entries | Sort-Object @{ Expression = { [math]::Abs($_.ratio - 1) } } | Select-Object -First 1
  }

  $sourcePath = Join-Path (Join-Path $repoRoot 'public') ($preferred.path.TrimStart('/') -replace '/', '\')
  $thumbName = "$key.jpg"
  $thumbPath = Join-Path $thumbOut $thumbName
  $srcImg = [System.Drawing.Image]::FromFile($sourcePath)
  $side = [Math]::Min($srcImg.Width, $srcImg.Height)
  $sx = [Math]::Floor(($srcImg.Width - $side) / 2)
  $sy = [Math]::Floor(($srcImg.Height - $side) / 2)
  $bmp = New-Object System.Drawing.Bitmap 900, 900
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.DrawImage(
    $srcImg,
    (New-Object System.Drawing.Rectangle 0, 0, 900, 900),
    (New-Object System.Drawing.Rectangle $sx, $sy, $side, $side),
    [System.Drawing.GraphicsUnit]::Pixel
  )
  $bmp.Save($thumbPath, [System.Drawing.Imaging.ImageFormat]::Jpeg)
  $g.Dispose()
  $bmp.Dispose()
  $srcImg.Dispose()

  $category = Category-For $key
  $client = Client-For $key
  $tags = Tags-For $category
  $title = Project-Title $key
  $projects += [PSCustomObject]@{
    slug = $key
    title = $title
    titleCn = $title
    year = '2026'
    client = $client
    category = $category
    zone = $category
    region = '视觉设计'
    tags = $tags
    services = $tags
    cover = "/portfolio/thumbs/$thumbName"
    alt = $preferred.path
    images = @($entries | ForEach-Object { $_.path })
    summary = "围绕$title建立的视觉设计项目，重点处理活动主题、产品卖点、信息层级和多尺寸传播的一致性。"
    summaryCn = "围绕$title建立的视觉设计项目，重点处理活动主题、产品卖点、信息层级和多尺寸传播的一致性。"
    description = "该项目以招聘作品集的展示标准重新整理：从画面内容判断项目目标，并将封面、横幅、社媒方图或长页面归并为同一个视觉系统。设计重点包括主视觉记忆点、产品信息优先级、促销利益点表达、品牌调性延展以及不同投放尺寸之间的统一。"
    descriptionCn = "该项目以招聘作品集的展示标准重新整理：从画面内容判断项目目标，并将封面、横幅、社媒方图或长页面归并为同一个视觉系统。设计重点包括主视觉记忆点、产品信息优先级、促销利益点表达、品牌调性延展以及不同投放尺寸之间的统一。"
    role = '视觉方向、版式设计、活动主视觉、多尺寸延展'
  }
}

$json = $projects | ConvertTo-Json -Depth 8
[System.IO.File]::WriteAllText((Join-Path $repoRoot 'content\projects.json'), $json, [System.Text.UTF8Encoding]::new($false))
"PROJECTS=$($projects.Count); IMAGES=$($files.Count)"


