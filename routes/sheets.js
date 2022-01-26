const router = require("express").Router();

const Sheet = require("../mongodb/schemas/Sheet.js");
const { authorize, appendToSheet, getFromSheet } = require("../sheets.js");

router.get("/all/:sheetId", async (req, res) => {
  authorize()
    .then(async (auth) => {
      try {
        const data = await getFromSheet(auth, req.params.sheetId);
        res.json(data);
      } catch (error) {
        res.json({ error: error.message || error });
      }
    })
    .catch((error) => {
      res.json({ error: error.message || error });
    });
});

router.get("/byName/:sheetId/:class", async (req, res) => {
  const className = req.params.class;
  authorize()
    .then(async (auth) => {
      try {
        const sheetData = await getFromSheet(auth, req.params.sheetId);
        sheetData.shift();
        res.json(
          sheetData.filter((x) => {
            return x.sheet === className;
          })[0].Questions
        );
      } catch (error) {
        res.json({ error: error.message || error });
      }
    })
    .catch((error) => {
      res.json({ error: error.message || error });
    });
});

router.get("/currently-active", (req, res) => {
  Sheet.findOne({ active: true })
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      res.json({ err: err.message || err });
    });
});

router.get("/classes/list", (req, res) => {
  authorize()
    .then(async (auth) => {
      try {
        const sheet = await Sheet.findOne({ active: true });
        console.log(sheet);
        if (!sheet) {
          throw new Error(
            "There was a problem fetching the active spreadsheet"
          );
        }
        const data = await getFromSheet(auth, sheet.id, res);
        res.json(data);
      } catch (error) {
        res.json({ error: error.message || error });
      }
    })
    .catch((error) => {
      res.json({ error: error.message || error });
    });
});

router.post("/add-one/:id", async (req, res) => {
  new Sheet({ id: req.params.id })
    .save()
    .then((data) => {
      res.status(200).send({ msg: "speadsheet added successfully", data });
    })
    .catch((err) => {
      res.status(400).send({ err: err.message || err });
    });
});

router.put("/activate-one/:id", async (req, res) => {
  Sheet.findOne({ id: req.params.id })
    .then(async (sheet) => {
      if (!sheet) {
        throw new Error("sheet not found");
      }
      if (sheet.active) {
        throw new Error("sheet is already active");
      }
      currentlyActiveSheet = await Sheet.findOne({ active: true });
      currentlyActiveSheet.active = false;
      sheet.active = true;
      await currentlyActiveSheet.save();
      await sheet.save();
      res.status(200).send({ msg: "speadsheet was activated" });
    })
    .catch((err) => {
      console.log(err);
      res.status(400).send({ err: err.message || err });
    });
});

module.exports = router;
