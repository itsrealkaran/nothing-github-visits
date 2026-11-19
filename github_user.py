"""Load public GitHub stats for any username.

When the logged-in account is that user, owned private repositories
count toward stars and languages. Private repository names are never returned.
"""

import json
import os
import re
import subprocess
import urllib.parse
import urllib.request
from collections import Counter
from datetime import datetime, timedelta, timezone

API = "https://api.github.com/"


def token():
    return os.environ.get("GH_TOKEN") or os.environ.get("GITHUB_TOKEN") or ""


def _http(path, payload=None):
    headers = {
        "Accept": "application/vnd.github+json",
        "User-Agent": "nothing-stat-card",
        "X-GitHub-Api-Version": "2022-11-28",
    }
    tok = token()
    if tok:
        headers["Authorization"] = f"Bearer {tok}"
    data = None
    if payload is not None:
        data = json.dumps(payload).encode()
        headers["Content-Type"] = "application/json"
    request = urllib.request.Request(API + path.lstrip("/"), data=data, headers=headers)
    with urllib.request.urlopen(request) as response:
        return json.load(response)


def _gh(args):
    path = args[0]
    if token():
        return _http(path)
    raw = subprocess.check_output(["gh", "api", path], text=True, stderr=subprocess.STDOUT)
    return json.loads(raw)


def _graphql(query, variables):
    if token():
        payload = _http("graphql", {"query": query, "variables": variables})
    else:
        args = ["graphql", "-f", f"query={query}"]
        for key, value in variables.items():
            args.extend(["-f", f"{key}={value}"])
        raw = subprocess.check_output(["gh", "api", *args], text=True, stderr=subprocess.STDOUT)
        payload = json.loads(raw)
    if payload.get("errors"):
        message = payload["errors"][0].get("message", "github query failed")
        raise SystemExit(message)
    return payload["data"]


def _pages(path):
    page = 1
    while True:
        batch = _gh([f"{path}{'&' if '?' in path else '?'}per_page=100&page={page}"])
        if not batch:
            break
        yield from batch
        if len(batch) < 100:
            break
        page += 1


def viewer():
    try:
        return _gh(["user"]).get("login", "")
    except (subprocess.CalledProcessError, json.JSONDecodeError, KeyError):
        return ""


def profile(login):
    user = _gh([f"users/{login}"])
    created = datetime.fromisoformat(user["created_at"].replace("Z", "+00:00"))
    return {"login": user["login"], "created": created}


def owned_repos(login):
    own = viewer().lower() == login.lower()
    path = "user/repos?visibility=all&affiliation=owner" if own else f"users/{login}/repos?type=owner"
    repos = [repo for repo in _pages(path) if not repo.get("fork")]
    return repos, own


def languages(login):
    repos, _own = owned_repos(login)
    totals = Counter()
    for repo in repos:
        totals.update(_gh([f"repos/{repo['full_name']}/languages"]))
    grand = sum(totals.values()) or 1
    rows = [(name, round(100 * amount / grand, 1)) for name, amount in totals.most_common(5)]
    return {"languages": rows or [["No languages", 0]]}


def public_repos(login):
    repos, _own = owned_repos(login)
    visible = [repo for repo in repos if not repo.get("private")]
    visible.sort(key=lambda repo: repo.get("stargazers_count", 0), reverse=True)
    rows = [[repo["name"], repo.get("stargazers_count", 0)] for repo in visible[:5]]
    return {"repos": rows or [["No public repos", 0]]}


def _calendar(login, start, end):
    query = """
    query($login: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $login) {
        contributionsCollection(from: $from, to: $to) {
          contributionCalendar {
            totalContributions
            weeks { contributionDays { date contributionCount } }
          }
        }
      }
    }
    """
    data = _graphql(
        query,
        {
            "login": login,
            "from": start.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "to": end.strftime("%Y-%m-%dT%H:%M:%SZ"),
        },
    )
    user = data.get("user")
    if not user:
        raise SystemExit(f"no github user named {login}")
    calendar = user["contributionsCollection"]["contributionCalendar"]
    days = []
    for week in calendar["weeks"]:
        for day in week["contributionDays"]:
            days.append((day["date"], day["contributionCount"]))
    return calendar["totalContributions"], days


def contributions(login):
    info = profile(login)
    now = datetime.now(timezone.utc).replace(microsecond=0)
    last_year, _days = _calendar(login, now - timedelta(days=364), now)
    all_days = []
    all_time = 0
    for year in range(info["created"].year, now.year + 1):
        start = max(info["created"], datetime(year, 1, 1, tzinfo=timezone.utc))
        stop = min(now, datetime(year, 12, 31, 23, 59, 59, tzinfo=timezone.utc))
        total, days = _calendar(login, start, stop)
        all_time += total
        all_days.extend(days)
    repos, own = owned_repos(login)
    stars = sum(repo.get("stargazers_count", 0) for repo in repos)
    return {
        "login": info["login"],
        "last_year": last_year,
        "all_time": all_time,
        "stars": stars,
        "stars_label": "stars on owned repos" if own else "stars on public repos",
        "since": info["created"].strftime("%b %Y"),
        "days": all_days,
    }


def streak(login):
    data = contributions(login)
    parsed = []
    for day, count in data["days"]:
        parsed.append((datetime.strptime(day, "%Y-%m-%d").date(), count))
    parsed.sort()
    longest = current = run = 0
    longest_start = longest_end = None
    run_start = None
    previous = None
    for day, count in parsed:
        if count <= 0:
            run = 0
            run_start = None
            previous = day
            continue
        if previous == day - timedelta(days=1) and run:
            run += 1
        else:
            run = 1
            run_start = day
        if run > longest:
            longest = run
            longest_start = run_start
            longest_end = day
        previous = day
    today = datetime.now(timezone.utc).date()
    by_day = dict(parsed)
    cursor = today if by_day.get(today, 0) else today - timedelta(days=1)
    while by_day.get(cursor, 0) > 0:
        current += 1
        cursor -= timedelta(days=1)
    if longest_start:
        span = f"{longest_start.strftime('%b %-d')} to {longest_end.strftime('%b %-d')}"
    else:
        span = "No streak yet"
    return {
        "login": data["login"],
        "total": data["all_time"],
        "current": current,
        "longest": longest,
        "longest_range": span,
        "days": data["days"],
    }


def activity(login):
    data = contributions(login)
    counts = Counter()
    for day, count in data["days"]:
        counts[day[:4]] += count
    info = profile(login)
    years = []
    for year in range(info["created"].year, datetime.now(timezone.utc).year + 1):
        years.append([str(year), counts.get(str(year), 0)])
    return {"login": data["login"], "years": years[-8:]}


def profile_views(login):
    """Read the public profile-view counter once, plus the public profile."""
    safe = urllib.parse.quote(login)
    request = urllib.request.Request(
        f"https://komarev.com/ghpvc/?username={safe}",
        headers={"User-Agent": "nothing-stat-card"},
    )
    with urllib.request.urlopen(request) as response:
        svg = response.read().decode("utf-8", "replace")
    numbers = re.findall(r">([\d,]+)</text>", svg)
    if not numbers:
        raise SystemExit(f"no profile view count for {login}")
    user = _gh([f"users/{login}"])
    created = datetime.fromisoformat(user["created_at"].replace("Z", "+00:00"))
    return {
        "login": user["login"],
        "views": int(numbers[-1].replace(",", "")),
        "followers": user.get("followers", 0),
        "following": user.get("following", 0),
        "since": created.strftime("%b %Y"),
    }
