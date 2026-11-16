"""Open a browser for rendering, using whatever this machine already has.

Order: Playwright's own Chromium, then Microsoft Edge, then Google Chrome.
Edge is on every Windows machine, so a locked-down laptop that cannot download
Chromium can still render. Set POSTER_BROWSER to chromium, msedge or chrome to
force one.
"""
import os
import sys

CHOICES = ("chromium", "msedge", "chrome")


def launch(playwright):
    """Return a launched browser, or exit with the exact fix."""
    forced = os.environ.get("POSTER_BROWSER", "").strip().lower()
    order = [forced] if forced in CHOICES else list(CHOICES)
    errors = []
    for name in order:
        try:
            if name == "chromium":
                return playwright.chromium.launch()
            return playwright.chromium.launch(channel=name)
        except Exception as exc:  # the browser is missing or blocked; try the next one
            errors.append(f"  {name}: {str(exc).splitlines()[0][:140]}")
    sys.exit(
        "No browser could be started for rendering.\n"
        + "\n".join(errors)
        + "\n\nFix: run  python poster.py setup   (or:  python -m playwright install chromium)\n"
        "On a managed machine with Edge or Chrome installed, nothing needs downloading:\n"
        "check that the browser opens normally, then run the command again."
    )


def which(playwright):
    """Name of the first browser that starts, or None. Used by the setup check."""
    for name in CHOICES:
        try:
            b = playwright.chromium.launch() if name == "chromium" else playwright.chromium.launch(channel=name)
            b.close()
            return name
        except Exception:
            continue
    return None
