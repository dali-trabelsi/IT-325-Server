let mongoose = require("mongoose");

let Sheet = new mongoose.Schema({
  id: { type: String, index: { unique: true } },
  active: { type: Boolean, default: false },
  addedOn: { type: Date, default: new Date() },
});

module.exports = mongoose.model("Sheet", Sheet);
