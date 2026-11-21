#!/usr/bin/env python3
"""Python route for this card. The container runs this file."""

import os
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlparse

from draw import draw

CARD = "visits"
GITHUB = os.environ.get("GITHUB_REDIRECT", "https://github.com/itsrealkaran/nothing-github-visits")
TTL = int(os.environ.get("CARD_CACHE_SECONDS", "3600"))
_lock = threading.Lock()
_cache = {}


def xml(text):
    return str(text).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def error_svg(message):
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" width="495" height="120" '
        'viewBox="0 0 495 120" role="img">'
        '<rect width="495" height="120" rx="16" fill="#000000"/>'
        f'<text x="24" y="68" fill="#FFFFFF" font-family="ui-monospace, monospace" '
        f'font-size="16">{xml(message)}</text></svg>'
    )


def login_ok(value):
    if not value or len(value) > 39 or not value[0].isalnum():
        return False
    return all(char.isalnum() or char == "-" for char in value)


def cached(key):
    hit = _cache.get(key)
    if not hit:
        return None
    expires, svg = hit
    if expires < time.time():
        _cache.pop(key, None)
        return None
    return svg


class Handler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def do_GET(self):
        self._respond()

    def do_HEAD(self):
        self._respond(head=True)

    def log_message(self, fmt, *args):
        sys_stderr = __import__("sys").stderr
        sys_stderr.write("%s - %s\n" % (self.address_string(), fmt % args))

    def _respond(self, head=False):
        parsed = urlparse(self.path)
        name = parsed.path.strip("/")
        if name not in ("", CARD):
            self._send(200, "image/svg+xml; charset=utf-8", error_svg("unknown card").encode(), 60, head)
            return
        query = parse_qs(parsed.query)
        username = (query.get("username") or query.get("user") or [""])[0].strip()
        if not username:
            self.send_response(302)
            self.send_header("Location", GITHUB)
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            return
        if not login_ok(username):
            self._send(200, "image/svg+xml; charset=utf-8", error_svg("username is required").encode(), 60, head)
            return
        theme = (query.get("theme") or ["classic"])[0].strip() or "classic"
        size = (query.get("size") or ["regular"])[0].strip() or "regular"
        flag = (query.get("glyph") or query.get("pfp") or ["1"])[0].strip().lower()
        glyph = flag not in ("0", "no", "off", "false")
        key = (username.lower(), theme, size, glyph)
        with _lock:
            svg = cached(key)
        if svg is None:
            try:
                svg = draw(username, theme, size, glyph)
            except SystemExit as exc:
                message = str(exc) or "card failed"
                self._send(200, "image/svg+xml; charset=utf-8", error_svg(message).encode(), 60, head)
                return
            except Exception:
                self._send(200, "image/svg+xml; charset=utf-8", error_svg("card failed").encode(), 60, head)
                return
            with _lock:
                _cache[key] = (time.time() + TTL, svg)
        self._send(200, "image/svg+xml; charset=utf-8", svg.encode(), TTL, head)

    def _send(self, status, content_type, body, max_age, head):
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", f"public, max-age={max_age}")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        if not head:
            self.wfile.write(body)


def main():
    port = int(os.environ.get("PORT", "8080"))
    server = ThreadingHTTPServer(("0.0.0.0", port), Handler)
    print(f"{CARD} listening on {port}", flush=True)
    server.serve_forever()


if __name__ == "__main__":
    main()
