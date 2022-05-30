Set-Location $PSScriptRoot;
try {
    $creds = Import-Clixml './auth.xml';
    $data = @{UserName=$creds.UserName;Password=($creds.getNetworkCredential().Password);LanguageCode='ENU'};
    $url = "http://ottansm2/api/V3/Authorization/GetToken";

    $data = $data | ConvertTo-JSON;

    $r = Invoke-WebRequest -Uri $url -Method 'POST' -ContentType 'application/json' -Body $data -UseDefaultCredentials;
    if ($r) {
        Write-Host $r.Content;
    } else {
        Write-Host "Flopped";
    }
} catch {
    "ERROR $_" > output/error.txt;
    Write-Host "Flopped";
}