"use strict";

const https = require("https");
const { execFile } = require("child_process");

const API = "https://api.github.com/";
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const fs = require("fs");
const path = require("path");

function loadDotEnv() {
  const file = path.join(__dirname, "..", ".env");
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const index = trimmed.indexOf("=");
    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}

loadDotEnv();

function token() {
  return process.env.GH_TOKEN || process.env.GITHUB_TOKEN || "";
}

function fail(message) {
  const error = new Error(message);
  error.card = true;
  throw error;
}

function request(url, options) {
  const method = (options && options.method) || "GET";
  const headers = (options && options.headers) || {};
  const body = options && options.body;
  return new Promise((resolve, reject) => {
    const req = https.request(url, { method, headers }, (res) => {
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => {
        const buf = Buffer.concat(chunks);
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          const next = new URL(res.headers.location, url).toString();
          resolve(request(next, { method: "GET", headers }));
          return;
        }
        resolve({ status: res.statusCode, body: buf, headers: res.headers });
      });
    });
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

async function http(path, payload) {
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "nothing-stat-card",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  const tok = token();
  if (tok) headers.Authorization = "Bearer " + tok;
  let body = null;
  if (payload !== undefined) {
    body = JSON.stringify(payload);
    headers["Content-Type"] = "application/json";
  }
  const response = await request(API + String(path).replace(/^\//, ""), {
    method: payload === undefined ? "GET" : "POST",
    headers,
    body,
  });
  if (response.status < 200 || response.status >= 300) {
    let detail = "";
    try {
      detail = JSON.parse(response.body.toString("utf8")).message || "";
    } catch (error) {
      detail = response.body.toString("utf8").slice(0, 180);
    }
    fail(detail || "HTTP Error " + response.status);
  }
  return JSON.parse(response.body.toString("utf8"));
}

function ghApi(args) {
  return new Promise((resolve, reject) => {
    execFile("gh", ["api", ...args], { maxBuffer: 32 * 1024 * 1024 }, (error, stdout, stderr) => {
      if (error) {
        error.message = (stderr || stdout || error.message || "").trim() || error.message;
        reject(error);
        return;
      }
      try {
        resolve(JSON.parse(stdout));
      } catch (parseError) {
        reject(parseError);
      }
    });
  });
}

async function gh(path) {
  if (token()) return http(path);
  return ghApi([path]);
}

async function graphql(query, variables) {
  let payload;
  if (token()) {
    payload = await http("graphql", { query, variables });
  } else {
    const args = ["graphql", "-f", "query=" + query];
    for (const [key, value] of Object.entries(variables)) args.push("-f", key + "=" + value);
    payload = await ghApi(args);
  }
  if (payload.errors && payload.errors.length) {
    fail((payload.errors[0] && payload.errors[0].message) || "github query failed");
  }
  return payload.data;
}

async function pages(path) {
  const rows = [];
  let page = 1;
  for (;;) {
    const joiner = path.includes("?") ? "&" : "?";
    const batch = await gh(path + joiner + "per_page=100&page=" + page);
    if (!batch || !batch.length) break;
    rows.push(...batch);
    if (batch.length < 100) break;
    page += 1;
  }
  return rows;
}

async function viewer() {
  try {
    const user = await gh("user");
    return (user && user.login) || "";
  } catch (error) {
    return "";
  }
}

function parseCreated(value) {
  return new Date(value);
}

function stamp(date) {
  const pad = (value) => String(value).padStart(2, "0");
  return (
    date.getUTCFullYear() + "-" + pad(date.getUTCMonth() + 1) + "-" + pad(date.getUTCDate()) +
    "T" + pad(date.getUTCHours()) + ":" + pad(date.getUTCMinutes()) + ":" + pad(date.getUTCSeconds()) + "Z"
  );
}

function utcNow() {
  const date = new Date();
  date.setUTCMilliseconds(0);
  return date;
}

function addMs(date, ms) {
  return new Date(date.getTime() + ms);
}

function dateOnly(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function parseDay(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function dayKey(date) {
  const pad = (value) => String(value).padStart(2, "0");
  return date.getUTCFullYear() + "-" + pad(date.getUTCMonth() + 1) + "-" + pad(date.getUTCDate());
}

function addDays(date, count) {
  return new Date(date.getTime() + count * 86400000);
}

function monthName(date) {
  return MONTHS[date.getUTCMonth()];
}

function monthYear(date) {
  return monthName(date) + " " + date.getUTCFullYear();
}

function monthDay(date) {
  return monthName(date) + " " + date.getUTCDate();
}

function monthDayYear(date) {
  return monthName(date) + " " + date.getUTCDate() + ", " + date.getUTCFullYear();
}

async function profile(login, withName) {
  const user = await gh("users/" + login);
  const created = parseCreated(user.created_at);
  const row = { login: user.login, created, user };
  if (withName) row.name = user.name || user.login;
  return row;
}

async function ownedRepos(login) {
  const own = (await viewer()).toLowerCase() === login.toLowerCase();
  const path = own ? "user/repos?visibility=all&affiliation=owner" : "users/" + login + "/repos?type=owner";
  const repos = (await pages(path)).filter((repo) => !repo.fork);
  return { repos, own };
}

async function calendar(login, start, end) {
  const query = `
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
    `;
  const data = await graphql(query, { login, from: stamp(start), to: stamp(end) });
  const user = data && data.user;
  if (!user) fail("no github user named " + login);
  const cal = user.contributionsCollection.contributionCalendar;
  const days = [];
  for (const week of cal.weeks) {
    for (const day of week.contributionDays) days.push([day.date, day.contributionCount]);
  }
  return { total: cal.totalContributions, days };
}

async function contributionTotals(login, options) {
  const info = await profile(login, !!(options && options.name));
  const now = utcNow();
  const last = await calendar(login, addMs(now, -364 * 86400000), now);
  let allTime = 0;
  const allDays = [];
  for (let year = info.created.getUTCFullYear(); year <= now.getUTCFullYear(); year += 1) {
    const start = info.created > new Date(Date.UTC(year, 0, 1)) ? info.created : new Date(Date.UTC(year, 0, 1));
    const stopBound = new Date(Date.UTC(year, 11, 31, 23, 59, 59));
    const stop = now < stopBound ? now : stopBound;
    const block = await calendar(login, start, stop);
    allTime += block.total;
    allDays.push(...block.days);
  }
  const owned = await ownedRepos(login);
  const stars = owned.repos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
  return {
    login: info.login,
    name: info.name,
    created: info.created,
    lastYear: last.total,
    allTime,
    stars,
    starsLabel: owned.own ? "stars on owned repos" : "stars on public repos",
    since: monthYear(info.created),
    year: info.created.getUTCFullYear(),
    own: owned.own,
    repos: owned.repos,
    days: allDays,
  };
}

function mostCommon(counter, limit) {
  const entries = [...counter.entries()];
  entries.sort((a, b) => b[1] - a[1]);
  return limit == null ? entries : entries.slice(0, limit);
}

function pyRound(value, digits) {
  const { fixed } = require("./format");
  if (digits === undefined) return parseInt(fixed(value, 0), 10);
  return Number(fixed(value, digits));
}

module.exports = {
  fail,
  request,
  gh,
  graphql,
  pages,
  viewer,
  profile,
  ownedRepos,
  calendar,
  contributionTotals,
  mostCommon,
  pyRound,
  dateOnly,
  parseDay,
  dayKey,
  addDays,
  monthYear,
  monthDay,
  monthDayYear,
  utcNow,
};
