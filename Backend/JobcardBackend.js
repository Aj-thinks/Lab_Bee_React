const { db } = require("./db");

const dayjs = require("dayjs");
const moment = require("moment");

const multer = require("multer");
const path = require("path");
const fs = require("fs");
require("dotenv").config(); // Ensure .env is loaded

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

  const getCurrentYearAndMonth = () => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // Adding 1 because months are zero-indexed

    return { currentYear, currentMonth };
  };

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  // Function to store the notifications to the table:
  const saveNotificationToDatabase = async (
    message,
    receivedAt,
    usersToBeNotified,
    sender
  ) => {
    const query = `
      INSERT INTO notifications_table (message, receivedAt, users_to_be_notified, notification_sent_by)
      VALUES (?, ?, ?, ?)
    `;

    const formattedDateTime = moment(receivedAt).format("YYYY-MM-DD HH:mm:ss");
    const values = [
      message,
      formattedDateTime,
      usersToBeNotified.join(","),
      sender,
    ];
    // Assuming you're using a MySQL connection pool
    try {
      await db.execute(query, values);
      // console.log("Notification saved to the database successfully");
    } catch (err) {
      console.error("Error saving notification to the database:", err);
    }
  };

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  // Add primary details of the jobcard to the 'bea_jobcards' table:
  // app.post("/api/jobcard", (req, res) => {
  //   const {
  //     jcNumber,
  //     srfNumber,
  //     srfDate,
  //     dcNumber,
  //     jcOpenDate,
  //     itemReceivedDate,
  //     poNumber,
  //     testCategory,
  //     testDiscipline,
  //     sampleCondition,
  //     typeOfRequest,
  //     reportType,
  //     testInchargeName,
  //     jcCategory,
  //     companyName,
  //     companyAddress,
  //     customerName,
  //     customerEmail,
  //     customerNumber,
  //     projectName,
  //     testInstructions,
  //     jcStatus,
  //     reliabilityReportStatus,
  //     jcCloseDate,
  //     observations,
  //     jcLastModifiedBy,
  //     loggedInUser,
  //     loggedInUserDepartment,
  //   } = req.body;

  //   console.log("jcNumber: ", jcNumber);
  //   console.log("srfNumber: ", srfNumber);

  //   // Extract the sequence number from jcNumber and srfNumber
  //   const jcNumberParts = jcNumber.split("-");
  //   const srfNumberParts = srfNumber.split("/");

  //   console.log("------------------------------------------");
  //   console.log("jcNumberParts: ", jcNumberParts);
  //   console.log("srfNumberParts: ", srfNumberParts);

  //   const formattedSrfDate = srfDate
  //     ? dayjs(srfDate).format("YYYY-MM-DD")
  //     : null;

  //   const formattedItemReceivedDate = itemReceivedDate
  //     ? dayjs(itemReceivedDate).format("YYYY-MM-DD")
  //     : null;
  //   const formattedOpenDate = jcOpenDate
  //     ? dayjs(jcOpenDate).format("YYYY-MM-DD")
  //     : null;
  //   const formattedCloseDate = jcCloseDate
  //     ? dayjs(jcCloseDate).format("YYYY-MM-DD")
  //     : null;

  //   const sql = `INSERT INTO bea_jobcards(
  //       jc_number, srf_number, srf_date, dcform_number, jc_open_date, item_received_date, po_number,
  //       test_category, test_discipline, sample_condition, type_of_request, report_type, test_incharge, jc_category, company_name, company_address,
  //       customer_name, customer_email, customer_number, project_name, test_instructions,
  //        jc_status, reliability_report_status, jc_closed_date, observations, last_updated_by
  //   ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  //   const values = [
  //     jcNumber,
  //     srfNumber,
  //     formattedSrfDate,
  //     dcNumber,
  //     formattedOpenDate || null,
  //     formattedItemReceivedDate || null,
  //     poNumber || "",
  //     testCategory || "",
  //     testDiscipline || "",
  //     sampleCondition || "",
  //     typeOfRequest || "",
  //     reportType || "",
  //     testInchargeName || "",
  //     jcCategory || "",
  //     companyName || "",
  //     companyAddress || "",
  //     customerName || "",
  //     customerEmail || "",
  //     customerNumber || "",
  //     projectName || "",
  //     testInstructions || "",
  //     jcStatus || "",
  //     reliabilityReportStatus || "",
  //     formattedCloseDate || null,
  //     observations || "",
  //     jcLastModifiedBy || loggedInUser,
  //   ];

  //   db.query(sql, values, (error, result) => {
  //     if (error) {
  //       console.log(error);
  //       return res.status(500).json({ message: "Internal server error" });
  //     } else {
  //       const departmentsToNotify = [
  //         // "Accounts",
  //         "TS1 Testing",
  //         "Reliability",
  //         "Reports & Scrutiny",
  //       ];

  //       for (let socketId in labbeeUsers) {
  //         if (
  //           departmentsToNotify.includes(labbeeUsers[socketId].department) &&
  //           labbeeUsers[socketId].username !== loggedInUser
  //         ) {
  //           let message = "";

  //           if (jcCategory === "TS1") {
  //             message = `New TS1 ${jcNumber} created by ${loggedInUser}`;
  //           } else if (jcCategory === "Reliability") {
  //             message = `New Reliability ${jcNumber} created by ${loggedInUser}`;
  //           } else if (jcCategory === "TS2") {
  //             message = `New TS2 ${jcNumber} created by ${loggedInUser}`;
  //           }

  //           io.to(socketId).emit("jobcard_submit_notification", {
  //             message: message,
  //             sender: loggedInUser,
  //           });
  //         }
  //       }
  //       return res.status(200).json({ message: "Jobcards added successfully" });
  //     }
  //   });
  // });

  const usersToNotifyJcCreation = JSON.parse(
    process.env.USERS_TO_BE_NOTIFY_ABOUT_TS1_JC_CREATION
  );

  app.post("/api/jobcard", async (req, res) => {
    const {
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

    let connection;
    try {
      // Establish a connection
      connection = await db.promise().getConnection();

      // Start a transaction
      await connection.beginTransaction();

      // Extract financial year and month part
      const { currentYear, currentMonth } = getCurrentYearAndMonth();
      let finYear =
        currentMonth > 3
          ? `${currentYear}-${currentYear + 1}/${currentMonth}`
          : `${currentYear - 1}-${currentYear}/${currentMonth}`;

      let newSequenceNumber;

      const [recentJCs] = await connection.query(
        `SELECT jc_number FROM bea_jobcards WHERE jc_number LIKE ? ORDER BY jc_number DESC LIMIT 1`,
        [`${finYear}-%`]
      );

      if (recentJCs.length > 0) {
        // Extract the sequence number part from the last job card number
        const lastJcNumber = recentJCs[0].jc_number;
        const lastSequence = parseInt(lastJcNumber.split("-")[2], 10);
        newSequenceNumber = lastSequence + 1;
      } else {
        newSequenceNumber = 1;
      }

      // Generate the new jcNumber and srfNumber
      const newJcNumber = `${finYear}-${newSequenceNumber
        .toString()
        .padStart(3, "0")}`;
      const newSrfNumber = `BEA/TR/SRF/${newJcNumber}`;

      const sql = `INSERT INTO bea_jobcards(
            jc_number, srf_number, srf_date, dcform_number, jc_open_date, item_received_date, po_number,
            test_category, test_discipline, sample_condition, type_of_request, report_type, test_incharge, jc_category, company_name, company_address,
            customer_name, customer_email, customer_number, project_name, test_instructions,
            jc_status, reliability_report_status, jc_closed_date, observations, last_updated_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      const values = [
        newJcNumber,
        newSrfNumber,
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

      await connection.query(sql, values);

      // Commit the transaction
      await connection.commit();

      const currentTimestampForJCCreation = new Date().toISOString(); // Get the current timestamp

      let message = `New ${jcCategory} ${newJcNumber} JC created by ${loggedInUser}`;
      let usersToNotifyAboutJCCreation = [
        "Lab Manager",
        "Lab Engineer",
        "Lab Technician",
        "Lab Assistant",
        "Reports & Scrutiny Manager",
      ];

      for (let socketId in labbeeUsers) {
        const user = labbeeUsers[socketId];
        if (
          usersToNotifyJcCreation.includes(user.role) &&
          user.name !== loggedInUser
        ) {
          io.to(socketId).emit("jobcard_submit_notification", {
            message: message,
            sender: loggedInUser,
            receivedAt: currentTimestampForJCCreation,
          });

          if (!usersToNotifyAboutJCCreation.includes(user.role)) {
            usersToNotifyAboutJCCreation.push(user.role);
          }
        }
      }

      // Save a single notification with all roles combined
      saveNotificationToDatabase(
        message,
        currentTimestampForJCCreation,
        usersToNotifyAboutJCCreation, // Pass the array directly
        loggedInUser
      );

      return res.status(200).json({
        message: "Jobcard added successfully",
        jcNumber: newJcNumber,
        srfNumber: newSrfNumber,
      });
    } catch (error) {
      console.log(error);
      if (connection) await connection.rollback(); // Rollback transaction in case of error
      return res.status(500).json({ message: "Internal server error" });
    } finally {
      if (connection) await connection.release(); // Release the connection back to the pool
    }
  });

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
                                id, jc_number, DATE_FORMAT(jc_open_date, '%d-%m-%Y') as jc_open_date, company_name, jc_status, DATE_FORMAT(jc_closed_date, '%d-%m-%Y') as jc_closed_date, last_updated_by
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
                                id, jc_number, DATE_FORMAT(jc_open_date, '%d-%m-%Y') as jc_open_date, company_name, project_name, reliability_report_status, jc_status, DATE_FORMAT(jc_closed_date, '%d-%m-%Y') as jc_closed_date, last_updated_by 
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
        SELECT id, jc_number, DATE_FORMAT(jc_open_date, '%d-%m-%Y') as jc_open_date, company_name, jc_status, last_updated_by 
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
        SELECT id, jc_number, DATE_FORMAT(jc_open_date, '%d-%m-%Y') as jc_open_date, company_name, project_name, reliability_report_status, jc_status, last_updated_by  
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
  // app.post("/api/jobcard/:id", (req, res) => {
  //   const {
  //     jcNumber,
  //     srfNumber,
  //     srfDate,
  //     dcNumber,
  //     jcOpenDate,
  //     itemReceivedDate,
  //     poNumber,
  //     testCategory,
  //     testDiscipline,
  //     sampleCondition,
  //     typeOfRequest,
  //     reportType,
  //     testInchargeName,
  //     jcCategory,
  //     companyName,
  //     companyAddress,
  //     customerName,
  //     customerEmail,
  //     customerNumber,
  //     projectName,
  //     testInstructions,
  //     jcStatus,
  //     reliabilityReportStatus,
  //     jcCloseDate,
  //     observations,
  //     jcLastModifiedBy,
  //     loggedInUser,
  //     loggedInUserDepartment,
  //   } = req.body;

  //   const formattedSrfDate = srfDate ? convertDateTime(srfDate) : null;
  //   const formattedItemReceivedDate = itemReceivedDate
  //     ? dayjs(itemReceivedDate).format("YYYY-MM-DD")
  //     : null;
  //   // const referanceDocsSerialized = JSON.stringify(referanceDocs);
  //   const formattedOpenDate = jcOpenDate ? convertDateTime(jcOpenDate) : null;
  //   const formattedCloseDate = jcCloseDate
  //     ? convertDateTime(jcCloseDate)
  //     : null;

  //   const sqlQuery = `
  //       UPDATE bea_jobcards SET
  //           srf_number = ?,
  //           srf_date = ?,
  //           dcform_number = ?,
  //           jc_open_date = ?,
  //           item_received_date = ?,
  //           po_number = ?,
  //           test_category = ?,
  //           test_discipline = ?,
  //           sample_condition = ?,
  //           type_of_request = ?,
  //           report_type = ?,
  //           test_incharge = ?,
  //           jc_category = ?,
  //           company_name = ?,
  //           company_address = ?,
  //           customer_name = ?,
  //           customer_email = ?,
  //           customer_number = ?,
  //           project_name = ?,
  //           test_instructions = ?,
  //           jc_status = ?,
  //           reliability_report_status = ?,
  //           jc_closed_date = ?,
  //           observations = ?,
  //           last_updated_by = ?
  //       WHERE jc_number = ?
  //   `;

  //   const values = [
  //     srfNumber,
  //     formattedSrfDate,
  //     dcNumber,
  //     formattedOpenDate,
  //     formattedItemReceivedDate,
  //     poNumber,
  //     testCategory,
  //     testDiscipline,
  //     sampleCondition,
  //     typeOfRequest,
  //     reportType,
  //     testInchargeName,
  //     jcCategory,
  //     companyName,
  //     companyAddress,
  //     customerName,
  //     customerEmail,
  //     customerNumber,
  //     projectName,
  //     testInstructions,
  //     jcStatus,
  //     reliabilityReportStatus,
  //     formattedCloseDate,
  //     observations,
  //     loggedInUser,
  //     jcNumber,
  //   ];

  //   db.query(sqlQuery, values, (error, result) => {
  //     if (error) {
  //       console.error("Error executing query:", error.message);
  //       return res
  //         .status(500)
  //         .json({ message: "Internal server error", error: error.message });
  //     }
  //     if (result.affectedRows === 0) {
  //       console.warn("No rows updated. Check if the jc_number exists.");
  //       return res.status(404).json({ message: "Jobcard not found" });
  //     }

  //     const testCompletedToNotify = ["Lab Manager"];
  //     const jcClosedToNotify = ["Accounts Admin", "Accounts Executive"];

  //     for (let socketId in labbeeUsers) {
  //       const user = labbeeUsers[socketId];
  //       let message = "";

  //       if (
  //         testCompletedToNotify.includes(user.role) &&
  //         user.name !== loggedInUser
  //       ) {
  //         // Notification for "Test Completed" status
  //         if (jcCategory === "TS1" && jcStatus === "Test Completed") {
  //           message = `TS1 JC ${jcNumber} Test Completed, by ${loggedInUser}`;
  //           io.to(socketId).emit("jobcard_status_test_completed_notification", {
  //             message: message,
  //             sender: loggedInUser,
  //           });
  //         }
  //       }

  //       if (
  //         jcClosedToNotify.includes(user.role) &&
  //         user.name !== loggedInUser
  //       ) {
  //         // Notification for "Closed" status in TS1
  //         if (
  //           jcCategory === "TS1" &&
  //           (jcStatus === "Closed" || jcStatus === "Close")
  //         ) {
  //           message = `TS1 JC ${jcNumber} Closed, by ${loggedInUser}`;
  //           io.to(socketId).emit("jobcard_status_closed_notification", {
  //             message: message,
  //             sender: loggedInUser,
  //           });
  //         }
  //       }

  //       if (
  //         jcClosedToNotify.includes(user.role) &&
  //         user.name !== loggedInUser
  //       ) {
  //         // Notification for "Closed" status in Reliability
  //         if (
  //           jcCategory === "Reliability" &&
  //           (jcStatus === "Closed" || jcStatus === "Close")
  //         ) {
  //           message = `Reliability JC ${jcNumber} Closed, by ${loggedInUser}`;
  //           io.to(socketId).emit("jobcard_status_closed_notification", {
  //             message: message,
  //             sender: loggedInUser,
  //           });
  //         }
  //       }
  //     }

  //     res.status(200).json({
  //       message: "Jobcard updated successfully",
  //     });
  //   });
  // });

  //////////////////////////////////////////////////////////////////////////////////////////

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
    const formattedOpenDate = jcOpenDate ? convertDateTime(jcOpenDate) : null;
    const formattedCloseDate = jcCloseDate
      ? convertDateTime(jcCloseDate)
      : null;

    // First, fetch the existing jcStatus from the database
    const fetchQuery = `SELECT jc_status FROM bea_jobcards WHERE jc_number = ?`;

    db.query(fetchQuery, [jcNumber], (fetchError, fetchResult) => {
      if (fetchError) {
        console.error("Error fetching existing jcStatus:", fetchError.message);
        return res.status(500).json({
          message: "Internal server error",
          error: fetchError.message,
        });
      }

      const existingJcStatus = fetchResult[0]?.jc_status;

      // Proceed with the update only after fetching the current status
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

      db.query(sqlQuery, values, (updateError, result) => {
        if (updateError) {
          console.error("Error executing query:", updateError.message);
          return res.status(500).json({
            message: "Internal server error",
            error: updateError.message,
          });
        }
        if (result.affectedRows === 0) {
          console.warn("No rows updated. Check if the jc_number exists.");
          return res.status(404).json({ message: "Jobcard not found" });
        }

        // Now, trigger notifications only if the jcStatus has changed
        if (existingJcStatus !== jcStatus) {
          const testCompletedToNotify = ["Lab Manager"];
          const jcClosedToNotify = ["Accounts Admin", "Accounts Executive"];
          const currentTimestamp = new Date().toISOString(); // Get the current timestamp

          let message = "";
          let departmentsToNotify = [];

          for (let socketId in labbeeUsers) {
            const user = labbeeUsers[socketId];

            if (
              testCompletedToNotify.includes(user.role) &&
              user.name !== loggedInUser
            ) {
              // Notification for "Test Completed" status
              if (jcCategory === "TS1" && jcStatus === "Test Completed") {
                message = `TS1 JC ${jcNumber} Test Completed, by ${loggedInUser}`;
                io.to(socketId).emit(
                  "jobcard_status_test_completed_notification",
                  {
                    message: message,
                    sender: loggedInUser,
                    receivedAt: currentTimestamp,
                  }
                );

                // Add role to the departmentsToNotify array
                if (!departmentsToNotify.includes(user.role)) {
                  departmentsToNotify.push(user.role);
                }
              }
            }

            if (
              jcClosedToNotify.includes(user.role) &&
              user.name !== loggedInUser
            ) {
              // Notification for "Closed" status in TS1
              if (
                jcCategory === "TS1" &&
                (jcStatus === "Closed" || jcStatus === "Close")
              ) {
                message = `TS1 JC ${jcNumber} Closed, by ${loggedInUser}`;
                io.to(socketId).emit("jobcard_status_closed_notification", {
                  message: message,
                  sender: loggedInUser,
                  receivedAt: currentTimestamp,
                });

                // Add role to the departmentsToNotify array
                if (!departmentsToNotify.includes(user.role)) {
                  departmentsToNotify.push(user.role);
                }
              }
            }

            if (
              jcClosedToNotify.includes(user.role) &&
              user.name !== loggedInUser
            ) {
              // Notification for "Closed" status in Reliability
              if (
                jcCategory === "Reliability" &&
                (jcStatus === "Closed" || jcStatus === "Close")
              ) {
                message = `Reliability JC ${jcNumber} Closed, by ${loggedInUser}`;
                io.to(socketId).emit("jobcard_status_closed_notification", {
                  message: message,
                  sender: loggedInUser,
                  receivedAt: currentTimestamp,
                });

                // Add role to the departmentsToNotify array
                if (!departmentsToNotify.includes(user.role)) {
                  departmentsToNotify.push(user.role);
                }
              }
            }
          }

          // Save the notification to the database only once
          if (message) {
            saveNotificationToDatabase(
              message,
              currentTimestamp,
              departmentsToNotify,
              loggedInUser
            );
          }
        }

        res.status(200).json({
          message: "Jobcard updated successfully",
        });
      });
    });
  });

  //////////////////////////////////////////////////////////////////////////////////////////

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
    const sqlQuery = `SELECT dcform_number, jc_opendate, po_number, category, test_inchargename, company_name, customer_number, customer_signature, project_name, sample_condition, referance_document FROM bea_jobcards WHERE jc_number = ?`;

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

  // To Insert or delete EUTDetails:
  app.post("/api/eutdetails/serialNos/", (req, res) => {
    let { eutRowIds, jcNumberString } = req.body;

    // Check if eutRowIds and jcNumberString are defined
    if (!eutRowIds || !jcNumberString) {
      console.log("Missing eutRowIds or jcNumberString");
      return res
        .status(400)
        .json({ message: "Missing eutRowIds or jcNumberString" });
    }

    let sqlQuery = "SELECT id FROM eut_details WHERE jc_number=?";
    db.query(sqlQuery, [jcNumberString], async (error, result) => {
      if (error) return res.status(500).json(error.message);

      let existingIds = result.map((item) => item.id);
      let toDelete = existingIds.filter((id) => !eutRowIds.includes(id));
      let toAddCount = eutRowIds.length - existingIds.length;

      try {
        // Delete rows
        await Promise.all(
          toDelete.map((id) => {
            return new Promise((resolve, reject) => {
              sqlQuery = "DELETE FROM eut_details WHERE id=?";
              db.query(sqlQuery, [id], (error) => {
                if (error) return reject(error);
                resolve();
              });
            });
          })
        );

        // Add new rows
        const newIds = [];
        for (let i = 0; i < toAddCount; i++) {
          await new Promise((resolve, reject) => {
            sqlQuery = "INSERT INTO eut_details (jc_number) VALUES (?)";
            db.query(sqlQuery, [jcNumberString], (error, result) => {
              if (error) return reject(error);
              newIds.push(result.insertId);
              resolve();
            });
          });
        }

        res.status(200).json({
          message: "eut_details synced successfully",
          toDelete,
          newIds,
        });
      } catch (error) {
        res.status(500).json({ message: "Internal server error", error });
      }
    });
  });

  // To Delete the selected eut_details row:
  app.delete("/api/deleteEutTableRows/:id", (req, res) => {
    const id = req.params.id;

    let sqlQuery = "DELETE FROM eut_details WHERE id=?";
    db.query(sqlQuery, [id], (error, result) => {
      if (error) return res.status(500).json({ message: error.message });
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Row not found" });
      }
      res.status(200).json({ message: "Row deleted successfully" });
    });
  });

  // To Edit the selected eut_details:
  app.post("/api/eutdetails/", (req, res) => {
    const {
      eutRowId,
      nomenclature,
      eutDescription,
      qty,
      partNo,
      modelNo,
      serialNo,
      jcNumber,
    } = req.body;

    if (eutRowId !== undefined) {
      // Check if the row exists with the given jcNumber and eutRowId
      const checkIfExistsQuery =
        "SELECT id FROM eut_details WHERE jc_number=? AND id=?";
      db.query(
        checkIfExistsQuery,
        [jcNumber, eutRowId],
        (checkError, checkResult) => {
          if (checkError) {
            return res
              .status(500)
              .json({ message: "Internal server error", error: checkError });
          }

          if (checkResult.length > 0) {
            // Row exists, so update it
            const updateQuery = `UPDATE eut_details SET
                    nomenclature = ?,
                    eutDescription = ?,
                    qty = ?,
                    partNo = ?,
                    modelNo = ?,
                    serialNo = ?
                    WHERE jc_number=? AND id=?`;

            const updateValues = [
              nomenclature,
              eutDescription,
              qty,
              partNo,
              modelNo,
              serialNo,
              jcNumber,
              eutRowId,
            ];

            db.query(updateQuery, updateValues, (updateError, updateResult) => {
              if (updateError) {
                return res.status(500).json({
                  message: "Internal server error",
                  error: updateError,
                });
              } else {
                return res.status(200).json({
                  message: "eut_details updated successfully",
                  result: updateResult,
                });
              }
            });
          } else {
            // Row does not exist, so insert it
            const insertQuery = `INSERT INTO eut_details (nomenclature, eutDescription, qty, partNo, modelNo, serialNo, jc_number)
                                     VALUES (?, ?, ?, ?, ?, ?, ?)`;

            const insertValues = [
              nomenclature,
              eutDescription,
              qty,
              partNo,
              modelNo,
              serialNo,
              jcNumber,
            ];

            db.query(insertQuery, insertValues, (insertError, insertResult) => {
              if (insertError) {
                return res.status(500).json({
                  message: "Internal server error",
                  error: insertError,
                });
              } else {
                return res.status(200).json({
                  message: "eut_details inserted successfully",
                  result: insertResult,
                  insertedId: insertResult.insertId,
                });
              }
            });
          }
        }
      );
    } else {
      res.status(400).json({ message: "Row ID is required" });
    }
  });

  ////////////////////////////////////////////////////////////////////////////////////////////////////

  // To Delete the selected eut_details row:
  app.delete("/api/deleteTestTableRows/:id", (req, res) => {
    const id = req.params.id;

    let sqlQuery = "DELETE FROM jc_tests WHERE id=?";
    db.query(sqlQuery, [id], (error, result) => {
      if (error) return res.status(500).json({ message: error.message });
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Row not found" });
      }
      res.status(200).json({ message: "JC Tests Row deleted successfully" });
    });
  });

  // To Insert or delete Tests based on test name:
  app.post("/api/tests_sync/names/", (req, res) => {
    let { testRowIds, jcNumberString } = req.body;

    // Check if testRowIds and jcNumberString are defined
    if (!testRowIds || !jcNumberString) {
      console.log("Missing testRowIds or jcNumberString");
      return res
        .status(400)
        .json({ message: "Missing testRowIds or jcNumberString" });
    }

    let sqlQuery = "SELECT id FROM jc_tests WHERE jc_number=?";
    db.query(sqlQuery, [jcNumberString], async (error, result) => {
      if (error) return res.status(500).json(error.message);

      let existingIds = result.map((item) => item.id);
      let toDelete = existingIds.filter((id) => !testRowIds.includes(id));
      let toAddCount = testRowIds.length - existingIds.length;

      try {
        // Delete rows
        await Promise.all(
          toDelete.map((id) => {
            return new Promise((resolve, reject) => {
              sqlQuery = "DELETE FROM jc_tests WHERE id=?";
              db.query(sqlQuery, [id], (error) => {
                if (error) return reject(error);
                resolve();
              });
            });
          })
        );

        // Add new rows
        const newIds = [];
        for (let i = 0; i < toAddCount; i++) {
          await new Promise((resolve, reject) => {
            sqlQuery = "INSERT INTO jc_tests (jc_number) VALUES (?)";
            db.query(sqlQuery, [jcNumberString], (error, result) => {
              if (error) return reject(error);
              newIds.push(result.insertId);
              resolve();
            });
          });
        }

        res.status(200).json({
          message: "tests synced successfully",
          toDelete,
          newIds,
        });
      } catch (error) {
        res.status(500).json({ message: "Internal server error", error });
      }
    });
  });

  // To Edit the selected tests:
  app.post("/api/tests/", (req, res) => {
    const { testId, test, nabl, testStandard, testProfile, jcNumber } =
      req.body;

    if (testId !== undefined) {
      const checkIfExistsQuery =
        "SELECT id FROM jc_tests WHERE jc_number=? AND id=?";
      db.query(
        checkIfExistsQuery,
        [jcNumber, testId],
        (checkError, checkResult) => {
          if (checkError) {
            return res
              .status(500)
              .json({ message: "Internal server error", error: checkError });
          }

          if (checkResult.length > 0) {
            // Row exists, so update it
            const updateQuery = `
                    UPDATE jc_tests
                    SET
                        test = ?, 
                        nabl = ?, 
                        testStandard = ?, 
                        testProfile = ?
                    WHERE jc_number = ? AND id = ?`;
            const updateValues = [
              test,
              nabl,
              testStandard,
              testProfile,
              jcNumber,
              testId,
            ];

            db.query(updateQuery, updateValues, (updateError, updateResult) => {
              if (updateError) {
                return res.status(500).json({
                  message: "Internal server error",
                  error: updateError,
                });
              } else {
                return res.status(200).json({
                  message: "Test updated successfully",
                  result: updateResult,
                });
              }
            });
          } else {
            // Row does not exist, so insert it
            const insertQuery = `
                    INSERT INTO jc_tests (test, nabl, testStandard, testProfile, jc_number)
                    VALUES (?, ?, ?, ?, ?)`;
            const insertValues = [
              test,
              nabl,
              testStandard,
              testProfile,
              jcNumber,
            ];

            db.query(insertQuery, insertValues, (insertError, insertResult) => {
              if (insertError) {
                return res.status(500).json({
                  message: "Internal server error",
                  error: insertError,
                });
              } else {
                return res.status(200).json({
                  message: "Test inserted successfully",
                  result: insertResult,
                  insertedId: insertResult.insertId,
                });
              }
            });
          }
        }
      );
    } else {
      res.status(400).json({ message: "Row ID is required" });
    }
  });

  ////////////////////////////////////////////////////////////////////////////////////////////////////

  //////////////////////////////////////////////////////////////////////

  // To Delete the selected test_details row:
  app.delete("/api/deleteTestDetailsTableRows/:id", (req, res) => {
    const id = req.params.id;

    let sqlQuery = "DELETE FROM tests_details WHERE id=?";
    db.query(sqlQuery, [id], (error, result) => {
      if (error) {
        console.error("Error deleting test detail:", error);
        return res.status(500).json({ message: error.message });
      } else {
        res
          .status(200)
          .json({ message: "JC Test Details Row deleted successfully" });
      }
    });
  });

  // To Insert or delete Test Details based on test name:
  app.post("/api/testdetails_sync/names/", async (req, res) => {
    let { testDetailsRowIds, jcNumberString } = req.body;

    // Check if testDetailsRowIds and jcNumberString are defined
    if (!testDetailsRowIds || !jcNumberString) {
      console.log("Missing testDetailsRowIds or jcNumberString");
      return res
        .status(400)
        .json({ message: "Missing testDetailsRowIds or jcNumberString" });
    }

    let sqlQuery = "SELECT id FROM tests_details WHERE jc_number=?";
    db.query(sqlQuery, [jcNumberString], async (error, result) => {
      if (error) return res.status(500).json(error.message);

      let existingIds = result.map((item) => item.id);
      let toDelete = existingIds.filter(
        (id) => !testDetailsRowIds.includes(id)
      );
      let toAddCount = testDetailsRowIds.length - existingIds.length;

      try {
        // Delete rows
        await Promise.all(
          toDelete.map((id) => {
            return new Promise((resolve, reject) => {
              sqlQuery = "DELETE FROM tests_details WHERE id=?";
              db.query(sqlQuery, [id], (error) => {
                if (error) return reject(error);
                resolve();
              });
            });
          })
        );

        // Add new rows
        const newIds = [];
        for (let i = 0; i < toAddCount; i++) {
          await new Promise((resolve, reject) => {
            sqlQuery = "INSERT INTO tests_details (jc_number) VALUES (?)";
            db.query(sqlQuery, [jcNumberString], (error, result) => {
              if (error) return reject(error);
              newIds.push(result.insertId);
              resolve();
            });
          });
        }

        res.status(200).json({
          message: "test details synced successfully",
          toDelete,
          newIds,
        });
      } catch (error) {
        res.status(500).json({ message: "Internal server error", error });
      }
    });
  });

  ////////////////////////////////////////////////////////////////////////////////////////
  //To Edit the selected test_details row:

  app.post("/api/testdetails/", (req, res) => {
    const {
      testDetailRowId,
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
      testReviewedBy,
      testReportInstructions,
      reportNumber,
      preparedBy,
      nablUploaded,
      reportStatus,
      jcNumber,
      loggedInUser,
    } = req.body;

    const formattedStartDate = startDate ? convertDateTime(startDate) : null;
    const formattedEndDate = endDate ? convertDateTime(endDate) : null;
    const formattedDuration = duration < 0 ? 0 : duration;

    const sqlFetchQuery = `SELECT testName, testReportInstructions, reportStatus FROM tests_details WHERE id = ?`;

    db.query(sqlFetchQuery, [testDetailRowId], (error, results) => {
      if (error) {
        console.error("Error fetching test details:", error);
        return res
          .status(500)
          .json({ message: "Internal server error", error });
      }

      // Check if results are returned, if not, set default values
      const existingRow = results.length > 0 ? results[0] : null;
      const existingTestName = existingRow ? existingRow.testName : null;
      const existingTestReportInstructions = existingRow
        ? existingRow.testReportInstructions
        : null;
      const existingReportStatus = existingRow
        ? existingRow.reportStatus
        : null;

      const usersToNotifyReportDeliveryInstructions = [
        "Lab Manager",
        "Reports & Scrutiny Manager",
        "Quality Engineer",
      ];

      const usersToNotifyReportDeliveryStatus = [
        "Lab Manager",
        "Accounts Admin",
        "Accounts Executive",
      ];

      const testReportInstructionOptions = [
        "Send Draft Report Only",
        "Send Final Report",
        "Hold Report",
      ];

      const reportStatusOptions = [
        "Draft Report Sent",
        "Final Report Sent",
        "On-Hold",
        "Not Sent",
      ];

      const currentTimestamp = new Date().toISOString();

      const sqlUpdateQuery = `
        UPDATE tests_details
        SET 
          testName = ?,
          testChamber = ?, 
          eutSerialNo = ?, 
          standard = ?, 
          testStartedBy = ?, 
          startDate = ?, 
          endDate = ?, 
          duration = ?, 
          actualTestDuration = ?, 
          unit = ?, 
          testEndedBy = ?, 
          remarks = ?, 
          testReviewedBy = ?,
          testReportInstructions = ?, 
          reportNumber = ?, 
          preparedBy = ?, 
          nablUploaded = ?, 
          reportStatus = ? 
        WHERE jc_number = ? AND id = ?`;

      const sqlInsertQuery = `
        INSERT INTO tests_details (
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
          testReviewedBy,
          testReportInstructions, 
          reportNumber, 
          preparedBy, 
          nablUploaded, 
          reportStatus, 
          jc_number
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      const updateValues = [
        testName || "",
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
        testReviewedBy || "",
        testReportInstructions || "",
        reportNumber || "",
        preparedBy || "",
        nablUploaded || "",
        reportStatus || "",
        jcNumber,
        testDetailRowId,
      ];

      const insertValues = [
        testName || "",
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
        testReviewedBy || "",
        testReportInstructions || "",
        reportNumber || "",
        preparedBy || "",
        nablUploaded || "",
        reportStatus || "",
        jcNumber,
      ];

      db.query(sqlUpdateQuery, updateValues, (error, result) => {
        if (error) {
          console.error("Error updating test details:", error);
          return res
            .status(500)
            .json({ message: "Internal server error", error });
        } else {
          if (result.affectedRows === 0) {
            db.query(sqlInsertQuery, insertValues, (error, result) => {
              if (error) {
                console.error("Error inserting test details:", error);
                return res
                  .status(500)
                  .json({ message: "Internal server error", error });
              } else {
                res
                  .status(200)
                  .json({ message: "tests_details inserted successfully" });
              }
            });
          } else {
            let reportDeliveryMessage = "";
            let reportStatusMessage = "";

            // Handle notifications only after the update
            for (let socketId in labbeeUsers) {
              const user = labbeeUsers[socketId];
              // Handle notification for report delivery instructions
              if (
                usersToNotifyReportDeliveryInstructions.includes(user.role) &&
                user.name !== loggedInUser &&
                testReportInstructions !== existingTestReportInstructions &&
                testReportInstructionOptions.includes(testReportInstructions)
              ) {
                reportDeliveryMessage = `"${testReportInstructions}" of ${existingTestName} of TS1 JC ${jcNumber}, by ${loggedInUser}`;
                io.to(socketId).emit("jobcard_report_delivery_notification", {
                  message: reportDeliveryMessage,
                  sender: loggedInUser,
                  receivedAt: currentTimestamp,
                });
              }

              // Handle notification for reportStatus
              if (
                usersToNotifyReportDeliveryStatus.includes(user.role) &&
                user.name !== loggedInUser &&
                reportStatus !== existingReportStatus &&
                reportStatusOptions.includes(reportStatus)
              ) {
                reportStatusMessage = `"${reportStatus}" of ${existingTestName} of TS1 JC ${jcNumber}, by ${loggedInUser}`;
                io.to(socketId).emit("jobcard_report_status_notification", {
                  message: reportStatusMessage,
                  sender: loggedInUser,
                  receivedAt: currentTimestamp,
                });
              }
            }

            // Save a single notification to the database for report delivery instructions
            if (reportDeliveryMessage) {
              saveNotificationToDatabase(
                reportDeliveryMessage,
                currentTimestamp,
                usersToNotifyReportDeliveryInstructions,
                loggedInUser
              );
            }

            // Save a single notification to the database for report status
            if (reportStatusMessage) {
              saveNotificationToDatabase(
                reportStatusMessage,
                currentTimestamp,
                usersToNotifyReportDeliveryStatus,
                loggedInUser
              );
            }

            res
              .status(200)
              .json({ message: "tests_details updated successfully" });
          }
        }
      });
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
    const sqlQuery = `SELECT  testName,testChamber,eutSerialNo,standard,testStartedBy,startDate,endDate,duration, actualTestDuration, unit,testEndedBy,remarks, testReviewedBy, testReportInstructions, reportNumber,preparedBy,nablUploaded, reportStatus FROM tests_details  WHERE jc_number = ?`;

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

  ///////////////////////////////////////////////////////////////////

  //Fetch chambers utilization hours list:
  // app.get("/api/getChamberUtilization", (req, res) => {
  //   const chamberUtilizationQuery = `
  //                   SELECT
  //                       testChamber,
  //                       SUM(CASE WHEN MONTH(startDate) = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) THEN actualTestDuration ELSE 0 END) AS prevMonthRunHours,
  //                       SUM(CASE WHEN MONTH(startDate) = MONTH(CURDATE()) THEN actualTestDuration ELSE 0 END) AS currentMonthRunHours,
  //                       SUM(actualTestDuration) AS totalRunHours
  //                   FROM
  //                       tests_details
  //                   WHERE testChamber IS NOT NULL AND testChamber <> ''
  //                   GROUP BY
  //                       testChamber
  //                   `;
  //   db.query(chamberUtilizationQuery, (error, results) => {
  //     if (error) {
  //       console.log(
  //         "An error occurred while fetching the chamber utilization data",
  //         error
  //       );
  //     }

  //     const formattedChamberUtilizationResult = results.map((row, index) => {
  //       const prevMonthRunHours = parseFloat(row.prevMonthRunHours) || 0;
  //       const currentMonthRunHours = parseFloat(row.currentMonthRunHours) || 0;
  //       const totalRunHours = parseFloat(row.totalRunHours) || 0;
  //       const chamberUtilization =
  //         currentMonthRunHours > prevMonthRunHours ? "More" : "Less";

  //       return {
  //         id: index + 1,
  //         chamberName: row.testChamber,
  //         prevMonthRunHours: prevMonthRunHours.toString(),
  //         currentMonthRunHours: currentMonthRunHours.toString(),
  //         chamberUtilization,
  //         totalRunHours: totalRunHours.toString(),
  //       };
  //     });

  //     res.json(formattedChamberUtilizationResult);
  //   });
  // });

  // Enhanced Chamber Utilization APIs

  // Minimal Chamber Utilization API for TS1 Department
  app.get("/api/getChamberUtilization", (req, res) => {
    const { year, month, dateFrom, dateTo, chamber } = req.query;

    let whereConditions = [
      "testChamber IS NOT NULL",
      "testChamber <> ''",
      "actualTestDuration IS NOT NULL",
    ];
    let queryParams = [];

    // Add filters
    if (year && month) {
      whereConditions.push("YEAR(startDate) = ? AND MONTH(startDate) = ?");
      queryParams.push(year, month);
    } else if (dateFrom && dateTo) {
      whereConditions.push("startDate BETWEEN ? AND ?");
      queryParams.push(dateFrom, dateTo);
    } else {
      // Default to current month
      whereConditions.push(
        "YEAR(startDate) = YEAR(CURDATE()) AND MONTH(startDate) = MONTH(CURDATE())"
      );
    }

    if (chamber && chamber !== "all") {
      whereConditions.push("testChamber = ?");
      queryParams.push(chamber);
    }

    const whereClause = `WHERE ${whereConditions.join(" AND ")}`;

    const chamberUtilizationQuery = `
    SELECT 
      testChamber,
      
      -- Current Period Data
      COUNT(*) AS totalTests,
      SUM(actualTestDuration) AS totalRunHours,
      AVG(actualTestDuration) AS avgTestDuration,
      MIN(startDate) AS firstTestDate,
      MAX(startDate) AS lastTestDate,
      
      -- Calculate utilization percentage (assuming 176 working hours per month)
      ROUND((SUM(actualTestDuration) / 176) * 100, 1) AS utilizationPercent
      
    FROM tests_details 
    ${whereClause}
    GROUP BY testChamber
    ORDER BY totalRunHours DESC
  `;

    db.query(chamberUtilizationQuery, queryParams, (error, currentResults) => {
      if (error) {
        console.error("Error fetching chamber utilization:", error);
        return res
          .status(500)
          .json({ error: "Failed to fetch chamber utilization data" });
      }

      // Get previous month data for comparison
      let prevWhereConditions = [
        "testChamber IS NOT NULL",
        "testChamber <> ''",
        "actualTestDuration IS NOT NULL",
      ];
      let prevQueryParams = [];

      if (year && month) {
        // Previous month of the selected period
        const prevMonth = month == 1 ? 12 : month - 1;
        const prevYear = month == 1 ? year - 1 : year;
        prevWhereConditions.push(
          "YEAR(startDate) = ? AND MONTH(startDate) = ?"
        );
        prevQueryParams.push(prevYear, prevMonth);
      } else {
        // Previous month from current
        prevWhereConditions.push(`
        YEAR(startDate) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) 
        AND MONTH(startDate) = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))
      `);
      }

      if (chamber && chamber !== "all") {
        prevWhereConditions.push("testChamber = ?");
        prevQueryParams.push(chamber);
      }

      const prevWhereClause = `WHERE ${prevWhereConditions.join(" AND ")}`;

      const previousMonthQuery = `
      SELECT 
        testChamber,
        SUM(actualTestDuration) AS prevTotalRunHours
      FROM tests_details 
      ${prevWhereClause}
      GROUP BY testChamber
    `;

      db.query(
        previousMonthQuery,
        prevQueryParams,
        (prevError, prevResults) => {
          if (prevError) {
            console.error("Error fetching previous month data:", prevError);
            return res
              .status(500)
              .json({ error: "Failed to fetch previous month data" });
          }

          // Merge current and previous data
          const mergedData = currentResults.map((current, index) => {
            const previous = prevResults.find(
              (prev) => prev.testChamber === current.testChamber
            );
            const prevRunHours = previous
              ? parseFloat(previous.prevTotalRunHours)
              : 0;
            const currentRunHours = parseFloat(current.totalRunHours);

            // Calculate month-over-month growth
            const growthRate =
              prevRunHours > 0
                ? (
                    ((currentRunHours - prevRunHours) / prevRunHours) *
                    100
                  ).toFixed(1)
                : currentRunHours > 0
                ? 100
                : 0;

            return {
              id: index + 1,
              chamberName: current.testChamber,
              totalTests: current.totalTests,
              totalRunHours: currentRunHours.toFixed(1),
              avgTestDuration: parseFloat(current.avgTestDuration).toFixed(1),
              utilizationPercent: parseFloat(current.utilizationPercent),
              growthRate: parseFloat(growthRate),
              prevRunHours: prevRunHours.toFixed(1),
              firstTestDate: current.firstTestDate,
              lastTestDate: current.lastTestDate,
            };
          });

          res.json(mergedData);
        }
      );
    });
  });

  // API to get available chambers for filter dropdown
  app.get("/api/getChambersListForFilter", (req, res) => {
    const chambersQuery = `
    SELECT DISTINCT testChamber
    FROM tests_details 
    WHERE testChamber IS NOT NULL 
    AND testChamber <> ''
    ORDER BY testChamber
  `;

    db.query(chambersQuery, (error, results) => {
      if (error) {
        console.error("Error fetching chambers list:", error);
        return res.status(500).json({ error: "Failed to fetch chambers list" });
      }

      const chambers = results.map((row) => ({
        value: row.testChamber,
        label: row.testChamber,
      }));

      res.json(chambers);
    });
  });

  // API to get available date options (years and months with data)
  app.get("/api/getChamberDateOptions", (req, res) => {
    const dateOptionsQuery = `
    SELECT DISTINCT 
      YEAR(startDate) as year,
      MONTH(startDate) as month,
      MONTHNAME(startDate) as monthName
    FROM tests_details 
    WHERE testChamber IS NOT NULL 
    AND testChamber <> ''
    AND startDate IS NOT NULL
    ORDER BY year DESC, month DESC
  `;

    db.query(dateOptionsQuery, (error, results) => {
      if (error) {
        console.error("Error fetching date options:", error);
        return res.status(500).json({ error: "Failed to fetch date options" });
      }

      const years = [...new Set(results.map((row) => row.year))];
      const months = [
        { value: "1", label: "January" },
        { value: "2", label: "February" },
        { value: "3", label: "March" },
        { value: "4", label: "April" },
        { value: "5", label: "May" },
        { value: "6", label: "June" },
        { value: "7", label: "July" },
        { value: "8", label: "August" },
        { value: "9", label: "September" },
        { value: "10", label: "October" },
        { value: "11", label: "November" },
        { value: "12", label: "December" },
      ];

      res.json({ years, months });
    });
  });
  //////////////////////////////////////////////////////////////////////////////

  // Fetch the number of reports status of the particular JC
  app.get("/api/jcWiseReportsStatusData", (req, res) => {
    const jcNumber = req.query.jcNumber; // Use query parameter
    console.log("JC Number:", jcNumber);
    const sqlQuery = `
    SELECT 
      COUNT(reportNumber) AS reportCount,
      COUNT(CASE WHEN reportStatus = 'Final Report Sent' THEN 1 END) AS finalReportSentCount,
      COUNT(CASE WHEN reportStatus = 'Draft Report Sent' THEN 1 END) AS draftReportSentCount,
      COUNT(CASE WHEN reportStatus = 'On-Hold' THEN 1 END) AS holdReportCount,
      CASE
       WHEN COUNT(CASE WHEN reportStatus != 'Final Report Sent' THEN 1 END) = 0
       THEN 'ALL REPORTS ARE SENT'
       ELSE 'REPORTS PENDING'
      END AS overallReportStatus
    FROM tests_details
    WHERE jc_number = ? AND reportNumber IS NOT NULL AND reportNumber <> '';
  `;

    db.query(sqlQuery, [jcNumber], (error, result) => {
      if (error) {
        return res.status(500).json({
          error: "An error occurred while fetching the reports status data",
        });
      }

      if (result.length === 0) {
        return res.status(404).json({
          message: "No reports found for the given JC number",
        });
      }

      res.status(200).json({
        reportCount: result[0].reportCount || 0,
        finalReportSentCount: result[0].finalReportSentCount || 0,
        draftReportSentCount: result[0].draftReportSentCount || 0,
        holdReportCount: result[0].holdReportCount || 0,
        overallReportStatus: result[0].overallReportStatus,
      });
    });
  });

  /////////////////////////////////////////////////////////////////////////////

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
          if (!res.headersSent) {
            res.status(500).send("Internal server error.");
          }
        });
    }
  );

  //To remove or delete the file
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
          if (!res.headersSent) {
            return res.status(500).json({ error });
          }
          return;
        }

        fs.unlink(filePath, (err) => {
          if (err) {
            console.error("Error deleting file from filesystem:", err);
            if (!res.headersSent) {
              return res
                .status(500)
                .json({ error: "Error deleting file from filesystem" });
            }
            return;
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
          if (!res.headersSent) {
            res.status(404).send("File not found");
          }
        }
      });
    });
  });

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////
}

module.exports = { jobcardsAPIs };
