param([string]$Root='C:/Users/TAN MIE/Downloads/app_Scanner/ScannerHNApp',[string]$Store='D:/ScannerHNApp_Archive_20261001')
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
$patterns=@('gh[pousr]_[A-Za-z0-9]{36,}','github_pat_[A-Za-z0-9_]{60,}','sk-proj-[A-Za-z0-9_-]{40,}','-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----','AKIA[A-Z0-9]{16}')
$alerts=[Collections.Generic.List[object]]::new()
$invalid=[Collections.Generic.List[object]]::new()
$archives=Get-ChildItem -LiteralPath (Join-Path $Root 'handoff') -Recurse -File -Filter '*.zip'
$entries=0
foreach($file in $archives){
 try{$zip=[IO.Compression.ZipFile]::OpenRead($file.FullName)}catch{$invalid.Add(@{file=$file.FullName;bytes=$file.Length;reason='Incomplete ZIP central directory; retain original bytes'});continue}
 try{foreach($entry in $zip.Entries){
  if($entry.FullName -notmatch '\.(trace|network|stacks|json|har|txt|log|js|mjs|html|md)$'){continue}
  if($entry.Length -gt 80MB){throw "Oversized text entry requires review: $($file.Name) / $($entry.FullName)"}
  $reader=[IO.StreamReader]::new($entry.Open())
  try{$text=$reader.ReadToEnd()}finally{$reader.Dispose()}
  $entries++
  foreach($pattern in $patterns){if($text -match $pattern){$alerts.Add(@{file=$file.FullName;entry=$entry.FullName;kind=$pattern});break}}
 }}finally{$zip.Dispose()}
}
$result=@{archives=$archives.Count;textEntries=$entries;alerts=@($alerts.ToArray());invalidArchives=@($invalid.ToArray());scannedAt=[DateTime]::UtcNow.ToString('o');scope='Known credential/private-key signatures in readable trace text entries; incomplete ZIPs explicitly listed; no values emitted'}
$result|ConvertTo-Json -Depth 5|Set-Content -LiteralPath (Join-Path $Store 'staging/trace-secret-scan.json') -Encoding utf8
Write-Output "Scanned $($archives.Count) archives, $entries text entries, $($alerts.Count) alerts, $($invalid.Count) incomplete archives"
if($alerts.Count){exit 1}
