var express = require("express");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

require("./mongodb");

const { authorize } = require("./sheets.js");

var app = express();

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  res.header("Access-Control-Allow-Methods", "*");
  next();
});

app.use(express.static("public"));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require("./routes"));

const fs = require("fs");
const TOKEN_PATH = "token.json";
fs.readFile(TOKEN_PATH, (err) => {
  if (err) {
    authorize();
    return;
  }
});

const PORT = process.env.PORT || 4545;
app.listen(PORT, () => console.log(`⚡⚡ ---> Server started on port ${PORT}`));
