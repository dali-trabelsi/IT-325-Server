let mongoose = require("mongoose");
let ObjectId = mongoose.Schema.Types.ObjectId;

let Grade = new mongoose.Schema({
  student: { type: ObjectId, ref: "Student" },
  date: { type: Date },
  score: Number,
  time: String,
  nbQs: Number,
});

module.exports = mongoose.model("Grade", Grade);
