const { db } = require("./db");
const bcrypt = require("bcrypt"); // Import bcrypt package in order to encrypt the password
const saltRounds = 10; // Let saltRoulds be '10' for hasing purpose
const jwt = require("jsonwebtoken"); // Import jsonwebtoken package in order to create tokens

function emiEmcAPIs(app, io, labbeeUsers) {
  //To store CTRF form to the 'ctrf_table' table:
  app.post("/api/add-ctrf", async (req, res) => {
    const { enteredCompanyId, formattedCTRFId, loggedInUser, ctrfStatus } =
      req.body;
    console.log(req.body);

    try {
      const salt = await bcrypt.genSalt(saltRounds);
      const hashedCTRFId = await bcrypt.hash(formattedCTRFId, salt);
      console.log("hashedCtrfId", hashedCTRFId);

      const ctrfLink = `http://localhost:3000/emi-emc/ctrf/${hashedCTRFId}`;

      const sqlQuery = `INSERT INTO ctrf_table(company_id, ctrf_referance_id, ctrf_link, ctrf_created_by, ctrf_status) VALUES (?,?,?,?,?)`;

      const ctrfValues = [
        enteredCompanyId,
        formattedCTRFId,
        ctrfLink,
        loggedInUser,
        ctrfStatus || "Active",
      ];
      db.query(sqlQuery, ctrfValues, (error, result) => {
        if (error) {
          res.status(500).json(error.message);
          console.log("Error while saving the CTRF: ", error.message);
        } else {
          res.status(200).json({ message: "CTRF added successfully" });
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
      console.log("Error while hashing the CTRF ID: ", error.message);
    }
  });
}

module.exports = { emiEmcAPIs };
