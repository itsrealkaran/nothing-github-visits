"use strict";

const { GLYPHS, theme } = require("./nothing");
const { fixed, py, xml } = require("./format");

function dots(text, x, y, fill, scale = 2.4) {
  const step = scale + 1.1;
  const parts = [];
  let cursor = x;
  for (const char of text) {
    const grid = GLYPHS[char];
    if (!grid) throw new Error("missing glyph " + char);
    grid.forEach((bits, row) => {
      for (let col = 0; col < bits.length; col += 1) {
        if (bits[col] !== "1") continue;
        const cx = cursor + col * step + scale / 2;
        const cy = y + row * step + scale / 2;
        parts.push(
          `<circle cx="${fixed(cx, 1)}" cy="${fixed(cy, 1)}" r="${fixed(scale / 2, 2)}" fill="${fill}"/>`
        );
      }
    });
    cursor += 5 * step + scale;
  }
  return [parts.join(""), cursor - x];
}

function openSvg(mode, width, height, title, mark = 8, margin = 20, border = true) {
  const colors = theme(mode);
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${py(width)}" height="${py(height)}" ` +
    `viewBox="0 0 ${py(width)} ${py(height)}" role="img">` +
    `<title>${xml(title)}</title>` +
    cardRect(width, height, colors, border) +
    `<rect x="${py(margin)}" y="${py(margin)}" width="${py(mark)}" height="${py(mark)}" fill="${colors.mark}"/>`
  );
}

function cardRect(width, height, colors, border, fill) {
  const ink = fill || colors.bg;
  if (!border) return `<rect width="${py(width)}" height="${py(height)}" rx="16" fill="${ink}"/>`;
  return (
    `<rect x="0.5" y="0.5" width="${py(width - 1)}" height="${py(height - 1)}" ` +
    `rx="8" fill="${ink}" stroke="${colors.rule}"/>`
  );
}

function label(x, y, text, fill, size = 13, tracking = 0.4, anchor = "start") {
  return (
    `<text x="${py(x)}" y="${py(y)}" fill="${fill}" text-anchor="${anchor}" ` +
    `font-family="ui-monospace, Geist Mono, monospace" ` +
    `font-size="${py(size)}" letter-spacing="${py(tracking)}" dominant-baseline="auto">${xml(text)}</text>`
  );
}

module.exports = { dots, openSvg, label, cardRect };
