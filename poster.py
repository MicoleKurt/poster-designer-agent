"""Poster Designer: one command for everything, from a fresh copy of this folder.

    python poster.py setup                      install what is needed and confirm a browser works
    python poster.py test                       render and check the examples; proves the copy works
    python poster.py new team-day --format a3   start a poster in posters/team-day/
    python poster.py render posters/team-day/poster.html --format a3 --grid --pdf
    python poster.py check  posters/team-day/poster.html --format a3 --brief posters/team-day/brief.json
    python poster.py sheet  a.png b.png c.png --out concepts.png
    python poster.py build                      render and check every poster in posters/
    python poster.py studio                     rebuild studio.html from studio/src.html

Nothing here needs git, an installer, or a particular folder: copy the folder
anywhere (clone, ZIP, USB stick) and run the first two commands.
"""
import json
import pathlib
import shutil
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parent
SKILL = ROOT / "skills" / "poster-design"
SCRIPTS = SKILL / "scripts"
EXAMPLES = [("lock-it", "a3"), ("town-hall", "ig-portrait"), ("listen-first", "landscape"), ("hands-up", "a3")]
# the same agent, kept where each tool looks for it
AGENT_COPIES = [
    (ROOT / "agents" / "poster-designer.md", ROOT / ".claude" / "agents" / "poster-designer.md"),
    # the short link people paste into Copilot points at go.txt
    (ROOT / "copilot" / "instructions.txt", ROOT / "go.txt"),
]


def py(*args, quiet=False):
    """Run one of the skill's scripts with this Python. Returns (exit code, output)."""
    proc = subprocess.run([sys.executable, *map(str, args)], cwd=ROOT, capture_output=quiet,
                          text=True, encoding="utf-8", errors="replace")
    return proc.returncode, (proc.stdout or "") + (proc.stderr or "")


def have(module):
    try:
        __import__(module)
        return True
    except ImportError:
        return False


def browser_name():
    """Which browser renders on this machine, or None."""
    if not have("playwright"):
        return None
    sys.path.insert(0, str(SCRIPTS))
    from browser import which  # noqa: E402
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        return which(p)


def setup():
    print("Poster Designer setup\n")
    if sys.version_info < (3, 10):
        sys.exit(f"Python 3.10 or newer is needed; this is {sys.version.split()[0]}.")
    print(f"  python     {sys.version.split()[0]}  ok")

    if have("playwright") and have("PIL"):
        print("  packages   playwright, pillow  ok")
    else:
        print("  packages   installing playwright and pillow ...")
        code = subprocess.call([sys.executable, "-m", "pip", "install", "-r", str(ROOT / "requirements.txt")])
        if code != 0:
            sys.exit("\npip could not install the packages. On a managed machine, ask IT to allow:\n"
                     "  pip install playwright pillow\nthen run this command again.")

    name = browser_name()
    if not name:
        print("  browser    none found; downloading Chromium (about 150 MB) ...")
        subprocess.call([sys.executable, "-m", "playwright", "install", "chromium"])
        name = browser_name()
    if not name:
        sys.exit("\nNo browser could be started. Install Microsoft Edge or Google Chrome, or allow\n"
                 "  python -m playwright install chromium\nthen run this command again.")
    label = {"chromium": "Playwright Chromium", "msedge": "Microsoft Edge (already installed)", "chrome": "Google Chrome (already installed)"}[name]
    print(f"  browser    {label}  ok")
    print("\nReady. Next:  python poster.py test")


def test():
    print("Poster Designer self-test\n")
    failures = 0
    out = ROOT / "examples" / "_selftest"
    for name, fmt in EXAMPLES:
        html = ROOT / "examples" / name / "poster.html"
        brief = ROOT / "examples" / name / "brief.json"
        code, text = py(SCRIPTS / "render.py", html, "--format", fmt, "--scale", "1", "--out", out / name, quiet=True)
        rendered = (out / name / "poster.png").exists()
        ccode, ctext = py(SCRIPTS / "check.py", html, "--format", fmt, "--brief", brief, quiet=True)
        summary = ctext.strip().splitlines()[-1] if ctext.strip() else "no output"
        ok = code == 0 and rendered and ccode == 0
        failures += not ok
        print(f"  {'ok  ' if ok else 'FAIL'}  {name:14} {fmt:12} {summary}")
        if not ok:
            print((text + ctext).strip()[:600])

    # the checker must also reject bad work, or a pass means nothing
    slop = ROOT / "examples" / "listen-first" / "slop.html"
    ccode, ctext = py(SCRIPTS / "check.py", slop, "--format", "landscape", "--brief", ROOT / "examples" / "listen-first" / "brief.json", quiet=True)
    summary = ctext.strip().splitlines()[-1] if ctext.strip() else "no output"
    ok = ccode == 1
    failures += not ok
    print(f"  {'ok  ' if ok else 'FAIL'}  {'slop.html':14} {'must fail':12} {summary}")

    for source, copy in AGENT_COPIES:
        same = copy.exists() and source.read_text(encoding="utf8") == copy.read_text(encoding="utf8")
        failures += not same
        print(f"  {'ok  ' if same else 'FAIL'}  {copy.relative_to(ROOT).as_posix()} matches {source.relative_to(ROOT).as_posix()}")

    same = (ROOT / "studio.html").read_text(encoding="utf8") == studio_html()
    failures += not same
    print(f"  {'ok  ' if same else 'FAIL'}  studio.html is built from studio/src.html (rebuild with: python poster.py studio)")

    block = (ROOT / "copilot" / "start.txt").read_text(encoding="utf8").strip()
    same = block in (ROOT / "README.md").read_text(encoding="utf8")
    failures += not same
    print(f"  {'ok  ' if same else 'FAIL'}  README.md carries the same block as copilot/start.txt")

    shutil.rmtree(out, ignore_errors=True)
    if failures:
        sys.exit(f"\n{failures} problem(s). If rendering failed, run:  python poster.py setup")
    print("\nAll good. This copy renders and checks posters.")


