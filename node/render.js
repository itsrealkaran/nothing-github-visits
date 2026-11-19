"use strict";

const { dots, label, openSvg } = require("./frame");
const { theme } = require("./nothing");
const { commas, div, f, fixed, pyRound } = require("./format");

const PAIR = [["views", "Views"], ["followers", "Followers"]];
const TRIPLE = PAIR.concat([["following", "Following"]]);

function render(mode, size, data) {
  const colors = theme(mode);
  if (size === "badge") return badge(mode, colors, data);
  if (size === "mini") return mini(mode, colors, data);
  if (size === "compact") return board(mode, colors, data, 495, 180, PAIR, 32, 108, 132, 148, 168);
  if (size === "wide") {
    return board(mode, colors, data, 896, 220, TRIPLE, 40, 120, 156, 178, 202, "@" + data.login, "Since " + data.since);
  }
  return board(mode, colors, data, 495, 195, TRIPLE, 28, 112, 138, 158, 180);
}

function badge(mode, colors, data) {
  const text = commas(data.views);
  const advance = 7.6;
  const left = 8 + 6 + 8 + pyRound("Profile views".length * advance) + 12;
  const right = 14 + pyRound(text.length * advance) + 14;
  const width = left + right;
  const height = 28;
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" ` +
      `viewBox="0 0 ${width} ${height}" role="img">` +
      `<title>${data.login} profile views</title>` +
      `<rect width="${width}" height="${height}" fill="${colors.bg}"/>` +
      `<rect x="${left}" width="${right}" height="${height}" fill="${colors.figure}"/>`,
    `<rect x="8" y="11" width="6" height="6" fill="${colors.mark}"/>`,
    label(22, 19, "Profile views", colors.fg, 12, 0.3),
    label(f(left + right / 2), 19, text, colors.bg, 12, 0.2, "middle"),
    "</svg>",
  ].join("\n");
}

function mini(mode, colors, data) {
  const [name] = dots("VISITS", 28, 12, colors.fg, 1.15);
  return [
    openSvg(mode, 220, 148, data.login + " profile views", 6, 14),
    name,
    label(16, 96, commas(data.views), colors.figure, 32, -0.8),
    label(16, 118, "Views", colors.muted, 11, 0.3),
    label(16, 138, "Since " + data.since, colors.fg, 11, 0.2),
    "</svg>",
  ].join("\n");
}

function board(mode, colors, data, width, height, columns, numberSize, numberY, captionY, ruleY, footerY, corner, footer) {
  const [name] = dots("VISITS", 40, 16, colors.fg, 1.8);
  const parts = [
    openSvg(mode, width, height, data.login + " profile views"),
    name,
  ];
  if (corner) parts.push(label(width - 20, 36, corner, colors.muted, 12, 0.2, "end"));
  const span = div(width, columns.length);
  columns.forEach(([key, title], index) => {
    const center = f(span.n * index + span.n / 2);
    if (index) {
      const x = f(span.n * index);
      parts.push(`<line x1="${fixed(x, 1)}" y1="72" x2="${fixed(x, 1)}" y2="${ruleY - 14}" stroke="${colors.rule}"/>`);
    }
    parts.push(label(center, numberY, commas(data[key]), colors.figure, numberSize, -0.8, "middle"));
    parts.push(label(center, captionY, title, colors.muted, 12, 0.4, "middle"));
  });
  const line = footer ? footer : "@" + data.login + " · since " + data.since;
  parts.push(`<line x1="20" y1="${ruleY}" x2="${width - 20}" y2="${ruleY}" stroke="${colors.rule}"/>`);
  parts.push(label(20, footerY, line, colors.fg, 12, 0.2));
  parts.push("</svg>");
  return parts.join("\n");
}

module.exports = { render };
