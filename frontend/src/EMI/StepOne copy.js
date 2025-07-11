import { useCallback, useContext, useEffect, useState } from "react";
import {
  Box,
  Card,
  Grid,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import { EMIJCContext } from "./EMIJCContext";
import { useForm } from "react-hook-form";
import _ from "lodash";
import RenderComponents from "../functions/RenderComponents";
import RenderTable from "../functions/RenderTable";
import useEMIStore from "./EMIStore";

export default function EMIJCStepOne() {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  // State for managing dynamic test names per row
  const [testNamesForRows, setTestNamesForRows] = useState({});

  const {
    standards,
    testNames,
    getStandardsAsOptions,
    loadTestNamesByStandard,
    loadAllEMIData,
  } = useEMIStore();

  const {
    stepOneFormData,
    updateStepOneFormData,
    eutTableRows,
    updateEutTableRows,
    testsTableRows,
    updateTestsTableRows,
    deletedEutIds,
    setDeletedEutIds,
    deletedTestIds,
    setDeletedTestIds,
  } = useContext(EMIJCContext);

  const { control, register, setValue, watch } = useForm();
  // const { control, register, setValue, watch } = useForm({
  //   defaultValues: stepOneFormData,
  // });

  const fieldsToBeFilledByCustomerPartOne = [
    { label: "Company", name: "companyName", type: "textField", width: "100%" },
    {
      label: "Company Address",
      name: "companyAddress",
      type: "textArea",
      width: "100%",
    },

    {
      label: "Customer/Visitor Name",
      name: "customerName",
      type: "textField",
      width: "100%",
    },
    {
      label: "Customer Email",
      name: "customerEmail",
      type: "textField",
      width: "100%",
    },
  ];

  const fieldsToBeFilledByCustomerPartTwo = [
    {
      label: "Customer Phone",
      name: "customerPhone",
      type: "textField",
      width: "100%",
    },

    {
      label: "Project Name",
      name: "projectName",
      type: "textField",
      width: "100%",
    },

    {
      label: "Report Type",
      name: "reportType",
      type: "select",
      options: [
        { id: "NABL", label: "NABL" },
        { id: "NON-NABL", label: "NON-NABL" },
        { id: "NABL/NON-NABL", label: "NABL & NON-NABL" },
      ],
      width: "100%",
    },
  ];

  //Fields to create a EUT details table:
  const eutTableColumns = [
    { id: "serialNumber", label: "SL No", width: 20 },
    { id: "eutName", label: "EUT Details", width: 300, type: "textField" },
    { id: "eutQuantity", label: "Quantity", width: 200, type: "textField" },
    {
      id: "eutPartNumber",
      label: "Part Number",
      width: 300,
      type: "textField",
    },
    {
      id: "eutModelNumber",
      label: "Model Number",
      width: 200,
      type: "textField",
    },
    {
      id: "eutSerialNumber",
      label: "Serial Number",
      width: 200,
      type: "textField",
    },
  ];

  const eutTableRowTemplate = {
    eutName: "",
    eutQuantity: "",
    eutPartNumber: "",
    eutModelNumber: "",
    eutSerialNumber: "",
  };

  // Handle standard selection change for a specific row
  const handleStandardChange = async (rowIndex, standardValue) => {
    // Update the selected standard for this row
    setSelectedStandardForRow((prev) => ({
      ...prev,
      [rowIndex]: standardValue,
    }));

    // Load test names for the selected standard
    if (standardValue) {
      try {
        const testNamesForStandard = await loadTestNamesByStandard(
          standardValue
        );

        // Convert to options format for the dropdown
        const testNameOptions = testNamesForStandard.map((testName) => ({
          id: testName.id || testName.name,
          label: testName.name,
          value: testName.name,
        }));

        console.log("testNameOptions", testNameOptions);

        setAvailableTestNamesForRow((prev) => ({
          ...prev,
          [rowIndex]: testNameOptions,
        }));

        // Clear the test name selection for this row when standard changes
        const updatedRows = testsTableRows.map((row, index) => {
          if (index === rowIndex) {
            return { ...row, testName: "" };
          }
          return row;
        });
        updateTestsTableRows(updatedRows);
      } catch (error) {
        console.error("Error loading test names for standard:", error);
        setAvailableTestNamesForRow((prev) => ({
          ...prev,
          [rowIndex]: [],
        }));
      }
    } else {
      // Clear test names if no standard selected
      setAvailableTestNamesForRow((prev) => ({
        ...prev,
        [rowIndex]: [],
      }));
    }
  };

  // Function to get test names for a specific row based on selected standard
  const getTestNamesForRow = (rowIndex) => {
    const row = testsTableRows[rowIndex];
    if (!row || !row.testStandard) {
      return []; // Return empty if no standard selected
    }

    return testNamesForRows[rowIndex] || [];
  };

  //Fields to create a Tests details table:
  const testsTableColumns = [
    { id: "serialNumber", label: "SL No", width: 20 },
    {
      id: "testStandard",
      label: "Standard",
      width: 300,
      type: "select",
      options: getStandardsAsOptions(),
    },
    {
      id: "testName",
      label: "Test Name",
      width: 300,
      type: "select",
      options: [], // This will be populated dynamically
    },
    { id: "testProfile", label: "Limit", width: 300, type: "textField" },
  ];

  const testsTableRowTemplate = {
    testName: "",
    testStandard: "",
    testProfile: "",
  };

  // Watch form fields and update context on value change
  const stepOneFormValues = watch();

  // When the component mounts, populate the form fields with context data
  useEffect(() => {
    if (stepOneFormData) {
      _.forEach(stepOneFormData, (value, key) => {
        setValue(key, value || "");
      });
    }
  }, [stepOneFormData, setValue]);

  useEffect(() => {
    if (eutTableRows.length === 0) {
      updateEutTableRows([eutTableRowTemplate]);
    }
    if (testsTableRows.length === 0) {
      updateTestsTableRows([testsTableRowTemplate]); // Add a default row if there's no data
    }
  }, [eutTableRows, updateEutTableRows, testsTableRows, updateTestsTableRows]);

  const handleUpdateStepOneFormData = useCallback(
    (values) => {
      if (!_.isEqual(values, stepOneFormData)) {
        updateStepOneFormData(values);
      }
    },
    [stepOneFormData, updateStepOneFormData]
  );

  useEffect(() => {
    handleUpdateStepOneFormData(stepOneFormValues);
  }, [stepOneFormValues, handleUpdateStepOneFormData]);

  useEffect(() => {
    // Add a mount check to ensure this only runs once
    const shouldInitialize = true; // You can replace this with a ref if needed

    if (shouldInitialize) {
      if (eutTableRows.length === 0) {
        updateEutTableRows([eutTableRowTemplate]);
      }
      if (testsTableRows.length === 0) {
        updateTestsTableRows([testsTableRowTemplate]); // Add a default row if there's no data
      }
    }
  }, []); // Empty dependency array so it only runs once on mount

  //////////////////////////////////////////////////////////////

  // Load EMI data on component mount
  useEffect(() => {
    const initializeEMIData = async () => {
      try {
        await loadAllEMIData();
        console.log("EMI data loaded successfully");
      } catch (error) {
        console.error("Error loading EMI data:", error);
      }
    };

    initializeEMIData();

    // Initialize table rows if empty
    if (eutTableRows.length === 0) {
      updateEutTableRows([eutTableRowTemplate]);
    }
    if (testsTableRows.length === 0) {
      updateTestsTableRows([testsTableRowTemplate]);
    }
  }, []); // Empty dependency array so it only runs once on mount

  // Effect to restore test names when testsTableRows change (for edit mode)
  useEffect(() => {
    testsTableRows.forEach(async (row, index) => {
      if (
        row.testStandard &&
        row.testStandard !== selectedStandardForRow[index]
      ) {
        // Restore the standard selection
        setSelectedStandardForRow((prev) => ({
          ...prev,
          [index]: row.testStandard,
        }));

        // Load test names for the standard
        try {
          const testNamesForStandard = await loadTestNamesByStandard(
            row.testStandard
          );
          const testNameOptions = testNamesForStandard.map((testName) => ({
            id: testName.id || testName.name,
            label: testName.name,
            value: testName.name,
          }));

          setAvailableTestNamesForRow((prev) => ({
            ...prev,
            [index]: testNameOptions,
          }));
        } catch (error) {
          console.error("Error restoring test names for standard:", error);
        }
      }
    });
  }, [testsTableRows]);

  return (
    <>
      <Card sx={{ width: "100%", mt: "10px", mb: "10px" }}>
        <Typography variant="h5" sx={{ mb: "5px" }}>
          Customer Details
        </Typography>

        <Grid
          container
          spacing={2}
          alignItems="stretch"
          justifyContent="center"
          sx={{ padding: "10px" }}
        >
          <Grid item xs={12} sm={6} md={6}>
            <RenderComponents
              fields={fieldsToBeFilledByCustomerPartOne}
              register={register}
              control={control}
              watch={watch}
              setValue={setValue}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={6}>
            <RenderComponents
              fields={fieldsToBeFilledByCustomerPartTwo}
              register={register}
              control={control}
              watch={watch}
              setValue={setValue}
            />
          </Grid>
        </Grid>
      </Card>

      <Card sx={{ width: "100%", mt: "10px", mb: "10px", padding: "10px" }}>
        <Box
          sx={{
            border: "1px solid black",
          }}
        >
          <Grid item xs={12} sm={6} sx={{ padding: "5px" }}>
            <Typography
              variant={isSmallScreen ? "body2" : "h7"}
              color="red"
              gutterBottom
            >
              {" "}
              Note 1: The Test Report will be generated based on the filled
              details only. Change/ Alteration of EUT/ DUT details after the
              completion of the test may not be entertained.
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6} sx={{ padding: "5px" }}>
            <Typography
              variant={isSmallScreen ? "body2" : "h7"}
              color="red"
              gutterBottom
            >
              {" "}
              Note 2: NABL Accredited tests report will be provided under the
              NABL scope and if any standard which is not available in NABL
              scope will be considered as NON-NABL tests.
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6} sx={{ padding: "5px" }}>
            <Typography
              variant={isSmallScreen ? "body2" : "h7"}
              color="red"
              gutterBottom
            >
              {" "}
              Note 3: All compliance tests will be conducted according to the
              sample test guidelines. Charges will be applied on a
              per-iteration, per-sample basis.
            </Typography>
          </Grid>
        </Box>
      </Card>

      <Card sx={{ width: "100%", mt: "10px", mb: "10px", padding: "10px" }}>
        <Box>
          <Typography variant="h5" sx={{ mb: "5px" }}>
            EUT Details
          </Typography>

          <RenderTable
            tableColumns={eutTableColumns}
            tableRows={eutTableRows}
            setTableRows={updateEutTableRows}
            rowTemplate={eutTableRowTemplate}
            deletedIds={deletedEutIds}
            setDeletedIds={setDeletedEutIds}
          />
        </Box>
      </Card>

      <Card sx={{ width: "100%", mt: "10px", mb: "10px", padding: "10px" }}>
        <Box>
          <Typography variant="h5" sx={{ mb: "5px" }}>
            Test Details
          </Typography>

          <RenderTable
            tableColumns={testsTableColumns}
            tableRows={testsTableRows}
            setTableRows={updateTestsTableRows}
            rowTemplate={testsTableRowTemplate}
            deletedIds={deletedTestIds}
            setDeletedIds={setDeletedTestIds}
          />
        </Box>
      </Card>
    </>
  );
}
