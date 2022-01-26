const router = require("express").Router();
const { google } = require("googleapis");
const Grade = require("../mongodb/schemas/Grade");
const { authorize } = require("../sheets");
const auth = require("./authorization");

router.post("/", auth.student, async (req, res) => {
  try {
    const sheets = google.sheets({ version: "v4", auth: await authorize() });
    const request = {
      spreadsheetId: req.body.spreadsheetId,
      range: "Result!A1:G1",
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [
          [
            req.body.name,
            req.body.email,
            req.body.class,
            req.body.date,
            req.body.score,
            req.body.time,
            req.body.nbQs,
          ],
        ],
      },
    };

    await sheets.spreadsheets.values.append(request);
    await new Grade({
      student: req.body.s_id,
      date: req.body.date,
      score: +req.body.score.substr(0, req.body.score.length - 1),
      time: req.body.time,
      nbQs: req.body.nbQs,
    }).save();
    res.sendStatus(201);
  } catch (error) {
    res.json({ error: error.message || error });
  }
});

router.get("/byStudent/:id", auth.student, async (req, res) => {
  try {
    const grades = await Grade.find({ student: req.params.id });
    res.json({ grades });
  } catch (error) {
    res.json({ error: error.message || error });
  }
});

router.get("/all/", auth.admin, async (req, res) => {
  try {
    const grades = await Grade.find({}).populate("student").lean();
    grades.forEach((grade, i) => {
      grade.name = grade.student.name;
      grade.class = grade.student.class;
      delete grade.student;
    });
    res.json({ grades });
  } catch (error) {
    res.json({ error: error.message || error });
  }
});

router.patch("/:_id/:score", async (req, res) => {
  try {
    const score = +req.params.score;
    if (score < 0 || score > 100) {
      throw new Error("Invalid score");
    }
    const _id = req.params._id;
    const grade = await Grade.findById(_id);
    grade.score = score;
    await grade.save();
    res.status(204).json({ msg: "Successfully updated score" });
  } catch (error) {
    res.json({ error: error.message || error });
  }
});

module.exports = router;
