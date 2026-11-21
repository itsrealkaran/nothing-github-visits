"use strict";

// Same URL as the Python server. This process draws the SVG itself.

const http = require("http");
const { URL } = require("url");
const { load } = require("./node/load");
const { render } = require("./node/render");

const CARD = "visits";
const GITHUB = process.env.GITHUB_REDIRECT || "https://github.com/itsrealkaran/nothing-github-visits";
const PORT = Number(process.env.PORT || 8080);
const TTL = Number(process.env.CARD_CACHE_SECONDS || 60);
const MODES = new Set(["classic", "classic-r", "white", "white-r", "light", "red", "blue", "yellow"]);
const SIZES = new Set(["badge", "mini", "compact", "regular", "wide"]);
const cache = new Map();

function xml(text) {
  return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function errorSvg(message) {
  return (
    '<svg xmlns="http://www.w3.org/2000/svg" width="495" height="120" viewBox="0 0 495 120" role="img">' +
    '<rect width="495" height="120" rx="16" fill="#000000"/>' +
    '<text x="24" y="68" fill="#FFFFFF" font-family="ui-monospace, monospace" font-size="16">' +
    xml(message) +
    "</text></svg>"
  );
}

function loginOk(value) {
  if (!value || value.length > 39 || !/^[A-Za-z0-9]/.test(value)) return false;
  return /^[A-Za-z0-9-]+$/.test(value);
}

async function draw(login, theme, size, glyph, border) {
  const data = await load(login, glyph === "1");
  return render(theme, size, data, border !== "0");
}

function flag(value, fallback) {
  const text = (value || fallback).trim().toLowerCase();
  return ["0", "no", "off", "false"].includes(text) ? "0" : "1";
}

function send(res, status, type, body, maxAge, headers) {
  const buf = Buffer.from(body);
  res.writeHead(status, Object.assign({
    "Content-Type": type,
    "Content-Length": String(buf.length),
    "Cache-Control": "public, max-age=" + maxAge,
    "Access-Control-Allow-Origin": "*",
  }, headers || {}));
  res.end(buf);
}

async function handle(req, res) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    send(res, 405, "text/plain; charset=utf-8", "Method not allowed", 0);
    return;
  }
  const url = new URL(req.url, "http://" + (req.headers.host || "127.0.0.1"));
  const name = url.pathname.replace(/^\/+|\/+$/g, "");
  if (name !== "" && name !== CARD) {
    send(res, 200, "image/svg+xml; charset=utf-8", errorSvg("unknown card"), 60);
    return;
  }
  const username = (url.searchParams.get("username") || url.searchParams.get("user") || "").trim();
  if (!username) {
    res.writeHead(302, { Location: GITHUB, "Cache-Control": "no-store" });
    res.end();
    return;
  }
  if (!loginOk(username)) {
    send(res, 200, "image/svg+xml; charset=utf-8", errorSvg("username is required"), 60);
    return;
  }
  const theme = (url.searchParams.get("theme") || "classic").trim() || "classic";
  const size = (url.searchParams.get("size") || "regular").trim() || "regular";
  const glyph = flag(url.searchParams.get("glyph") || url.searchParams.get("pfp"), "1");
  const border = (url.searchParams.get("border") || "").trim() === "0" ? "0" : "1";
  if (!MODES.has(theme)) {
    send(res, 200, "image/svg+xml; charset=utf-8", errorSvg("unknown theme " + theme), 60);
    return;
  }
  if (!SIZES.has(size)) {
    send(res, 200, "image/svg+xml; charset=utf-8", errorSvg("unknown size " + size), 60);
    return;
  }
  const key = [username.toLowerCase(), theme, size, glyph, border].join("\0");
  const hit = cache.get(key);
  if (hit && hit.expires > Date.now()) {
    send(res, 200, "image/svg+xml; charset=utf-8", hit.svg, TTL);
    return;
  }
  try {
    const svg = await draw(username, theme, size, glyph, border);
    cache.set(key, { expires: Date.now() + TTL * 1000, svg });
    send(res, 200, "image/svg+xml; charset=utf-8", svg, TTL);
  } catch (error) {
    const message = String(error && error.message ? error.message : "card failed").split("\n")[0];
    send(res, 200, "image/svg+xml; charset=utf-8", errorSvg(message || "card failed"), 60);
  }
}

if (require.main === module) {
  http.createServer((req, res) => {
    handle(req, res).catch(() => {
      if (!res.headersSent) send(res, 200, "image/svg+xml; charset=utf-8", errorSvg("card failed"), 60);
    });
  }).listen(PORT, "0.0.0.0", () => {
    console.log(CARD + " listening on " + PORT);
  });
}

module.exports = handle;
