const fetch = require("node-fetch");

const BASE = "https://adventofcode.com";

async function fetchInput(year, day, sessionCookie) {
    const res = await fetch(`${BASE}/${year}/day/${day}/input`, {
        headers: {
        "Cookie": `session=${sessionCookie}`
        }
    });
    
    if (!res.ok) throw new Error(`Failed to fetch input: ${res.status}`);
    
    return res.text();
}

async function submitAnswer(year, day, level, answer, sessionCookie) {
  const res = await fetch(`${BASE}/${year}/day/${day}/answer`, {
    method: "POST",
    headers: {
      "Cookie": `session=${sessionCookie}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: `level=${level}&answer=${answer}`
  });

  const html = await res.text();

  if (html.includes("That's the right answer")) {
    return { status: "success", html };
  } else if (html.includes("That's not the right answer")) {
    return { status: "wrong", html };
  } else {
    return { status: "unknown", html };
  }
}

module.exports = { fetchInput, submitAnswer };
