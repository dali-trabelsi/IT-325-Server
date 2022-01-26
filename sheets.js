const readline = require("readline");
const { google } = require("googleapis");
const fs = require("fs");

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const TOKEN_PATH = "token.json";

function authorize(callback) {
  return new Promise((resolve, reject) => {
    fs.readFile("credentials.json", (err, content) => {
      if (err) reject("Error loading client secret file: " + err);

      const credentials = JSON.parse(content);
      const { client_secret, client_id, redirect_uris } = credentials.web;
      const oAuth2Client = new google.auth.OAuth2(
        client_id,
        client_secret,
        redirect_uris[0]
      );

      // Check if we have previously stored a token.
      fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) {
          resolve(getNewToken(oAuth2Client, callback));
          return;
        }
        oAuth2Client.setCredentials(JSON.parse(token));
        resolve(oAuth2Client);
      });
    });
  });
}

function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });
  console.log("Authorize this app by visiting this url:", authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question("Enter the code from that page here: ", (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err)
        return console.error(
          "Error while trying to retrieve access token",
          err
        );
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log("Token stored to", TOKEN_PATH);
      });
      if (typeof callback == "function") {
        callback(oAuth2Client);
      }
    });
  });
}

async function getFromSheet(auth, spreadsheetId) {
  const sheets = google.sheets({ version: "v4", auth });
  let ranges = [];
  let questions = [];

  const sheetRanges = await sheets.spreadsheets.get({
    spreadsheetId,
  });

  let i = 0;
  while (sheetRanges.data.sheets[i]) {
    ranges.push(sheetRanges.data.sheets[i].properties.title);
    i++;
  }

  const res = await sheets.spreadsheets.values.batchGet({
    spreadsheetId,
    ranges,
  });

  let j = 0;
  let Tranges = [];
  while (res.data.valueRanges[j]) {
    if (res.data.valueRanges[j].values && ranges[j] != "Result") {
      Tranges.push(ranges[j]);
      let skip = 0;
      let tempQuests = res.data.valueRanges[j].values.map((x) => {
        if (skip > 0) {
          const temp = {
            Question: x[0],
            A: x[1],
            B: x[2],
            C: x[3],
            D: x[4],
            Correct_Answer: x[5],
          };
          return temp;
        }
        skip++;
      });
      tempQuests.shift();
      questions.push({ sheet: ranges[j], Questions: tempQuests });
    }
    j++;
  }
  questions.unshift(Tranges);
  return questions;
}

module.exports = { authorize, getFromSheet };
