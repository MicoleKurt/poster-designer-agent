# Installs the poster-design skill and the poster-designer agent (Windows).
#   powershell -ExecutionPolicy Bypass -File install.ps1              Claude Code   (~\.claude)
#   powershell -ExecutionPolicy Bypass -File install.ps1 -Copilot     GitHub Copilot personal skill (~\.copilot\skills)
#   powershell -ExecutionPolicy Bypass -File install.ps1 -All         both
param([switch]$Copilot, [switch]$All)
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path

function Copy-Skill($dest) {
  New-Item -ItemType Directory -Force $dest | Out-Null
  Copy-Item (Join-Path $root 'skills\poster-design\*') $dest -Recurse -Force
  # the worked examples travel with the skill so the agent can read them
  Copy-Item (Join-Path $root 'examples') $dest -Recurse -Force
  Get-ChildItem (Join-Path $dest 'examples') -Recurse -Directory -Filter out -ErrorAction SilentlyContinue |
    Remove-Item -Recurse -Force -Confirm:$false
}

if ($All -or -not $Copilot) {
  $agents = Join-Path $HOME '.claude\agents'
  New-Item -ItemType Directory -Force $agents | Out-Null
  Copy-Item (Join-Path $root 'agents\poster-designer.md') $agents -Force
  Copy-Skill (Join-Path $HOME '.claude\skills\poster-design')
  Write-Host "Claude Code:"
  Write-Host "  agent  $agents\poster-designer.md"
  Write-Host "  skill  $HOME\.claude\skills\poster-design"
}

if ($All -or $Copilot) {
  Copy-Skill (Join-Path $HOME '.copilot\skills\poster-design')
  Write-Host "GitHub Copilot:"
  Write-Host "  skill  $HOME\.copilot\skills\poster-design"
  Write-Host "  agent  open this repository in VS Code and pick 'Poster Designer' in the agent list,"
  Write-Host "         or copy .github\agents\poster-designer.agent.md into your own project's .github\agents\"
}

Write-Host ""
Write-Host "Needs once:  pip install playwright pillow ; python -m playwright install chromium"
