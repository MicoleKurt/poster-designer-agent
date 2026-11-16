# Installs the poster-designer agent and the poster-design skill for Claude Code (Windows).
#   powershell -ExecutionPolicy Bypass -File install.ps1
$ErrorActionPreference = 'Stop'
$root   = Split-Path -Parent $MyInvocation.MyCommand.Path
$claude = Join-Path $HOME '.claude'
$agents = Join-Path $claude 'agents'
$skill  = Join-Path $claude 'skills\poster-design'

New-Item -ItemType Directory -Force $agents | Out-Null
New-Item -ItemType Directory -Force $skill  | Out-Null
Copy-Item (Join-Path $root 'agents\poster-designer.md') $agents -Force
Copy-Item (Join-Path $root 'skills\poster-design\*') $skill -Recurse -Force
# the worked examples travel with the skill so the agent can read them
Copy-Item (Join-Path $root 'examples') $skill -Recurse -Force

Write-Host "Installed:"
Write-Host "  agent  $agents\poster-designer.md"
Write-Host "  skill  $skill"
Write-Host ""
Write-Host "Needs once:  pip install playwright pillow ; python -m playwright install chromium"
Write-Host "Then in Claude Code:  ask for a poster, or use the poster-designer agent."
