Set-Location $PSScriptRoot;
try {
    $creds = Import-Clixml './auth.xml';
    $data = @{UserName=$creds.UserName;Password=($creds.getNetworkCredential().Password);LanguageCode='ENU'};
    $url = "https://services/api/V3/Authorization/GetToken";

    $data = $data | ConvertTo-JSON;

    $r = Invoke-WebRequest -Uri $url -Method 'POST' -ContentType 'application/json' -Body $data;
    if ($r) {
        Write-Host $r.Content;
    } else {
        Write-Host "Flopped";
    }
} catch {
    "ERROR $_" > output/error.txt
}