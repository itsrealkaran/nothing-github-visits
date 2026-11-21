"""Print one SVG for this card.

    python3 draw.py LOGIN THEME SIZE [glyph]

The Node route and the Python server both use this, so the picture matches.
"""

import sys

from github_user import profile_views as load
from nothing import MODES, SIZES
from render import render


def draw(login, theme, size, glyph=True, border=True):
    if theme not in MODES:
        raise SystemExit(f"unknown theme {theme}")
    if size not in SIZES:
        raise SystemExit(f"unknown size {size}")
    data = load(login)
    if isinstance(data, dict) and not data.get("login"):
        data["login"] = login
    return render(theme, size, data, border)


def main():
    if len(sys.argv) < 4:
        raise SystemExit("usage: python3 draw.py LOGIN THEME SIZE [glyph]")
    login, theme, size = sys.argv[1:4]
    glyph = True
    if len(sys.argv) > 4:
        glyph = sys.argv[4].strip().lower() not in ("0", "no", "off", "false")
    sys.stdout.write(draw(login, theme, size, glyph))


if __name__ == "__main__":
    try:
        main()
    except SystemExit as exc:
        if exc.code not in (None, 0):
            sys.stderr.write(str(exc) or "card failed")
            sys.exit(1)
        raise
    except Exception:
        sys.stderr.write("card failed")
        sys.exit(1)
