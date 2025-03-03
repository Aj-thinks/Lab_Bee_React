import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";

import Docxtemplater from "docxtemplater";
import { saveAs } from "file-saver";

import TS1Template from "../templates/EnvironmentalQuoteTemplate.docx";
import RETemplate from "../templates/ReliabilityQuoteTemplate.docx";
import ITTemplate from "../templates/ItemSoftQuoteTemplate.docx";
import EMI_EMC_Template from "../templates/EMICQuoteTemplate.docx";

import PizZip from "pizzip";
import PizZipUtils from "pizzip/utils/index.js";
import axios from "axios";
import moment from "moment";
import { toast } from "react-toastify";
import { serverBaseAddress } from "../Pages/APIPage";

function loadFile(url, callback) {
  PizZipUtils.getBinaryContent(url, callback);
}

export default function DocToPdf({ id }) {
  // const { id } = useParams('id')

  let defTestDescription = "";
  let defSacNo = "";
  let defDuration = "";
  let defUnit = "";
  let defPerUnitCharge = "";
  let defAmount = "";

  const initialTableData = [
    {
      slno: 1,
      testDescription: defTestDescription,
      sacNo: defSacNo,
      duration: defDuration,
      unit: defUnit,
      perUnitCharge: defPerUnitCharge,
      amount: defAmount,
    },
  ];

  const [toCompanyName, setToCompanyName] = useState("");
  const [toCompanyAddress, setToCompanyAddress] = useState("");
  const [kindAttention, setKindAttention] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerContactNumber, setCustomerContactNumber] = useState("");
  const [selectedQuotationId, setSelectedQuotationId] = useState("");
  const [customerIdStr, setCustomerIdStr] = useState("");
  const formattedDate = moment(new Date()).format("DD-MM-YYYY");
  const [quoteGivenDate, setQuoteGivenDate] = useState(formattedDate);
  const [customerReferance, setCustomerReferance] = useState("");

  const [totalAmountInWords, setTotalAmountInWords] = useState("");

  const presentDate = new Date();
  const todaysDate = moment(presentDate).format("DD-MM-YYYY");
  const [quoteCategory, setQuoteCategory] = useState("");
  const [quoteVersion, setQuoteVersion] = useState("");
  const [tableData, setTableData] = useState(initialTableData);
  const [counter, setCounter] = useState(tableData.length + 1);
  const [taxableAmount, setTaxableAmount] = useState(0);

  const [quotationTitle, setQuotationTitle] = useState("");
  const [quotationTitleDialog, setQuotationTitleDialog] = useState(true);

  const [companyLogoImage, setCompanyLogoImage] = useState(null);
  const fileInputRef = useRef(null);

  //const [fileInputRefOfDoc, setFileInputRefOfDoc] = useState(useRef(null));

  // Function to handle the uploaded image:
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCompanyLogoImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Function to generate the word document based on the data:
  const generatePDF = async () => {
    let templateDocument = "";

    if (quoteCategory === "Environmental Testing") {
      templateDocument = TS1Template;
    }

    if (
      quoteCategory === "Reliability" ||
      quoteCategory === "Software" ||
      quoteCategory === "Others"
    ) {
      templateDocument = RETemplate;
    }

    if (quoteCategory === "Item Soft") {
      templateDocument = ITTemplate;
    }

    if (quoteCategory === "EMI & EMC") {
      templateDocument = EMI_EMC_Template;
    }

    loadFile(templateDocument, function (error, content) {
      if (error) {
        throw error;
      }

      const zip = new PizZip(content);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });

      let newTData = [];
      for (let i = 0; i < tableData.length; i++) {
        // console.log(modules[tableData[i].module_id]);
        newTData[i] = tableData[i];
        newTData[i].module_name = modules[tableData[i].module_id];
      }

      // Set the data for the table placeholder in the template
      doc.setData({
        QUOTATIONTITLE: quotationTitle,

        selectedQuotationId: selectedQuotationId,
        quoteVersion: quoteVersion,
        toCompanyName: toCompanyName,
        toCompanyAddress: toCompanyAddress,
        kindAttention: kindAttention,
        customerEmail: customerEmail,
        customerContactNumber: customerContactNumber,
        customerIdStr: customerIdStr,
        quoteGivenDate: quoteGivenDate,
        customerReferance: customerReferance,
        todaysDate: todaysDate,
        taxableAmount: taxableAmount,
        totalAmountInWords: totalAmountInWords,

        dataRows: newTData,
      });

      doc.render();

      // Convert the generated document to a blob
      const blob = doc.getZip().generate({
        type: "blob",
        mimeType:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      // Save the blob as a file
      const fileName = `QT_${selectedQuotationId}.docx`;
      saveAs(blob, fileName);
    });
  };

  // Function to submit the title and the image of the dialog
  function onSubmitQuoteTitleButton() {
    if (quotationTitle !== "") {
      generatePDF();
      setQuotationTitle("");
      setCompanyLogoImage(null);
      setQuotationTitleDialog(false);
    } else {
      toast.warning("Please enter the quotation title");
    }
  }

  // Function to clear the title and the image of the dialog. And to close the dialog
  function handleCancelBtnIsClicked() {
    setQuotationTitle("");
    setCompanyLogoImage(null);
    setQuotationTitleDialog(false);
  }

  const [modules, setModules] = useState([]);

  useEffect(() => {
    axios
      .get(`${serverBaseAddress}/api/getItemsoftModules/`)
      .then((result) => {
        let newModules = {};
        result.data.forEach((e) => {
          newModules[e.id] = e.module_name + " - " + e.module_description;
        });
        setModules(newModules);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  useEffect(() => {
    axios
      .get(`${serverBaseAddress}/api/quotation/` + id)
      .then((result) => {
        setToCompanyName(result.data[0].company_name);
        setToCompanyAddress(result.data[0].company_address);
        setKindAttention(result.data[0].kind_attention);
        setCustomerEmail(result.data[0].customer_email);
        setCustomerContactNumber(result.data[0].customer_contact_number);
        setSelectedQuotationId(result.data[0].quotation_ids);
        setCustomerIdStr(result.data[0].customer_id);
        setQuoteGivenDate(
          moment(result.data[0].quote_given_date).format("DD-MM-YYYY")
        );
        setCustomerReferance(result.data[0].customer_referance);
        setTableData(JSON.parse(result.data[0].tests));
        setQuoteCategory(result.data[0].quote_category);
        setQuoteVersion(
          result.data[0].quote_version ? result.data[0].quote_version : ""
        );
        setTaxableAmount(result.data[0].total_amount);
        setTotalAmountInWords(result.data[0].total_taxable_amount_in_words);
        // console.log('Aj', result.data[0].tests)
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  return (
    <>
      {quotationTitleDialog && (
        <Dialog
          open={quotationTitleDialog}
          onClose={handleCancelBtnIsClicked}
          aria-labelledby="quotation_title-dialog"
        >
          <DialogTitle id="quotation_title-dialog">
            Enter Quotation Title{" "}
          </DialogTitle>
          <DialogContent>
            <TextField
              sx={{ minWidth: "400px", borderRadius: 3 }}
              value={quotationTitle}
              onChange={(e) => setQuotationTitle(e.target.value.toUpperCase())}
              label="Quotation Title"
              margin="normal"
              fullWidth
              variant="outlined"
              autoComplete="on"
            />
          </DialogContent>

          <DialogActions sx={{ alignItems: "center" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleCancelBtnIsClicked}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="secondary"
              type="submit"
              onClick={onSubmitQuoteTitleButton}
            >
              Submit
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
}
