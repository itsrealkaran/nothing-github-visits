"""Profile view card. Badge is the inline count. The other sizes are columns."""

import sys
from pathlib import Path

from frame import card_rect, dots, label, open_svg
from github_user import profile_views
from nothing import MODES, SIZES, theme

ROOT = Path(__file__).resolve().parent


PAIR = (("views", "Views"), ("followers", "Followers"))
TRIPLE = PAIR + (("following", "Following"),)


def render(mode, size, data, border=True):
    colors = theme(mode)
    if size == "badge":
        return _badge(mode, colors, data, border)
    if size == "mini":
        return _mini(mode, colors, data, border)
    if size == "compact":
        return _board(mode, colors, data, 495, 180, PAIR, 32, 108, 132, 148, 168, border=border)
    if size == "wide":
        return _board(
            mode, colors, data, 896, 220, TRIPLE, 40, 120, 156, 178, 202,
            corner=f"@{data['login']}", footer=f"Since {data['since']}", border=border,
        )
    return _board(mode, colors, data, 440, 195, TRIPLE, 28, 112, 138, 158, 180, border=border)


def _badge(mode, colors, data, border):
    """Inline label and count. Split fill, short enough for a profile line."""
    text = f"{data['views']:,}"
    advance = 7.6
    left = 8 + 6 + 8 + round(len("Profile views") * advance) + 12
    right = 14 + round(len(text) * advance) + 14
    width = left + right
    height = 28
    radius = 8 if border else 16
    edge = card_rect(width, height, colors, True, "none") if border else ""
    return "\n".join([
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" '
        f'viewBox="0 0 {width} {height}" role="img">'
        f"<title>{data['login']} profile views</title>"
        f'<defs><clipPath id="card"><rect width="{width}" height="{height}" rx="{radius}"/></clipPath></defs>'
        f'<g clip-path="url(#card)">'
        f'<rect width="{width}" height="{height}" fill="{colors["bg"]}"/>'
        f'<rect x="{left}" width="{right}" height="{height}" fill="{colors["figure"]}"/>',
        f'<rect x="8" y="11" width="6" height="6" fill="{colors["mark"]}"/>',
        label(22, 19, "Profile views", colors["fg"], 12, 0.3),
        label(left + right / 2, 19, text, colors["bg"], 12, 0.2, anchor="middle"),
        "</g>",
        edge,
        "</svg>",
    ])


def _mini(mode, colors, data, border):
    name, _ = dots("VISITS", 28, 12, colors["fg"], scale=1.15)
    return "\n".join([
        open_svg(mode, 220, 148, f"{data['login']} profile views", mark=6, margin=14, border=border),
        name,
        label(16, 96, f"{data['views']:,}", colors["figure"], 32, -0.8),
        label(16, 118, "Views", colors["muted"], 11, 0.3),
        label(16, 138, f"Since {data['since']}", colors["fg"], 11, 0.2),
        "</svg>",
    ])


def _board(mode, colors, data, width, height, columns, number_size, number_y, caption_y, rule_y, footer_y, corner="", footer="", border=True):
    name, _ = dots("VISITS", 40, 16, colors["fg"], scale=1.8)
    parts = [
        open_svg(mode, width, height, f"{data['login']} profile views", border=border),
        name,
    ]
    if corner:
        parts.append(label(width - 20, 36, corner, colors["muted"], 12, 0.2, anchor="end"))
    span = width / len(columns)
    for index, (key, title) in enumerate(columns):
        center = span * index + span / 2
        if index:
            x = span * index
            parts.append(
                f'<line x1="{x:.1f}" y1="72" x2="{x:.1f}" y2="{rule_y - 14}" stroke="{colors["rule"]}"/>'
            )
        parts.append(label(center, number_y, f"{data[key]:,}", colors["figure"], number_size, -0.8, anchor="middle"))
        parts.append(label(center, caption_y, title, colors["muted"], 12, 0.4, anchor="middle"))
    line = f"@{data['login']} · since {data['since']}" if not footer else footer
    parts.append(f'<line x1="20" y1="{rule_y}" x2="{width - 20}" y2="{rule_y}" stroke="{colors["rule"]}"/>')
    parts.append(label(20, footer_y, line, colors["fg"], 12, 0.2))
    return "\n".join(parts + ["</svg>"])


def _variant(card, login, mode, size, filename):
    url = f"https://github.com/itsrealkaran/nothing-github-visits?username={login}&theme={mode}&size={size}"
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
        "Badge is the inline profile-view count. Mini is the count. Compact adds followers. Regular and wide add following. The card has a hairline border and a small corner.",
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
