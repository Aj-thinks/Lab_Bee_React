const { db } = require("./db");

const dayjs = require("dayjs");
const moment = require("moment");
// const { getFinancialYear } = require('../frontend/src/functions/UtilityFunctions');

function poInvoiceBackendAPIs(app) {
  // api to add jc, rfq, po, invoice data to the table
  app.post("/api/addPoInvoice", (req, res) => {
    const { formData } = req.body;

    const sqlQuery = `
    INSERT INTO po_invoice_table (company_name, jc_number, jc_month, jc_category, rfq_number, rfq_value, po_number, po_value, po_status, invoice_number, invoice_value, invoice_status, payment_status, remarks)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)`;

    const formattedJcOpenDate = moment(formData.jcOpenDate).format(
      "YYYY-MM-DD"
    );

    const values = [
      formData.companyName,
      formData.jcNumber,
      formattedJcOpenDate,
      formData.jcCategory,
      formData.rfqNumber,
      formData.rfqValue,
      formData.poNumber,
      formData.poValue,
      formData.poStatus,
      formData.invoiceNumber,
      formData.invoiceValue,
      formData.invoiceStatus,
      formData.paymentStatus,
      formData.remarks,
    ];

    db.query(sqlQuery, values, (error, result) => {
      if (error) {
        return res
          .status(500)
          .json({ error: "An error occurred while adding PO, Invoice data" });
      } else {
        res
          .status(200)
          .json({ message: "PO, Invoice data added Successfully" });
      }
    });
  });

  // Get all po and invoice data to display that in a table:
  app.get("/api/getPoInvoiceDataList", (req, res) => {
    const { year, month } = req.query;

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
    // Convert month name to month number
    const monthNumber = monthNames.indexOf(month) + 1;

    if (monthNumber === 0 || !year) {
      return res.status(400).json({ error: "Invalid year or month format" });
    }

    const getPoAndInvoiceList = `SELECT 
                                id, company_name, jc_number, DATE_FORMAT(jc_month, '%Y-%m-%d') as jc_month, jc_category, rfq_number, rfq_value, po_number, po_value, po_status, invoice_number, invoice_value, invoice_status, payment_status, remarks
                                FROM po_invoice_table 
                                WHERE MONTH(jc_month) = ? AND YEAR(jc_month) = ? 
                                `;

    db.query(getPoAndInvoiceList, [monthNumber, year], (error, result) => {
      if (error) {
        console.error("Error fetching PO and invoice data:", error);
        res
          .status(500)
          .json({ error: "Failed to retrieve PO and invoice data" });
      } else {
        res.status(200).json(result);
      }
    });
  });

  ////////////////////////////////////////////////////////////////////
  // Get the PO data between two date ranges:
  app.get("/api/getPoInvoiceDataBwTwoDates", (req, res) => {
    const { selectedPODateRange } = req.query;

    if (!selectedPODateRange || typeof selectedPODateRange !== "string") {
      return res.status(400).json({ error: "Invalid date range format" });
    }

    const [fromDate, toDate] = selectedPODateRange.split(" - ");

    if (!fromDate || !toDate) {
      return res.status(400).json({ error: "Invalid date range format" });
    }

    const getPOColumns = `
        SELECT 
        id, company_name, jc_number, DATE_FORMAT(jc_month, '%Y-%m-%d') as jc_month, jc_category, rfq_number, rfq_value, po_number, po_value, po_status, invoice_number, invoice_value, invoice_status, payment_status, remarks
        FROM po_invoice_table
        WHERE jc_month BETWEEN ? AND ?
      `;

    db.query(getPOColumns, [fromDate, toDate], (error, result) => {
      if (error) {
        return res
          .status(500)
          .json({ error: "An error occurred while fetching PO table data" });
      }
      res.send(result);
    });
  });

  ////////////////////////////////////////////////////////////////////

  //API to delete the selected po and invoice data:
  app.delete("/api/deletePoData/:jc_number", (req, res) => {
    const jc_number = req.params.jc_number;

    const deleteQuery = "DELETE FROM po_invoice_table WHERE jc_number = ?";

    db.query(deleteQuery, [jc_number], (error, result) => {
      if (error) {
        return res.status(500).json({
          error: "An error occurred while deleting the selected PO JC",
        });
      }
      res.status(200).json({
        message: "PO data for the selected JC number deleted successfully",
      });
    });
  });

  //API to edit or update the selected po and invoice data:
  app.get("/api/getPoData/:id", (req, res) => {
    const id = req.params.id;

    const sqlQuery = `SELECT id, company_name, jc_number, jc_month, jc_category, rfq_number, rfq_value, po_number, po_value, po_status, invoice_number, invoice_value, invoice_status, payment_status, remarks FROM po_invoice_table WHERE id = ?`;

    db.query(sqlQuery, [id], (error, result) => {
      if (error) {
        return res
          .status(500)
          .json({ error: "An error occurred while fetching data" });
      }
      res.send(result);
    });
  });

  //API to update the selected booking:
  app.post("/api/addPoInvoice/:id", (req, res) => {
    const { formData } = req.body;

    const sqlQuery = `
        UPDATE po_invoice_table
        SET
        company_name = ?,
            jc_number = ?,
            jc_month = ?,
            jc_category = ?,
            rfq_number = ?,
            rfq_value = ?,
            po_number = ?,
            po_value = ?,
            po_status = ?,
            invoice_number = ?,
            invoice_value = ?,
            invoice_status = ?,
            payment_status = ?,
            remarks = ?
        WHERE id = ?
    `;
    const formattedJcOpenDate = moment(formData.jcOpenDate).format(
      "YYYY-MM-DD"
    );

    const values = [
      formData.companyName,
      formData.jcNumber,
      formattedJcOpenDate,
      formData.jcCategory,
      formData.rfqNumber,
      formData.rfqValue,
      formData.poNumber,
      formData.poValue,
      formData.poStatus,
      formData.invoiceNumber,
      formData.invoiceValue,
      formData.invoiceStatus,
      formData.paymentStatus,
      formData.remarks,
      formData.id,
    ];

    db.query(sqlQuery, values, (error, result) => {
      if (error) {
        console.error("Error updating selected PO data:", error);
        return res
          .status(500)
          .json({ error: "An error occurred while updating selected PO data" });
      } else {
        res.status(200).json({ message: "PO data updated successfully" });
      }
    });
  });

  // //API to fetch the year-month list po and invoice data:
  app.get("/api/getPoDataYearMonth", (req, res) => {
    const sqlQuery = `
        SELECT
            DISTINCT DATE_FORMAT(jc_month, '%b') AS month,
            DATE_FORMAT(jc_month, '%Y') AS year,
            MONTH(jc_month) AS monthNumber
        FROM po_invoice_table
        ORDER BY year ASC, monthNumber ASC`;

    // const sqlQuery = `
    //     SELECT
    //         DISTINCT DATE_FORMAT(jc_open_date, '%b') AS month,
    //         DATE_FORMAT(jc_open_date, '%Y') AS year
    //     FROM bea_jobcards`;

    db.query(sqlQuery, (error, result) => {
      if (error) {
        return res
          .status(500)
          .json({ error: "An error occurred while fetching data" });
      }

      const formattedData = result.map((row) => ({
        month: row.month,
        year: row.year,
      }));
      res.json(formattedData);
    });
  });

  app.get("/api/getPoStatusData", (req, res) => {
    const { year, month } = req.query;

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
    // Convert month name to month number
    const monthNumber = monthNames.indexOf(month) + 1;

    if (monthNumber === 0 || !year) {
      return res.status(400).json({ error: "Invalid year or month format" });
    }

    const getPoStatusDataQuery = `
                      SELECT
                        SUM(CASE WHEN po_status = 'PO Received' THEN 1 ELSE 0 END) AS receivedPoCount,
                        SUM(CASE WHEN po_status = 'PO Not Received' THEN 1 ELSE 0 END) AS notReceivedPoCount,
                        SUM(CASE WHEN po_status = 'PO Received' THEN po_value ELSE 0 END) AS receivedPoSum,
                        SUM(CASE WHEN po_status = 'PO Not Received' THEN po_value ELSE 0 END) AS notReceivedPoSum,

                        SUM(CASE WHEN invoice_status = 'Invoice Sent' THEN 1 ELSE 0 END) AS invoiceSentCount,
                        SUM(CASE WHEN invoice_status = 'Invoice Not Sent' THEN 1 ELSE 0 END) AS invoiceNotSentCount,
                        SUM(CASE WHEN invoice_status = 'Invoice Sent' THEN invoice_value ELSE 0 END) AS invoiceSentSum,
                        SUM(CASE WHEN invoice_status = 'Invoice Not Sent' THEN invoice_value ELSE 0 END) AS invoiceNotSentSum,

                        SUM(CASE WHEN payment_status = 'Payment Received' THEN 1 ELSE 0 END) AS paymentReceivedCount,
                        SUM(CASE WHEN payment_status = 'Payment Not Received' THEN 1 ELSE 0 END) AS paymentNotReceivedCount,
                        SUM(CASE WHEN payment_status = 'Payment on Hold' THEN 1 ELSE 0 END) AS paymentOnHoldCount,
                        SUM(CASE WHEN payment_status = 'Payment on Hold' THEN invoice_value ELSE 0 END) AS paymentOnHoldSum

                      FROM 
                        po_invoice_table 
                      WHERE 
                        MONTH(jc_month) = ? AND YEAR(jc_month) = ?
                      `;

    db.query(getPoStatusDataQuery, [monthNumber, year], (error, result) => {
      if (error) {
        console.error("Error fetching PO Status data:", error);
        res.status(500).json({ error: "Failed to retrieve PO Status data" });
      } else {
        res.status(200).json(result); // Send the first row of the result (assuming only one row is returned)
      }
    });
  });

  //API to fetch the JC status list of jobcards:
  app.get("/api/getJcCountList", (req, res) => {
    const { year, month } = req.query;

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
    const monthNumber = monthNames.indexOf(month) + 1;

    if (monthNumber === 0 || !year) {
      return res.status(400).json({ error: "Invalid year or month format" });
    }

    const totalJcCountQuery = `
        SELECT COUNT(*) as total_jc_count 
        FROM bea_jobcards 
        WHERE MONTH(jc_open_date) = ? AND YEAR(jc_open_date) = ?`;

    const categoryWiseCountQuery = `
        SELECT jc_category, COUNT(*) as count 
        FROM bea_jobcards 
        WHERE MONTH(jc_open_date) = ? AND YEAR(jc_open_date) = ? 
        GROUP BY jc_category`;

    const statusWiseCountQuery = `
        SELECT jc_status, COUNT(*) as count 
        FROM bea_jobcards 
        WHERE MONTH(jc_open_date) = ? AND YEAR(jc_open_date) = ? 
        GROUP BY jc_status`;

    // Execute the queries in parallel
    Promise.all([
      new Promise((resolve, reject) => {
        db.query(totalJcCountQuery, [monthNumber, year], (error, result) => {
          if (error) return reject(error);
          resolve(result[0]);
        });
      }),
      new Promise((resolve, reject) => {
        db.query(
          categoryWiseCountQuery,
          [monthNumber, year],
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
      }),
      new Promise((resolve, reject) => {
        db.query(statusWiseCountQuery, [monthNumber, year], (error, result) => {
          if (error) return reject(error);
          resolve(result);
        });
      }),
    ])
      .then(([totalJcCount, categoryWiseCounts, statusWiseCounts]) => {
        res.status(200).json({
          totalJcCount,
          categoryWiseCounts,
          statusWiseCounts,
        });
      })
      .catch((error) => {
        console.error("Error fetching JC data:", error);
        res.status(500).json({ error: "Failed to retrieve JC data" });
      });
  });

  //API to fetch the total monthwise quotations count:
  app.get("/api/getLastSixMonthsRevenueData", (req, res) => {
    const sqlQuery = `
    SELECT 
      DATE_FORMAT(jc_month, '%Y-%b') AS month_year,
      SUM(CAST(invoice_value AS DECIMAL(15,2))) AS total_revenue
    FROM 
      po_invoice_table
    WHERE
      jc_month >= DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 5 MONTH), '%Y-%m-01')
    GROUP BY 
      month_year
    ORDER BY 
      MIN(jc_month) ASC
    LIMIT 6;
    `;

    db.query(sqlQuery, (error, result) => {
      if (error) {
        console.error("SQL error:", error.message);
        return res.status(500).json({
          error: "Error while fetching the monthwise revenue list",
          details: error.message,
        });
      }
      res.send(result);
    });
  });
}

module.exports = { poInvoiceBackendAPIs };
