let mongoose = require("mongoose");

let Student = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  class: String,
  sheetId: String,
  addedOn: String,
  confirmed: { type: Boolean, default: false },
});

module.exports = mongoose.model("Student", Student);
