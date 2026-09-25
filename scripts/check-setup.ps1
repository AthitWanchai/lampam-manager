$values = @{}
if (Test-Path ".env.local") { foreach ($line in Get-Content ".env.local") { if ($line -match "^([^#=]+)=(.*)$") { $values[$Matches[1].Trim()] = $Matches[2].Trim() } } }
Write-Output "lampam-manager setup check"
foreach ($name in @("NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY")) { if ([string]::IsNullOrWhiteSpace($values[$name])) { Write-Output "MISSING  $name" } else { Write-Output "OK       $name" } }
if ([string]::IsNullOrWhiteSpace($values["SUPABASE_SECRET_KEY"]) -and [string]::IsNullOrWhiteSpace($values["SUPABASE_SERVICE_ROLE_KEY"])) { Write-Output "MISSING  SUPABASE_SECRET_KEY (or legacy SUPABASE_SERVICE_ROLE_KEY)" } else { Write-Output "OK       Supabase server key" }
foreach ($name in @("META_APP_ID", "META_APP_SECRET")) { if ([string]::IsNullOrWhiteSpace($values[$name])) { Write-Output "OPTIONAL $name (Meta not configured)" } else { Write-Output "OK       $name" } }
if ([string]::IsNullOrWhiteSpace($values["META_REDIRECT_URI"])) { Write-Output "MISSING  META_REDIRECT_URI" } else { Write-Output "OK       META_REDIRECT_URI" }
