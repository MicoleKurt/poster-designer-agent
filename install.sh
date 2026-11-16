#!/usr/bin/env bash
# Installs the poster-designer agent and the poster-design skill for Claude Code (macOS, Linux, Git Bash).
#   bash install.sh
set -euo pipefail
root="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
agents="$HOME/.claude/agents"
skill="$HOME/.claude/skills/poster-design"

mkdir -p "$agents" "$skill"
cp "$root/agents/poster-designer.md" "$agents/"
cp -R "$root/skills/poster-design/." "$skill/"
# the worked examples travel with the skill so the agent can read them
cp -R "$root/examples" "$skill/"

echo "Installed:"
echo "  agent  $agents/poster-designer.md"
echo "  skill  $skill"
echo
echo "Needs once:  pip install playwright pillow && python -m playwright install chromium"
echo "Then in Claude Code:  ask for a poster, or use the poster-designer agent."
