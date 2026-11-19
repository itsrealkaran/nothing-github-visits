"""Profile view card. Compact is the count. Regular adds followers. Wide is the glyph meter."""

import sys
from pathlib import Path

from frame import dots, label, open_svg
from github_user import profile_views
from nothing import MODES, SIZES, theme

ROOT = Path(__file__).resolve().parent


def render(mode, size, data):
    colors = theme(mode)
    if size == "mini":
        return _mini(mode, colors, data)
    if size == "compact":
        return _compact(mode, colors, data)
    if size == "wide":
        return _wide(mode, colors, data)
    return _regular(mode, colors, data)


def _mini(mode, colors, data):
    name, _ = dots("VISITS", 28, 12, colors["fg"], scale=1.15)
    return "\n".join([
        open_svg(mode, 220, 148, f"{data['login']} profile views", mark=6, margin=14),
        name,
        label(16, 108, f"{data['views']:,}", colors["figure"], 28, -0.8),
        label(16, 130, "Views", colors["muted"], 11, 0.3),
        "</svg>",
    ])


def _compact(mode, colors, data):
    name, _ = dots("VISITS", 40, 16, colors["fg"], scale=1.8)
    return "\n".join([
        open_svg(mode, 495, 132, f"{data['login']} profile views"),
        name,
        label(20, 108, f"{data['views']:,}", colors["figure"], 40, -1),
        label(250, 90, "Profile views", colors["muted"], 13, 0.4),
        label(250, 112, f"@{data['login']}", colors["fg"], 14, 0.2),
        "</svg>",
    ])


def _regular(mode, colors, data):
    name, _ = dots("VISITS", 40, 16, colors["fg"], scale=1.8)
    return "\n".join([
        open_svg(mode, 495, 195, f"{data['login']} profile views"),
        name,
        label(20, 118, f"{data['views']:,}", colors["figure"], 32, -0.8),
        label(250, 118, f"{data['followers']:,}", colors["figure"], 32, -0.8),
        label(20, 142, "Profile views", colors["muted"], 12, 0.4),
        label(250, 142, "Followers", colors["muted"], 12, 0.4),
        f'<line x1="20" y1="158" x2="475" y2="158" stroke="{colors["rule"]}"/>',
        label(20, 180, f"@{data['login']} · since {data['since']}", colors["fg"], 12, 0.2),
        "</svg>",
    ])


def _wide(mode, colors, data):
    name, _ = dots("VISITS", 40, 16, colors["fg"], scale=1.8)
    squares = []
    filled = min(28, data["views"] // 100)
    for index in range(28):
        column = index % 14
        row = index // 14
        fill = colors["figure"] if index < filled else colors["rule"]
        x = 300 + column * 40
        y = 78 + row * 40
        squares.append(f'<rect x="{x}" y="{y}" width="28" height="28" fill="{fill}"/>')
    return "\n".join([
        open_svg(mode, 896, 240, f"{data['login']} profile views"),
        name,
        label(20, 120, f"{data['views']:,}", colors["figure"], 42, -1),
        label(20, 148, "Profile views", colors["muted"], 13, 0.4),
        label(20, 200, f"{data['followers']:,} followers", colors["fg"], 14, 0.2),
        "".join(squares),
        label(300, 176, "Each square is 100 views", colors["muted"], 12, 0.4),
        "</svg>",
    ])


def _variant(card, login, mode, size, filename):
    url = f"https://github.com/itsrealkaran/{card}?username={login}&theme={mode}&size={size}"
    return [
        f"**{card}** · {mode} · {size}",
        "",
        f"`{url}`",
        "",
        f"![{card} {mode} {size}](dist/{login}/{filename})",
        "",
    ]


def main():
    login = sys.argv[1] if len(sys.argv) > 1 else "itsrealkaran"
    data = profile_views(login)
    out = ROOT / "dist" / data["login"]
    out.mkdir(parents=True, exist_ok=True)
    lines = [
        f"# {data['login']}",
        "",
        "Compact is the view count. Regular adds followers. Wide is one square per 100 views.",
        "",
    ]
    for mode in MODES:
        lines += [f"## {mode}", ""]
        for size in SIZES:
            filename = f"{mode}-{size}.svg"
            (out / filename).write_text(render(mode, size, data))
            lines += _variant("visits", data["login"], mode, size, filename)
            print(data["login"], mode, size)
    (ROOT / "DUMMY.md").write_text("\n".join(lines) + "\n")


if __name__ == "__main__":
    main()
