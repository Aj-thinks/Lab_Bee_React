const { db } = require("./db");

const dayjs = require("dayjs");
const moment = require("moment");

const multer = require("multer");
const path = require("path");
const fs = require("fs");

// function of jobcard api's:
function jobcardsAPIs(app, io, labbeeUsers) {
  // const filesUploadedFolderPath = path.join(process.cwd(), 'FilesUploaded');
  // console.log('Path to FilesUploaded folder:', filesUploadedFolderPath);

  // Endpoint to fetch individual attachment
  // app.get('/api/attachments/:filename', (req, res) => {
  //     const { filename } = req.params;
  //     const filePath = path.join(__dirname, 'FilesUploaded', filename);

  //     // Send the file as a response
  //     res.sendFile(filePath);
  // });

  function convertDateTime(originalTimestamp) {
    if (!originalTimestamp) {
      return "";
    }
    const dateObject = new Date(originalTimestamp);
    const year = dateObject.getFullYear();
    const month = String(dateObject.getMonth() + 1).padStart(2, "0"); // Month is zero-indexed
    const day = String(dateObject.getDate()).padStart(2, "0");
    const hours = String(dateObject.getHours()).padStart(2, "0");
    const minutes = String(dateObject.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}`;
  }

  // Add primary details of the jobcard to the 'bea_jobcards' table:
  app.post("/api/jobcard", (req, res) => {
    const {
      jcNumber,
      srfNumber,
      srfDate,
      dcNumber,
      jcOpenDate,
      itemReceivedDate,
      poNumber,
      testCategory,
      testDiscipline,
      sampleCondition,
      typeOfRequest,
      reportType,
      testInchargeName,
      jcCategory,
      companyName,
      companyAddress,
      customerName,
      customerEmail,
      customerNumber,
      projectName,
      testInstructions,
      jcStatus,
      reliabilityReportStatus,
      jcCloseDate,
      observations,
      jcLastModifiedBy,
      loggedInUser,
      loggedInUserDepartment,
    } = req.body;

    const formattedSrfDate = srfDate
      ? dayjs(srfDate).format("YYYY-MM-DD")
      : null;

    const formattedItemReceivedDate = itemReceivedDate
      ? dayjs(itemReceivedDate).format("YYYY-MM-DD")
      : null;
    const formattedOpenDate = jcOpenDate
      ? dayjs(jcOpenDate).format("YYYY-MM-DD")
      : null;
    const formattedCloseDate = jcCloseDate
      ? dayjs(jcCloseDate).format("YYYY-MM-DD")
      : null;

    const sql = `INSERT INTO bea_jobcards(
        jc_number, srf_number, srf_date, dcform_number, jc_open_date, item_received_date, po_number, 
        test_category, test_discipline, sample_condition, type_of_request, report_type, test_incharge, jc_category, company_name, company_address,
        customer_name, customer_email, customer_number, project_name, test_instructions, 
         jc_status, reliability_report_status, jc_closed_date, observations, last_updated_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [
      jcNumber,
      srfNumber,
      formattedSrfDate,
      dcNumber,
      formattedOpenDate || null,
      formattedItemReceivedDate || null,
      poNumber || "",
      testCategory || "",
      testDiscipline || "",
      sampleCondition || "",
      typeOfRequest || "",
      reportType || "",
      testInchargeName || "",
      jcCategory || "",
      companyName || "",
      companyAddress || "",
      customerName || "",
      customerEmail || "",
      customerNumber || "",
      projectName || "",
      testInstructions || "",
      jcStatus || "",
      reliabilityReportStatus || "",
      formattedCloseDate || null,
      observations || "",
      jcLastModifiedBy || loggedInUser,
    ];

    db.query(sql, values, (error, result) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
      } else {
        // Emit the event to specific departments
        const departmentsToNotify = [
          "Administration",
          "Accounts",
          "TS1 Testing",
          "Reliability",
        ];

        for (let socketId in labbeeUsers) {
          if (
            departmentsToNotify.includes(labbeeUsers[socketId].department) &&
            labbeeUsers[socketId].username !== loggedInUser
          ) {
            let message = "";

            if (jcCategory === "TS1") {
              message = `New TS1 ${jcNumber} created by ${loggedInUser}`;
            } else if (jcCategory === "Reliability") {
              message = `New Reliability ${jcNumber} created by ${loggedInUser}`;
            } else if (jcCategory === "TS2") {
              message = `New TS2 ${jcNumber} created by ${loggedInUser}`;
            }

            io.to(socketId).emit("jobcard_submit_notification", {
              message: message,
              sender: loggedInUser,
            });
          }
        }

        return res.status(200).json({ message: "Jobcards added successfully" });
      }
    });
  });

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // API to fetch the primary data of Testing JC's:
  app.get("/api/getPrimaryJCDataOfTS1", (req, res) => {
    const { year, month } = req.query;

    // Convert month name to month number
    const monthNumber = monthNames.indexOf(month) + 1;

    if (monthNumber === 0 || !year) {
      return res.status(400).json({ error: "Invalid year or month format" });
    }

    const getJCColumns = `
                            SELECT 
                                id, jc_number, DATE_FORMAT(jc_open_date, '%Y-%m-%d') as jc_open_date, company_name, jc_status, DATE_FORMAT(jc_closed_date, '%Y-%m-%d') as jc_closed_date, last_updated_by
                            FROM 
                                bea_jobcards
                            WHERE 
                                jc_category = 'TS1' AND
                                MONTH(jc_open_date) = ? AND YEAR(jc_open_date) = ?
                            `;

    db.query(getJCColumns, [monthNumber, year], (error, result) => {
      if (error) {
        return res.status(500).json({
          error: "An error occurred while fetching Testing JC table data",
        });
      }
      res.send(result);
    });
  });

  // API to fetch the primary data of Testing JC's:
  app.get("/api/getPrimaryJCDataOfReliability", (req, res) => {
    const { year, month } = req.query;

    // Convert month name to month number
    const monthNumber = monthNames.indexOf(month) + 1;

    if (monthNumber === 0 || !year) {
      return res.status(400).json({ error: "Invalid year or month format" });
    }

    const getReliabilityJCColumns = `
                            SELECT 
                                id, jc_number, DATE_FORMAT(jc_open_date, '%Y-%m-%d') as jc_open_date, company_name, project_name, reliability_report_status, jc_status, DATE_FORMAT(jc_closed_date, '%Y-%m-%d') as jc_closed_date, last_updated_by 
                            FROM 
                                bea_jobcards
                            WHERE 
                                jc_category = 'Reliability' AND
                                MONTH(jc_open_date) = ? AND YEAR(jc_open_date) = ?
                            `;

    db.query(getReliabilityJCColumns, [monthNumber, year], (error, result) => {
      if (error) {
        return res.status(500).json({
          error: "An error occurred while fetching Reliability JC table data",
        });
      }
      res.send(result);
    });
  });

  // Get the JC's between two date ranges:
  app.get("/api/getPrimaryTestingJCDataBwTwoDates", (req, res) => {
    const { selectedJCDateRange } = req.query;

    if (!selectedJCDateRange || typeof selectedJCDateRange !== "string") {
      return res.status(400).json({ error: "Invalid date range format" });
    }

    const [fromDate, toDate] = selectedJCDateRange.split(" - ");

    if (!fromDate || !toDate) {
      return res.status(400).json({ error: "Invalid date range format" });
    }

    const getJCColumns = `
        SELECT id, jc_number, DATE_FORMAT(jc_open_date, '%Y-%m-%d') as jc_open_date, company_name, jc_status, last_updated_by 
        FROM bea_jobcards
        WHERE jc_open_date BETWEEN ? AND ?
    `;

    db.query(getJCColumns, [fromDate, toDate], (error, result) => {
      if (error) {
        return res
          .status(500)
          .json({ error: "An error occurred while fetching JC table data" });
      }
      res.send(result);
      // console.log('Result:', result);
    });
  });

  app.get("/api/getPrimaryReliabilityJCDataBwTwoDates", (req, res) => {
    const { selectedJCDateRange } = req.query;

    if (!selectedJCDateRange || typeof selectedJCDateRange !== "string") {
      return res.status(400).json({ error: "Invalid date range format" });
    }

    const [fromDate, toDate] = selectedJCDateRange.split(" - ");

    if (!fromDate || !toDate) {
      return res.status(400).json({ error: "Invalid date range format" });
    }

    const getJCColumns = `
        SELECT id, jc_number, DATE_FORMAT(jc_open_date, '%Y-%m-%d') as jc_open_date, company_name, project_name, reliability_report_status, jc_status, last_updated_by  
        FROM bea_jobcards
        WHERE jc_open_date BETWEEN ? AND ?
    `;

    db.query(getJCColumns, [fromDate, toDate], (error, result) => {
      if (error) {
        return res
          .status(500)
          .json({ error: "An error occurred while fetching JC table data" });
      }
      res.send(result);
      // console.log('Result:', result);
    });
  });

  // To delete the jobcards  from the table:
  // app.delete("/api/getjobcard/:jc_number", (req, res) => {
  //     const jcnumber = req.params.jc_number;
  //     const deleteQuery = "DELETE FROM bea_jobcards WHERE jc_number = ?";

  //     db.query(deleteQuery, [jcnumber], (error, result) => {
  //         if (error) {
  //             return res.status(500).json({ error: "An error occurred while deleting the module" });
  //         }
  //         res.status(200).json({ message: "jobcards data deleted successfully" });
  //     });
  // });

  // To Edit the selected jobcards:
  app.post("/api/jobcard/:id", (req, res) => {
    const {
      jcNumber,
      srfNumber,
      srfDate,
      dcNumber,
      jcOpenDate,
      itemReceivedDate,
      poNumber,
      testCategory,
      testDiscipline,
      sampleCondition,
      typeOfRequest,
      reportType,
      testInchargeName,
      jcCategory,
      companyName,
      companyAddress,
      customerName,
      customerEmail,
      customerNumber,
      projectName,
      testInstructions,
      jcStatus,
      reliabilityReportStatus,
      jcCloseDate,
      observations,
      jcLastModifiedBy,
      loggedInUser,
      loggedInUserDepartment,
    } = req.body;

    const formattedSrfDate = srfDate ? convertDateTime(srfDate) : null;
    const formattedItemReceivedDate = itemReceivedDate
      ? dayjs(itemReceivedDate).format("YYYY-MM-DD")
      : null;
    // const referanceDocsSerialized = JSON.stringify(referanceDocs);
    const formattedOpenDate = jcOpenDate ? convertDateTime(jcOpenDate) : null;
    const formattedCloseDate = jcCloseDate
      ? convertDateTime(jcCloseDate)
      : null;

    const sqlQuery = `
        UPDATE bea_jobcards SET
            srf_number = ?,
            srf_date = ?,
            dcform_number = ?, 
            jc_open_date = ?, 
            item_received_date = ?,
            po_number = ?, 
            test_category = ?, 
            test_discipline = ?,
            sample_condition = ?,
            type_of_request = ?, 
            report_type = ?,
            test_incharge = ?, 
            jc_category = ?, 
            company_name = ?, 
            company_address = ?,
            customer_name = ?, 
            customer_email = ?, 
            customer_number = ?, 
            project_name = ?, 
            test_instructions = ?,
            jc_status = ?, 
            reliability_report_status = ?, 
            jc_closed_date = ?, 
            observations = ?,
            last_updated_by = ?
        WHERE jc_number = ?
    `;

    const values = [
      srfNumber,
      formattedSrfDate,
      dcNumber,
      formattedOpenDate,
      formattedItemReceivedDate,
      poNumber,
      testCategory,
      testDiscipline,
      sampleCondition,
      typeOfRequest,
      reportType,
      testInchargeName,
      jcCategory,
      companyName,
      companyAddress,
      customerName,
      customerEmail,
      customerNumber,
      projectName,
      testInstructions,
      jcStatus,
      reliabilityReportStatus,
      formattedCloseDate,
      observations,
      loggedInUser,
      jcNumber,
    ];

    db.query(sqlQuery, values, (error, result) => {
      if (error) {
        console.error("Error executing query:", error.message);
        return res
          .status(500)
          .json({ message: "Internal server error", error: error.message });
      }
      if (result.affectedRows === 0) {
        console.warn("No rows updated. Check if the jc_number exists.");
        return res.status(404).json({ message: "Jobcard not found" });
      }

      // io.emit("jobcard_update_notification", {
      //   message: `TS1 JC ${jcNumber} updated by ${loggedInUser}`,
      //   sender: loggedInUser,
      // });

      const departmentsToNotify = [
        "Administration",
        "Accounts",
        "TS1 Testing",
        "Reliability",
      ];

      for (let socketId in labbeeUsers) {
        if (
          departmentsToNotify.includes(labbeeUsers[socketId].department) &&
          labbeeUsers[socketId].username !== loggedInUser
        ) {
          let message = "";

          if (jcCategory === "TS1") {
            message = `TS1 JC ${jcNumber} updated by ${loggedInUser}`;
          } else if (jcCategory === "Reliability") {
            message = `Reliability JC ${jcNumber} updated by ${loggedInUser}`;
          } else if (jcCategory === "TS2") {
            message = `TS2 JC ${jcNumber} updated by ${loggedInUser}`;
          }

          io.to(socketId).emit("jobcard_update_notification", {
            message: message,
            sender: loggedInUser,
          });
        }
      }
      res.status(200).json({
        message: "Jobcard updated successfully",
      });
    });
  });

  // To fetch the jcnumber from the table 'jobcards'
  app.get("/api/getjobcard", (req, res) => {
    const sqlQuery = `SELECT jc_number FROM bea_jobcards`;
    db.query(sqlQuery, (error, result) => {
      if (error) {
        return res
          .status(500)
          .json({ error: "An error occurred while fetching data" });
      }
      res.send(result);
    });
  });

  // To fetch the data based on the jcnumber from the table 'jobcards'
  app.get("/api/getjobcardlist/:jc_number", (req, res) => {
    const jcnumber = req.params.jc_number;
    const sqlQuery = `SELECT  dcform_number, jc_opendate, po_number, category, test_inchargename, company_name, customer_number, customer_signature, project_name, sample_condition, referance_document FROM bea_jobcards WHERE jc_number = ?`;

    db.query(sqlQuery, [jcnumber], (error, result) => {
      if (error) {
        return res
          .status(500)
          .json({ error: "An error occurred while fetching data" });
      }
      res.send(result);
    });
  });

  // To fetch the last saved jcnumber  from the table jobcards data table:
  app.get("/api/getLatestjcnumber", (req, res) => {
    const latestjcnumberJT =
      "SELECT jc_number FROM bea_jobcards ORDER BY id  DESC LIMIT 1 ";
    db.query(latestjcnumberJT, (error, result) => {
      if (result.length === 0) {
        res.send([
          {
            jc_number: "2023-24/12-000",
          },
        ]);
      } else {
        res.send(result);
      }
    });
  });

  app.post("/api/getJCCount", (req, res) => {
    const { finYear } = req.body;

    let sql = `SELECT COUNT(*) FROM bea_jobcards WHERE jc_number LIKE '${finYear}%'`;

    db.query(sql, (error, result) => {
      if (error) {
        console.log(error);
        return res.status(500).json(error);
      } else {
        return res.status(200).json(result[0]["COUNT(*)"]);
      }
    });
  });

  // To delete the eut_details  from the table:
  app.delete("/api/geteutdetails/:jc_number", (req, res) => {
    const jcnumber = req.params.jc_number;
    const deleteQuery = "DELETE FROM eut_details WHERE jc_number = ?";

    db.query(deleteQuery, [jcnumber], (error, result) => {
      if (error) {
        return res
          .status(500)
          .json({ error: "An error occurred while deleting the module" });
      }
      res.status(200).json({ message: "eutdetails data deleted successfully" });
    });
  });

  // To Insert or delete EUTDetails:
  app.post("/api/eutdetails/serialNos/", (req, res) => {
    let { serialNos, jcNumberString } = req.body;
    let sqlQuery = "SELECT serialNo FROM eut_details WHERE jc_number=?";
    db.query(sqlQuery, [jcNumberString], (error, result) => {
      if (error) return res.status(500).json(error.message);
      let newResult = result.map((item) => item.serialNo);
      let toDelete = newResult.filter(function (el) {
        return !serialNos.includes(el);
      });
      let toAdd = serialNos.filter(function (el) {
        return !newResult.includes(el);
      });
      toDelete.forEach((serialNo) => {
        sqlQuery = "DELETE FROM eut_details WHERE serialNo=? AND jc_number=?";
        db.query(sqlQuery, [serialNo, jcNumberString], (error, result) => {
          if (error) return res.status(500).json(error.message);
        });
      });
      toAdd.forEach((serialNo) => {
        sqlQuery = "INSERT INTO eut_details (jc_number,serialNo) VALUES (?,?)";
        if (serialNo) {
          db.query(sqlQuery, [jcNumberString, serialNo], (error, result) => {
            if (error) return res.status(500).json(error.message);
          });
        }
      });
      res
        .status(200)
        .json({ message: `eut_details synced successfully`, toDelete, toAdd });
    });
  });

  // To Edit the selected eut_details:
  app.post("/api/eutdetails/", (req, res) => {
    const {
      nomenclature,
      eutDescription,
      qty,
      partNo,
      modelNo,
      jcNumber,
      serialNo,
    } = req.body;

    if (serialNo) {
      const sqlQuery = `UPDATE eut_details SET
                nomenclature = ?,
                eutDescription = ?,
                qty = ?,
                partNo = ?,
                modelNo = ?
                WHERE jc_number=? AND serialNo=?`;

      // Use an array to provide values for placeholders in the query
      const values = [
        nomenclature,
        eutDescription,
        qty,
        partNo,
        modelNo,
        jcNumber,
        serialNo,
      ];

      db.query(sqlQuery, values, (error, result) => {
        if (error) {
          return res
            .status(500)
            .json({ message: "Internal server error", error });
        } else {
          res
            .status(200)
            .json({ message: "eut_details updated successfully", result });
        }
      });
    } else {
      res.status(400).json({ message: "Serial number is required" });
    }
  });

  // To fetch the jcnumber from the table 'eut_details'
  app.get("/api/geteutdetails", (req, res) => {
    const sqlQuery = `SELECT jc_number FROM eut_details`;
    db.query(sqlQuery, (error, result) => {
      if (error) {
        return res
          .status(500)
          .json({ error: "An error occurred while fetching data" });
      }
      res.send(result);
    });
  });

  // To fetch the data based on the jcnumber from the table 'eut_details'
  app.get("/api/geteutdetailslist/:jc_number", (req, res) => {
    const jcNumber = req.params.jc_number;
    const sqlQuery = `SELECT nomenclature, eutDescription, qty, partNo, modelNo, serialNo FROM eut_details WHERE jc_number = ?`;

    db.query(sqlQuery, [jcNumber], (error, result) => {
      if (error) {
        return res
          .status(500)
          .json({ error: "An error occurred while fetching data" });
      }
      res.send(result);
    });
  });

  // To add new tests to the database:
  // app.post('/api/tests', (req, res) => {
  //     const { jcNumber, test, nabl, testStandard, referenceDocument } = req.body;

  //     const sql = `INSERT INTO jc_tests (jc_number, test, nabl, testStandard, referenceDocument) VALUES (?,?,?,?,?)`;

  //     db.query(sql, [jcNumber, test, nabl, testStandard, referenceDocument], (error, result) => {
  //         if (error) {
  //             console.log(error);
  //             return res.status(500).json({ message: 'Internal server error', error });
  //         } else {
  //             return res.status(200).json({ message: 'tests added successfully' });
  //         }
  //     });
  // });

  // To delete the tests from the table:
  app.delete("/api/gettests/:jc_number", (req, res) => {
    const jcNumber = req.params.jc_number;
    const deleteQuery = "DELETE FROM jc_tests WHERE jc_number = ?";

    db.query(deleteQuery, [jcNumber], (error, result) => {
      if (error) {
        return res
          .status(500)
          .json({ error: "An error occurred while deleting the module" });
      }
      res.status(200).json({ message: "tests data deleted successfully" });
    });
  });

  // To Insert or delete Tests based on test name:
  app.post("/api/tests_sync/names/", (req, res) => {
    let { tests, jcNumberString } = req.body;
    let sqlQuery = "SELECT test FROM jc_tests WHERE jc_number=?";
    db.query(sqlQuery, [jcNumberString], (error, result) => {
      if (error) return res.status(500).json(error.message);
      let newResult = result.map((item) => item.test);
      let toDelete = newResult.filter(function (el) {
        return !tests.includes(el);
      });
      let toAdd = tests.filter(function (el) {
        return !newResult.includes(el);
      });
      toDelete.forEach((test) => {
        sqlQuery = "DELETE FROM jc_tests WHERE test=? AND jc_number=?";
        db.query(sqlQuery, [test, jcNumberString], (error, result) => {
          if (error) return res.status(500).json(error.message);
        });
      });
      toAdd.forEach((test) => {
        sqlQuery = "INSERT INTO jc_tests (jc_number,test) VALUES (?,?)";
        if (test) {
          db.query(sqlQuery, [jcNumberString, test], (error, result) => {
            if (error) return res.status(500).json(error.message);
          });
        }
      });
      res
        .status(200)
        .json({ message: `tests synced successfully`, toDelete, toAdd });
    });
  });

  // To Edit the selected tests:
  app.post("/api/tests/", (req, res) => {
    const { test, nabl, testStandard, testProfile, jcNumber } = req.body;

    const sqlQuery = `
        UPDATE jc_tests
        SET
          nabl = ?, 
          testStandard = ?, 
          testProfile = ? 
        WHERE jc_number = ? AND test = ?`;

    const values = [nabl, testStandard, testProfile, jcNumber, test];

    db.query(sqlQuery, values, (error, result) => {
      if (error) {
        console.log(error);
        return res
          .status(500)
          .json({ message: "Internal server error", result });
      } else {
        res.status(200).json({ message: "tests updated successfully" });
      }
    });
  });

  // To fetch the jcnumber from the table 'tests'
  app.get("/api/gettests", (req, res) => {
    const sqlQuery = `SELECT jc_number FROM jc_tests`;
    db.query(sqlQuery, (error, result) => {
      if (error) {
        return res
          .status(500)
          .json({ error: "An error occurred while fetching data" });
      }
      res.send(result);
    });
  });

  // To fetch the data based on the jcnumber from the table 'tests'
  app.get("/api/gettestslist/:jc_number", (req, res) => {
    const jcNumber = req.params.jc_number;
    const sqlQuery = `SELECT test, nabl, testStandard, testProfile FROM jc_tests WHERE jc_number = ?`;

    db.query(sqlQuery, [jcNumber], (error, result) => {
      if (error) {
        return res
          .status(500)
          .json({ error: "An error occurred while fetching data" });
      }
      res.send(result);
    });
  });

  // To add new testdetails to the database:
  // app.post('/api/testdetails', (req, res) => {
  //     const { jcNumber, testName, testChamber, eutSerialNo, standard, testStartedBy, startDate, endDate, duration, testEndedBy, remarks, reportNumber, preparedBy, nablUploaded, reportStatus } = req.body;

  //     // Parse the date using moment.js
  //     // const formattedstartDate = moment(startDate, 'DD/MM/YYYY', true).format('%Y-%m-%d %H:%i:%s');
  //     const formattedstartDate = dayjs(startDate, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
  //     const formattedendDate = dayjs(endDate, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
  //     // const formattedendDate = moment(endDate, 'DD/MM/YYYY', true).format('%Y-%m-%d %H:%i:%s');
  //     // const formattedDuration = `${hours}:${minutes}:${seconds}`;

  //     const sql = `INSERT INTO tests_details (jc_number, testName, testChamber, eutSerialNo, standard, testStartedBy, startDate, endDate, duration, testEndedBy, remarks, reportNumber, preparedBy, nablUploaded, reportStatus) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;

  //     // console.log('SQL Query:', sql);
  //     // console.log('Query Values:', [jcNumber, test, chamber, eutSerialNo, standard, testStartedBy, startDate, endDate, duration, testEndedBy, remarks, reportNumber, preparedBy, nablUploaded, reportStatus]);

  //     db.query(sql, [jcNumber, testName, testChamber, eutSerialNo, standard, testStartedBy, formattedstartDate, formattedendDate, duration, testEndedBy, remarks, reportNumber, preparedBy, nablUploaded, reportStatus], (error, result) => {
  //         if (error) {
  //             console.log(error);
  //             return res.status(500).json({ message: 'Internal server error' });
  //         } else {
  //             return res.status(200).json({ message: 'testdetails added successfully' });
  //         }

  //     });
  // });

  //To delete the testdetails from the table:
  app.delete("/api/gettestdetails/:jc_number", (req, res) => {
    const jcnumber = req.params.jc_number;
    const deleteQuery = "DELETE FROM tests_details WHERE jc_number = ?";

    db.query(deleteQuery, [jcnumber], (error, result) => {
      if (error) {
        return res
          .status(500)
          .json({ error: "An error occurred while deleting the module" });
      }
      res
        .status(200)
        .json({ message: "testdetails data deleted successfully" });
    });
  });

  //////////////////////////////////////////////////////////////////////

  // To Insert or delete Test Details based on test name:
  app.post("/api/testdetails_sync/names/", (req, res) => {
    let { testNames, jcNumberString } = req.body;
    let sqlQuery = "SELECT testName FROM tests_details WHERE jc_number=?";
    db.query(sqlQuery, [jcNumberString], (error, result) => {
      if (error) return res.status(500).json(error.message);
      let newResult = result.map((item) => item.testName);
      let toDelete = newResult.filter(function (el) {
        return !testNames.includes(el);
      });
      let toAdd = testNames.filter(function (el) {
        return !newResult.includes(el);
      });
      toDelete.forEach((test) => {
        sqlQuery = "DELETE FROM tests_details WHERE testName=? AND jc_number=?";
        db.query(sqlQuery, [test, jcNumberString], (error, result) => {
          if (error) return res.status(500).json(error.message);
        });
      });
      toAdd.forEach((test) => {
        sqlQuery =
          "INSERT INTO tests_details (jc_number,testName) VALUES (?,?)";
        if (test) {
          db.query(sqlQuery, [jcNumberString, test], (error, result) => {
            if (error) return res.status(500).json(error.message);
          });
        }
      });
      res
        .status(200)
        .json({ message: `tests synced successfully`, toDelete, toAdd });
    });
  });

  //To Edit the selected testdetails:
  app.post("/api/testdetails/", (req, res) => {
    const {
      testName,
      testChamber,
      eutSerialNo,
      standard,
      testStartedBy,
      startDate,
      endDate,
      duration,
      actualTestDuration,
      unit,
      testEndedBy,
      remarks,
      testReportInstructions,
      reportNumber,
      preparedBy,
      nablUploaded,
      reportStatus,
      jcNumber,
    } = req.body;

    const formattedStartDate = startDate ? convertDateTime(startDate) : null;
    const formattedEndDate = endDate ? convertDateTime(endDate) : null;
    const formattedDuration = duration < 0 ? 0 : duration;
    const sqlQuery = `
        UPDATE tests_details
        SET 
          testChamber = ?, 
          eutSerialNo = ?, 
          standard = ? ,
          testStartedBy = ? ,
          startDate = ? ,
          endDate = ? ,
          duration = ? ,
          actualTestDuration = ? ,
          unit =?,
          testEndedBy = ? ,
          remarks = ? ,
          testReportInstructions = ? ,
          reportNumber = ? ,
          preparedBy = ? ,
          nablUploaded = ? ,
          reportStatus = ? 
        WHERE jc_number = ? AND testName = ?`;

    const values = [
      testChamber || "",
      eutSerialNo || "",
      standard || "",
      testStartedBy || "",
      formattedStartDate,
      formattedEndDate,
      formattedDuration,
      actualTestDuration || "",
      unit || "",
      testEndedBy || "",
      remarks || "",
      testReportInstructions || "",
      reportNumber || "",
      preparedBy || "",
      nablUploaded || "",
      reportStatus || "",
      jcNumber || "",
      testName || "",
    ];

    db.query(sqlQuery, values, (error, result) => {
      if (error) {
        console.error("Error updating test details:", error);
        return res
          .status(500)
          .json({ message: "Internal server error", error });
      } else {
        res.status(200).json({ message: "tests_details updated successfully" });
      }
    });
  });

  ////////////////////////////////////////////////////////////////////////////////////////

  //To fetch the jcnumber from the table 'tests_details'
  app.get("/api/gettestdetails", (req, res) => {
    const sqlQuery = `SELECT jc_number FROM tests_details`;
    db.query(sqlQuery, (error, result) => {
      if (error) {
        return res
          .status(500)
          .json({ error: "An error occurred while fetching data" });
      }
      res.send(result);
    });
  });

  //To fetch the data based on the jcnumber from the table 'tests_details'
  app.get("/api/gettestdetailslist/:jc_number", (req, res) => {
    const jcnumber = req.params.jc_number;
    const sqlQuery = `SELECT  testName,testChamber,eutSerialNo,standard,testStartedBy,startDate,endDate,duration, actualTestDuration, unit,testEndedBy,remarks, testReportInstructions, reportNumber,preparedBy,nablUploaded, reportStatus FROM tests_details  WHERE jc_number = ?`;

    db.query(sqlQuery, [jcnumber], (error, result) => {
      if (error) {
        return res
          .status(500)
          .json({ error: "An error occurred while fetching data" });
      }
      res.send(result);
    });
  });

  ////////////////////////////////////////////////////////////////////////////////////////////////////
  // To Insert or delete Reliability Tasks Detail:
  app.post("/api/relTasks/taskName/", (req, res) => {
    const { task_description, jcNumberString } = req.body;

    // Check if task_description is defined and is an array
    if (!Array.isArray(task_description)) {
      return res.status(400).json({ error: "Invalid task_description" });
    }

    let sqlQuery =
      "SELECT task_description FROM reliability_tasks_details WHERE jc_number=?";
    db.query(sqlQuery, [jcNumberString], (error, result) => {
      if (error) return res.status(500).json(error.message);

      let newResult = result.map((item) => item.task_description);
      let toDelete = newResult.filter((el) => !task_description.includes(el));
      let toAdd = task_description.filter((el) => !newResult.includes(el));

      toDelete.forEach((desc) => {
        sqlQuery =
          "DELETE FROM reliability_tasks_details WHERE task_description=? AND jc_number=?";
        db.query(sqlQuery, [desc, jcNumberString], (error, result) => {
          if (error) return res.status(500).json(error.message);
        });
      });

      toAdd.forEach((desc) => {
        sqlQuery =
          "INSERT INTO reliability_tasks_details (jc_number, task_description) VALUES (?,?)";
        db.query(sqlQuery, [jcNumberString, desc], (error, result) => {
          if (error) return res.status(500).json(error.message);
        });
      });

      res.status(200).json({
        message: `Reliability Task Details synced successfully`,
        toDelete,
        toAdd,
      });
    });
  });

  // To Edit the selected reliability_taasks:
  app.post("/api/relTasks/", (req, res) => {
    const {
      task_description,
      jcNumberString,
      task_assigned_by,
      task_start_date,
      task_end_date,
      task_assigned_to,
      task_status,
      task_completed_date,
      note_remarks,
    } = req.body;

    if (!task_description || !jcNumberString) {
      return res
        .status(400)
        .json({ message: "task_description and jcNumberString are required" });
    }

    const sqlQuery = `UPDATE reliability_tasks_details SET 
        task_assigned_by = ?,
        task_start_date = ?,
        task_end_date = ?,
        task_assigned_to = ?,
        task_status = ?,
        task_completed_date = ?,
        note_remarks = ?
        WHERE jc_number = ? AND task_description = ?`;

    // const formattedTaskStartDate = dayjs(task_start_date).format('YYYY-MM-DD')
    // const formattedTaskEndDate = dayjs(task_end_date).format('YYYY-MM-DD')
    // const formattedTaskCompletedDate = dayjs(task_completed_date).format('YYYY-MM-DD')

    const formattedTaskStartDate = task_start_date
      ? dayjs(task_start_date).format("YYYY-MM-DD")
      : null;
    const formattedTaskEndDate = task_end_date
      ? dayjs(task_end_date).format("YYYY-MM-DD")
      : null;
    const formattedTaskCompletedDate = task_completed_date
      ? dayjs(task_completed_date).format("YYYY-MM-DD")
      : null;

    // Use an array to provide values for placeholders in the query
    const values = [
      task_assigned_by,
      formattedTaskStartDate,
      formattedTaskEndDate,
      task_assigned_to,
      task_status,
      formattedTaskCompletedDate,
      note_remarks,
      jcNumberString,
      task_description,
    ];

    db.query(sqlQuery, values, (error, result) => {
      if (error) {
        return res
          .status(500)
          .json({ message: "Internal server error", error });
      } else {
        res.status(200).json({
          message: "Reliability Task Details updated successfully",
          result,
        });
      }
    });
  });

  ///////////////////////////////////////////////////////////////////////////////////////////

  ///////////////////////////////////////////////////////////////////////////////////////////

  // One single end point to "GET" all details based on jc_number used for editing
  app.get("/api/jobcard/:id", (req, res) => {
    const id = req.params.id;
    let output = {};
    let sqlQuery = `SELECT * FROM bea_jobcards WHERE id = ?`;
    db.query(sqlQuery, [id], (error, result) => {
      if (error) return res.status(500).json({ error });

      // Check if the jobcard exists
      if (result.length === 0) {
        return res.status(404).json({ error: "Jobcard not found" });
      }

      output["jobcard"] = result[0];
      const jc_number = result[0].jc_number;

      // Fetch data from eut_details table
      sqlQuery = "SELECT * FROM eut_details WHERE jc_number = ?";
      db.query(sqlQuery, [jc_number], (error, result) => {
        if (error) return res.status(500).json({ error });
        output["eut_details"] = result;

        // Fetch data from jc_tests table
        sqlQuery = "SELECT * FROM jc_tests WHERE jc_number = ?";
        db.query(sqlQuery, [jc_number], (error, result) => {
          if (error) return res.status(500).json({ error });
          output["tests"] = result;

          // Fetch data from tests_details table
          sqlQuery = "SELECT * FROM tests_details WHERE jc_number = ?";
          db.query(sqlQuery, [jc_number], (error, result) => {
            if (error) return res.status(500).json({ error });
            output["tests_details"] = result;

            // Fetch data from reliability_tasks_details table
            sqlQuery =
              "SELECT * FROM reliability_tasks_details WHERE jc_number = ?";
            db.query(sqlQuery, [jc_number], (error, result) => {
              if (error) return res.status(500).json({ error });
              output["reliability_tasks_details"] = result;

              // Fetch data from attachments table
              sqlQuery = "SELECT * FROM attachments WHERE jc_number = ?";
              db.query(sqlQuery, [jc_number], (error, result) => {
                if (error) return res.status(500).json({ error });
                output["attachments"] = result;

                // Send the combined output
                res.send(output);
              });
            });
          });
        });
      });
    });
  });

  // To get the month-year of the Job-card
  app.get("/api/getJCYearMonth", (req, res) => {
    const sqlQuery = `
        SELECT 
            DISTINCT DATE_FORMAT(jc_open_date, '%b') AS month,
            DATE_FORMAT(jc_open_date, '%Y') AS year,
            MONTH(jc_open_date) AS monthNumber
        FROM bea_jobcards
        ORDER BY year ASC, monthNumber ASC`;

    db.query(sqlQuery, (error, result) => {
      if (error) {
        return res.status(500).json({
          error: "An error occurred while fetching JC Month Year data",
        });
      }

      const formattedData = result.map((row) => ({
        month: row.month,
        year: row.year,
      }));
      res.json(formattedData);
    });
  });

  //Fetch chambers utilization hours list:
  app.get("/api/getChamberUtilization", (req, res) => {
    const chamberUtilizationQuery = `
                    SELECT 
                        testChamber,
                        SUM(CASE WHEN MONTH(startDate) = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) THEN actualTestDuration ELSE 0 END) AS prevMonthRunHours,
                        SUM(CASE WHEN MONTH(startDate) = MONTH(CURDATE()) THEN actualTestDuration ELSE 0 END) AS currentMonthRunHours,
                        SUM(actualTestDuration) AS totalRunHours
                    FROM 
                        tests_details
                    WHERE testChamber IS NOT NULL AND testChamber <> ''
                    GROUP BY
                        testChamber
                    `;
    db.query(chamberUtilizationQuery, (error, results) => {
      if (error) {
        console.log(
          "An error occurred while fetching the chamber utilization data",
          error
        );
      }

      const formattedChamberUtilizationResult = results.map((row, index) => {
        const prevMonthRunHours = parseFloat(row.prevMonthRunHours) || 0;
        const currentMonthRunHours = parseFloat(row.currentMonthRunHours) || 0;
        const totalRunHours = parseFloat(row.totalRunHours) || 0;
        const chamberUtilization =
          currentMonthRunHours > prevMonthRunHours ? "More" : "Less";

        return {
          id: index + 1,
          chamberName: row.testChamber,
          prevMonthRunHours: prevMonthRunHours.toString(),
          currentMonthRunHours: currentMonthRunHours.toString(),
          chamberUtilization,
          totalRunHours: totalRunHours.toString(),
        };
      });

      res.json(formattedChamberUtilizationResult);
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  // To get the month-year of the Job-card
  // To get the last JC number of the previous month
  app.get("/api/getPreviousMonthJC", (req, res) => {
    const sqlQuery = `
      SELECT jc_number 
      FROM bea_jobcards 
      WHERE MONTH(jc_open_date) = MONTH(CURRENT_DATE - INTERVAL 1 MONTH)
      ORDER BY jc_open_date DESC 
      LIMIT 1`;

    db.query(sqlQuery, (error, result) => {
      if (error) {
        return res.status(500).json({
          error:
            "An error occurred while fetching the last JC number of the previous month",
        });
      }
      res.json(result);
    });
  });

  //////////////////////////////////////////////////////////////////////////////

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(__dirname, "FilesUploaded");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}_${file.originalname}`);
    },
  });

  const filesUploadUsingMulter = multer({
    storage,
    limits: {
      fileSize: 25 * 1024 * 1024, // Maximum file size is 25 MB
    },
  });

  app.post(
    "/api/uploadFiles",
    filesUploadUsingMulter.array("attachedFiles"),
    (req, res) => {
      if (!req.files || req.files.length === 0) {
        return res.status(400).send("No files were uploaded.");
      }

      const { jcNumber } = req.body;
      if (!jcNumber) {
        return res.status(400).send("jcNumber is required.");
      }

      const files = req.files;

      const filePromises = files.map((file) => {
        const relativeFilePath = file.path.replace(/\\/g, "/");
        const sqlInsertFile =
          "INSERT INTO attachments (jc_number, file_name, file_path, file_type) VALUES (?, ?, ?, ?)";
        return new Promise((resolve, reject) => {
          db.query(
            sqlInsertFile,
            [jcNumber, file.originalname, relativeFilePath, file.mimetype],
            (err, results) => {
              if (err) {
                return reject(err);
              }
              resolve({ id: results.insertId, file_path: relativeFilePath });
            }
          );
        });
      });

      Promise.all(filePromises)
        .then((fileData) => {
          res.status(200).json(fileData);
        })
        .catch((error) => {
          console.error("Error uploading files:", error);
          res.status(500).send("Internal server error.");
        });
    }
  );

  app.delete("/api/deleteFile/:id", (req, res) => {
    const fileId = req.params.id;

    const sqlSelectFile = "SELECT * FROM attachments WHERE id = ?";
    db.query(sqlSelectFile, [fileId], (error, result) => {
      if (error) {
        console.error("Error selecting file:", error);
        return res.status(500).json({ error });
      }

      if (result.length === 0) {
        console.warn("File not found for fileId:", fileId);
        return res.status(404).json({ message: "File not found" });
      }

      const file = result[0];
      const filePath = path.resolve(file.file_path); // Ensure absolute path

      const sqlDeleteFile = "DELETE FROM attachments WHERE id = ?";
      db.query(sqlDeleteFile, [fileId], (error) => {
        if (error) {
          console.error("Error deleting file record from database:", error);
          return res.status(500).json({ error });
        }

        fs.unlink(filePath, (err) => {
          if (err) {
            console.error("Error deleting file from filesystem:", err);
            return res
              .status(500)
              .json({ error: "Error deleting file from filesystem" });
          }
          res.status(200).json({ message: "File deleted successfully" });
        });
      });
    });
  });

  // Backend API to fetch and view the attachments:
  app.get("/api/FilesUploaded/:filename", (req, res) => {
    const fileNameWithTimestamp = req.params.filename;

    // Query should match the exact file_path stored in the database
    const sqlSelectFile = "SELECT * FROM attachments WHERE file_path LIKE ?";
    db.query(sqlSelectFile, [`%${fileNameWithTimestamp}`], (err, results) => {
      if (err || results.length === 0) {
        console.error("File not found in database:", err);
        return res.status(404).send("File not found");
      }

      const file = results[0];
      const filePath = path.resolve(file.file_path); // Ensure absolute path

      res.sendFile(filePath, (err) => {
        if (err) {
          console.error("File sending error:", err);
          res.status(404).send("File not found");
        }
      });
    });
  });

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////
}

module.exports = { jobcardsAPIs };
