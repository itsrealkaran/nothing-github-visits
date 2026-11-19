"use strict";

// Python f-strings print an int as "16" and a float 16.0 as "16.0".
// Division always makes a float, so callers wrap those results in F.

class F {
  constructor(value) {
    this.n = +value;
  }

  valueOf() {
    return this.n;
  }
}

function isF(value) {
  return value instanceof F;
}

function n(value) {
  return isF(value) ? value.n : value;
}

function add(a, b) {
  const value = n(a) + n(b);
  return isF(a) || isF(b) ? new F(value) : value;
}

function sub(a, b) {
  const value = n(a) - n(b);
  return isF(a) || isF(b) ? new F(value) : value;
}

function mul(a, b) {
  const value = n(a) * n(b);
  return isF(a) || isF(b) ? new F(value) : value;
}

function div(a, b) {
  return new F(n(a) / n(b));
}

function f(value) {
  return new F(n(value));
}

function pyFloat(value) {
  const x = n(value);
  if (!Number.isFinite(x)) return String(x);
  if (Object.is(x, -0)) return "-0.0";
  const nearest = Math.round(x);
  if (Math.abs(x - nearest) < 1e-9 && Math.abs(x) < 1e15) return nearest.toFixed(1);
  return String(x);
}

function py(value) {
  if (isF(value)) return pyFloat(value.n);
  if (typeof value === "number") {
    if (Number.isInteger(value)) return String(value);
    return pyFloat(value);
  }
  return String(value);
}

function fixed(value, digits) {
  const x = n(value);
  if (!Number.isFinite(x)) return String(x);
  const neg = x < 0;
  const rounded = roundDecimal(Math.abs(x), digits);
  if (digits === 0) return (neg ? "-" : "") + rounded.toString();
  const text = rounded.toString().padStart(digits + 1, "0");
  return (neg ? "-" : "") + text.slice(0, -digits) + "." + text.slice(-digits);
}

function roundDecimal(value, digits) {
  if (value === 0) return 0n;
  const view = new DataView(new ArrayBuffer(8));
  view.setFloat64(0, value);
  const bits = view.getBigUint64(0);
  const biased = Number((bits >> 52n) & 0x7ffn);
  const fraction = bits & ((1n << 52n) - 1n);
  let mantissa;
  let power;
  if (biased === 0) {
    mantissa = fraction;
    power = -1022 - 52;
  } else {
    mantissa = fraction | (1n << 52n);
    power = biased - 1023 - 52;
  }
  let integer = mantissa * (5n ** BigInt(digits));
  const shift = power + digits;
  if (shift >= 0) return integer << BigInt(shift);
  const drop = -shift;
  const half = 1n << BigInt(drop - 1);
  const mask = (1n << BigInt(drop)) - 1n;
  const quot = integer >> BigInt(drop);
  const rem = integer & mask;
  if (rem > half || (rem === half && (quot & 1n) === 1n)) return quot + 1n;
  return quot;
}

function pyRound(value, digits) {
  if (digits === undefined) return parseInt(fixed(value, 0), 10);
  return new F(Number(fixed(value, digits)));
}

function commas(value) {
  const x = Math.trunc(n(value));
  const body = String(Math.abs(x)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return x < 0 ? "-" + body : body;
}

function xml(text) {
  return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

module.exports = { F, isF, n, add, sub, mul, div, f, py, pyFloat, fixed, pyRound, commas, xml };