def new(args):
    if not args:
        sys.exit("Usage: python poster.py new <name> [--format a3]")
    name = args[0]
    fmt = args[args.index("--format") + 1] if "--format" in args else "a3"
    folder = ROOT / "posters" / name
    if folder.exists():
        sys.exit(f"{folder} already exists.")
    folder.mkdir(parents=True)
    shutil.copy(SKILL / "templates" / "base.html", folder / "poster.html")
    brief = {
        "project": name,
        "profile": "profiles/optum-callcenter.json",
        "audience": "",
        "one_message": "",
        "action": "",
        "format": fmt,
        "seen_from": "",
        "tone": "Warm, plain, respectful.",
        "direction": "",
        "must_not": ["member or patient details", "performance numbers that were not supplied", "the company logo redrawn by hand"],
        "copy": {"headline": "", "facts": []},
    }
    (folder / "brief.json").write_text(json.dumps(brief, indent=2) + "\n", encoding="utf8")
    rel = folder.relative_to(ROOT).as_posix()
    print(f"Started {rel}/\n  brief.json    fill in the message and the exact copy first\n  poster.html   the sheet, in the house look\n")
    print(f"Render:  python poster.py render {rel}/poster.html --format {fmt} --grid")
    print(f"Check:   python poster.py check  {rel}/poster.html --format {fmt} --brief {rel}/brief.json")


def studio_html():
    """studio/src.html with the two typefaces and the three libraries written into it."""
    import base64
    src = (ROOT / "studio" / "src.html").read_text(encoding="utf8")
    def face(family, style, weight, file):
        data = base64.b64encode((ROOT / "studio" / "fonts" / file).read_bytes()).decode()
        return (f"@font-face{{font-family:'{family}';font-style:{style};font-weight:{weight};font-display:swap;"
                f"src:url(data:font/woff2;base64,{data}) format('woff2')}}")
    fonts = face("Figtree", "normal", "300 900", "figtree-latin.woff2") + face("Newsreader", "italic", "200 800", "newsreader-italic-latin.woff2")
    libs = []
    for name in ("html-to-image.js", "jspdf.umd.min.js", "jszip.min.js"):
        code = (ROOT / "studio" / "vendor" / name).read_text(encoding="utf8")
        libs.append(code.replace("</script", "<\\/script").replace("<!--", "<\\!--"))
    assert src.count("/*FONTFACES*/") == 1 and src.count("/*VENDOR*/") == 1
    return src.replace("/*FONTFACES*/", fonts).replace("/*VENDOR*/", "\n;".join(libs))


def studio():
    out = ROOT / "studio.html"
    out.write_text(studio_html(), encoding="utf8", newline="\n")
    print(f"studio.html written ({out.stat().st_size // 1024} KB, self-contained)")


def build():
    """Render and check every posters/<name>/poster.html, using the format in its brief."""
    folders = sorted(p.parent for p in (ROOT / "posters").glob("*/poster.html"))
    if not folders:
        print("No posters yet. Start one with:  python poster.py new <name>")
        return
    failures = 0
    for folder in folders:
        brief = folder / "brief.json"
        fmt = "a3"
        if brief.exists():
            fmt = json.loads(brief.read_text(encoding="utf8")).get("format", "a3")
        code, text = py(SCRIPTS / "render.py", folder / "poster.html", "--format", fmt, "--grid", "--pdf", "--out", folder / "out", quiet=True)
        args = [SCRIPTS / "check.py", folder / "poster.html", "--format", fmt]
        if brief.exists():
            args += ["--brief", brief]
        ccode, ctext = py(*args, quiet=True)
        (folder / "out").mkdir(exist_ok=True)
        (folder / "out" / "check.txt").write_text(ctext, encoding="utf8")
        summary = ctext.strip().splitlines()[-1] if ctext.strip() else "no output"
        ok = code == 0 and ccode == 0
        failures += not ok
        print(f"  {'ok  ' if ok else 'FAIL'}  {folder.name:20} {fmt:12} {summary}")
        if "WARNING" in text:
            print("        " + text[text.index("WARNING"):].strip().replace("\n", "\n        ")[:400])
        if not ok:
            print("\n".join("        " + line for line in ctext.strip().splitlines() if line.startswith(("FAIL", "WARN"))))
    if failures:
        sys.exit(f"\n{failures} poster(s) did not pass. Each folder's out/check.txt has the full report.")
    print("\nAll posters rendered and passed. Files are in each poster's out/ folder.")


def main():
    for stream in (sys.stdout, sys.stderr):
        if hasattr(stream, "reconfigure"):
            stream.reconfigure(encoding="utf-8", errors="replace")
    if len(sys.argv) < 2 or sys.argv[1] in ("-h", "--help", "help"):
        print(__doc__)
        return
    command, rest = sys.argv[1], sys.argv[2:]
    if command == "setup":
        setup()
    elif command == "test":
        test()
    elif command == "new":
        new(rest)
    elif command == "build":
        build()
    elif command == "studio":
        studio()
    elif command in ("render", "check", "sheet"):
        if not (have("playwright") and have("PIL")):
            sys.exit("Not set up yet. Run:  python poster.py setup")
        code, _ = py(SCRIPTS / f"{command}.py", *rest)
        sys.exit(code)
    else:
        sys.exit(f"Unknown command '{command}'.\n{__doc__}")


if __name__ == "__main__":
    main()
