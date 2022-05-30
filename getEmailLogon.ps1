cd $PSScriptRoot;
$auth = Import-Clixml "emailAuth.xml";
$data = @{user=$auth.UserName; pass=$auth.GetNetworkCredential().Password} | ConvertTo-Json;
Write-Host $data;