#!/usr/bin/env node

const https = require("https");
const { execSync } = require("child_process");

const URL = "https://www.badi-info.ch/_temp/zuerichsee-lachen.htm";
const RECIPIENT = "gilles.daniel@gmail.com";

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve(data));
      })
      .on("error", reject);
  });
}

function parseTemperature(html) {
  // Temperature appears as e.g. <b id="t3">4.6</b>&deg;C
  const tempMatch = html.match(/<b id="t\d+">([0-9.]+)<\/b>/);
  if (!tempMatch) throw new Error("Could not parse temperature from page");

  // Timestamp appears as e.g. "Am 15.02. 15:00"
  const timeMatch = html.match(/Am\s+([\d.]+)\s+([\d:]+)/);
  const timestamp = timeMatch ? `${timeMatch[1]} ${timeMatch[2]}` : "unknown time";

  return { temperature: tempMatch[1], timestamp };
}

function sendIMessage(recipient, message) {
  const script = `
    tell application "Messages"
      set targetService to 1st account whose service type = iMessage
      set targetBuddy to participant "${recipient}" of targetService
      send "${message}" to targetBuddy
    end tell
  `;
  execSync(`osascript -e '${script.replace(/'/g, "'\\''")}'`);
}

async function main() {
  console.log(`[${new Date().toISOString()}] Fetching water temperature for Lachen...`);

  const html = await fetchPage(URL);
  const { temperature, timestamp } = parseTemperature(html);

  console.log(`Temperature: ${temperature}°C (measured ${timestamp})`);

  const message = `Good morning! The water temperature in Lachen (Lake Zürich) is currently ${temperature}°C (measured ${timestamp}).`;

  sendIMessage(RECIPIENT, message);

  console.log(`iMessage sent to ${RECIPIENT}`);
}

main().catch((err) => {
  console.error(`[${new Date().toISOString()}] ERROR:`, err.message);
  process.exit(1);
});
