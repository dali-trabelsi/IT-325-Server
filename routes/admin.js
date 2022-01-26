const router = require("express").Router();
const validate = require("./dataValidation");
const jwt = require("jsonwebtoken");
const auth = require("./authorization");
const Grade = require("../mongodb/schemas/Grade");
const Student = require("../mongodb/schemas/Student");

router.post("/login", async (req, res) => {
  const data = {
    email: req.body.email,
    password: req.body.password,
  };
  if (validate.adminLogin(data).isValid) {
    const accessToken = jwt.sign(
      { email: data.email },
      process.env.ADMIN_TOKEN_SECRET
    );
    res.json({ authorized: true, accessToken });
  } else {
    res.json({
      type: "error",
      msg: validate.adminLogin(data).msg,
    });
  }
});

router.get("/verifyToken", auth.admin, (req, res) => {
  res.json({ authorized: true });
});

router.get("/dashboard/stats", auth.admin, async (req, res) => {
  try {
    const requests = await Student.countDocuments({ confirmed: false });
    const students = await Student.countDocuments({ confirmed: true });
    const grades = await Grade.countDocuments({});
    res.json({ requests, students, grades });
  } catch (error) {
    res.json({ error: error.message || error });
  }
});

module.exports = router;
