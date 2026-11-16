# Copilot instructions

This repository is a poster-design agent and skill. The full rules for agents are in [AGENTS.md](../AGENTS.md); read it first.

For any request to design or critique a poster or graphic:

- Switch to the **Poster Designer** agent (`.github/agents/poster-designer.agent.md`), or follow [skills/poster-design/SKILL.md](../skills/poster-design/SKILL.md) directly.
- Use the house look in [profiles/optum-callcenter.json](../skills/poster-design/profiles/optum-callcenter.json) and obey its `hard_rules`.
- Build the poster as HTML and CSS, render it with `skills/poster-design/scripts/render.py`, and check it with `skills/poster-design/scripts/check.py --brief`. A poster is not finished until the check reports 0 FAIL.
- Never invent a fact, name, number, quote or logo, never generate people, and never put member, patient or caller information on a sheet.
- If you cannot view the rendered images, say so and ask the person to look at them. Never claim you looked.
