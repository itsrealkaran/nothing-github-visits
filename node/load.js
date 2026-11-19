"use strict";

const { gh, monthYear, request } = require("./github");

async function load(login) {
  const safe = encodeURIComponent(login);
  const response = await request("https://komarev.com/ghpvc/?username=" + safe, {
    headers: { "User-Agent": "nothing-stat-card" },
  });
  const svg = response.body.toString("utf8");
  const numbers = [...svg.matchAll(/>([\d,]+)<\/text>/g)].map((match) => match[1]);
  if (!numbers.length) {
    const error = new Error("no profile view count for " + login);
    error.card = true;
    throw error;
  }
  const user = await gh("users/" + login);
  const created = new Date(user.created_at);
  return {
    login: user.login,
    views: Number(numbers[numbers.length - 1].replace(/,/g, "")),
    followers: user.followers || 0,
    following: user.following || 0,
    since: monthYear(created),
  };
}

module.exports = { load };
