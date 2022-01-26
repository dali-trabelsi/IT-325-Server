const router = require("express").Router();

const admin = require("./admin");
const student = require("./student");
const sheets = require("./sheets");
const grades = require("./grade");

router.use(function (req, res, next) {
  res.header("Access-Control-Allow-Headers", "*");
  next();
});

router.use("/admin", admin);
router.use("/student", student);
router.use("/sheet", sheets);
router.use("/grades", grades);

router.get("/", (req, res) => {
  res.status(200).send();
});

module.exports = router;
