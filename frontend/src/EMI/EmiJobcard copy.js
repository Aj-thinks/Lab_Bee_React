import React, { useState } from "react";
import {
  Box,
  Table,
  TableContainer,
  TableHead,
  TextField,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Grid,
  Divider,
  Typography,
  Card,
  FormControl,
  FormLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

export default function EmiJobcard() {
  const [formData, setFormData] = useState({
    company: "",
    address: "",
    person: "",
    mobile: "",
    email: "",
    typeOfRequest: "",
    typeOfSlot: "",
    sampleCondition: "",
    eutName: "",
    modelNo: "",
    serialNo: "",
    eutQuantity: "",
    eutSector: "",
    eutWeight: "",
    eutDimensions: "",
  });

  const typeOfRequestOptions = [
    { value: "Testing of Components", label: "Testing of Components" },
    { value: "Equipment", label: "Equipment" },
    { value: "System", label: "System" },
  ];

  const typeOfSlotOptions = [
    { value: "4 Hours", label: "4 Hours" },
    { value: "8 Hours", label: "8 Hours" },
  ];

  const sampleConditionOptions = [
    { value: "Good", label: "Good" },
    { value: "Others", label: "Others" },
  ];

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Data Submitted: ", formData);
    // Here you can handle the form data, like sending it to a server
  };

  const handleCancelCTRForm = () => {
    setFormData({
      jcOpenedDate: "",
      itemReceivedDate: "",
      company: "",
      address: "",
      person: "",
      mobile: "",
      email: "",
      typeOfRequest: "",
      sampleCondition: "",
      typeOfSlot: "",
      eutName: "",
      modelNo: "",
      serialNo: "",
      eutQuantity: "",
      eutSector: "",
      eutWeight: "",
      eutDimensions: "",
    });
  };

  const handleJcOpenedDateChange = (newDate) => {};

  const handleItemReceivedDateChange = (newDate) => {};

  const handleChangeTypeOfRequest = (event) => {};

  const handleChangeSlotOptions = () => {};

  const handleChangeSampleCondition = () => {};

  return (
    <>
      <Grid
        item
        xs={12}
        md={12}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: { xs: "center", md: "center" },
          mb: 1,
        }}
      >
        <Box sx={{ width: "100%" }}>
          <Divider>
            <Typography variant="h4" sx={{ color: "#003366" }}>
              {" "}
              EMI-EMC Job-Card
            </Typography>
          </Divider>
        </Box>
      </Grid>

      <form onSubmit={handleSubmit}>
        <Box sx={{ borderRadius: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="JC Opened Date"
                  variant="outlined"
                  value={
                    formData.jcOpenedDate ? dayjs(formData.jcOpenedDate) : null
                  }
                  onChange={handleJcOpenedDateChange}
                  renderInput={(props) => <TextField {...props} fullWidth />}
                  format="YYYY-MM-DD"
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Item Received Date"
                  variant="outlined"
                  value={
                    formData.itemReceivedDate
                      ? dayjs(formData.itemReceivedDate)
                      : null
                  }
                  onChange={handleItemReceivedDateChange}
                  renderInput={(props) => <TextField {...props} fullWidth />}
                  format="YYYY-MM-DD"
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                id="company"
                label="Company Name"
                variant="outlined"
                onChange={handleChange}
                value={formData.company}
                sx={{ width: "100%", borderRadius: 3 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                id="address"
                label="Company Address"
                multiline
                rows={2}
                variant="outlined"
                onChange={handleChange}
                value={formData.address}
                sx={{ width: "100%", borderRadius: 3 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                id="person"
                label="Contact Person"
                variant="outlined"
                onChange={handleChange}
                value={formData.person}
                sx={{ width: "100%", borderRadius: 3 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                id="mobile"
                label="Contact Number"
                variant="outlined"
                onChange={handleChange}
                value={formData.mobile}
                sx={{ width: "100%", borderRadius: 3 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                id="email"
                label="Contact Email"
                variant="outlined"
                onChange={handleChange}
                value={formData.email}
                sx={{ width: "100%", borderRadius: 3 }}
              />
            </Grid>
          </Grid>
        </Box>

        <Box>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl sx={{ width: "100%" }}>
              <FormLabel component="row">Type of Request</FormLabel>
              <Select value={formData.typeOfRequest} onChange={handleChange}>
                {typeOfRequestOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <FormControl sx={{ width: "100%" }}>
              <FormLabel component="row">Sample Condition</FormLabel>
              <Select value={formData.sampleCondition} onChange={handleChange}>
                {sampleConditionOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <FormControl sx={{ width: "100%" }}>
              <FormLabel component="row">Slot Type</FormLabel>
              <Select value={formData.typeOfSlot} onChange={handleChange}>
                {typeOfSlotOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Box>

        {/* <Box sx={{ width: "100%", mt: 2 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>EUT Name</TableCell>
                  <TableCell>Model No</TableCell>
                  <TableCell>Serial No</TableCell>
                  <TableCell>EUT Quantity</TableCell>
                  <TableCell>EUT Used-Sector</TableCell>
                  <TableCell>EUT Weight(Kgs)</TableCell>
                  <TableCell>EUT Dimensions(mm)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>
                    <TextField
                      id="eutName"
                      variant="outlined"
                      onChange={handleChange}
                      value={formData.eutName}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      id="modelNo"
                      variant="outlined"
                      onChange={handleChange}
                      value={formData.modelNo}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      id="serialNo"
                      variant="outlined"
                      onChange={handleChange}
                      value={formData.serialNo}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      id="eutQuantity"
                      variant="outlined"
                      onChange={handleChange}
                      value={formData.eutQuantity}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      id="eutSector"
                      variant="outlined"
                      onChange={handleChange}
                      value={formData.eutSector}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      id="eutWeight"
                      variant="outlined"
                      onChange={handleChange}
                      value={formData.eutWeight}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      id="eutDimensions"
                      variant="outlined"
                      onChange={handleChange}
                      value={formData.eutDimensions}
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box> */}

        <Box sx={{ mt: 2 }}>
          <Button type="submit" variant="contained" color="primary">
            Submit
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleCancelCTRForm}
          >
            Cancel
          </Button>
        </Box>
      </form>
    </>
  );
}
