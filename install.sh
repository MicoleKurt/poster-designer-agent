#!/usr/bin/env bash
# Installs the poster-design skill and the poster-designer agent.
#   bash install.sh             Claude Code   (~/.claude)
#   bash install.sh --copilot   GitHub Copilot personal skill (~/.copilot/skills)
#   bash install.sh --all       both
set -euo pipefail
root="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
target="${1:---claude}"

copy_skill() {   # $1 = destination skill folder
  mkdir -p "$1"
  cp -R "$root/skills/poster-design/." "$1/"
  # the worked examples travel with the skill so the agent can read them
  cp -R "$root/examples" "$1/"
  find "$1/examples" -type d -name out -prune -exec rm -rf {} + 2>/dev/null || true
}

if [ "$target" = "--claude" ] || [ "$target" = "--all" ]; then
  mkdir -p "$HOME/.claude/agents"
  cp "$root/agents/poster-designer.md" "$HOME/.claude/agents/"
  copy_skill "$HOME/.claude/skills/poster-design"
  echo "Claude Code:"
  echo "  agent  $HOME/.claude/agents/poster-designer.md"
  echo "  skill  $HOME/.claude/skills/poster-design"
fi

if [ "$target" = "--copilot" ] || [ "$target" = "--all" ]; then
  copy_skill "$HOME/.copilot/skills/poster-design"
  echo "GitHub Copilot:"
  echo "  skill  $HOME/.copilot/skills/poster-design"
  echo "  agent  open this repository in VS Code and pick 'Poster Designer' in the agent list,"
  echo "         or copy .github/agents/poster-designer.agent.md into your own project's .github/agents/"
fi

echo
echo "Needs once:  pip install playwright pillow && python -m playwright install chromium"
