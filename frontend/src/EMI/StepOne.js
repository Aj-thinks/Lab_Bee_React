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

export default function EMI_JC_StepOne() {
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

  return <div>EMI_JC_StepOne</div>;
}
