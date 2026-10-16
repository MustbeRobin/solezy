const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");

const publicDir = path.join(__dirname, "..");

test("public home uses the Soezy security landing page and real runtime script", () => {
  const html = fs.readFileSync(path.join(publicDir, "public", "index.html"), "utf8");
  const script = fs.readFileSync(path.join(publicDir, "public", "assets", "home.js"), "utf8");

  assert.match(html, /Security for your server/);
  assert.match(html, /\/assets\/home\.css/);
  assert.match(html, /\/assets\/home\.js/);
  assert.match(html, /href="\/invite"/);
  assert.match(html, /href="\/dashboard"/);
  assert.doesNotMatch(html, /Zynrax/i);
  assert.match(script, /\/api\/auth\/session/);
  assert.match(script, /\/api\/stats/);
  assert.match(script, /Connection unavailable/);
});
