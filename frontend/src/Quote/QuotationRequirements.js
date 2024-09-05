// In this page we are importing all the necessary components which are require to create or make a quotation such as 'Customer/Company details', 'Item soft modules', So that all the necessary components will be available in a single page

import React, { useContext } from "react";
import AddCustomerDetails from "./AddCustomerDetails";
import AddModulesAndTests from "./AddModulesAndTests";
import { Box, Card, Divider, Grid, Typography } from "@mui/material";
import { UserContext } from "../Pages/UserContext";

export default function QuotationRequirements() {
  const { loggedInUser, loggedInUserDepartment } = useContext(UserContext);

  return (
    <>
      <Typography variant="h4" sx={{ color: "#003366", mb: "10px" }}>
        {" "}
        Quotation Requirements{" "}
      </Typography>
      <Card sx={{ width: "100%", padding: "20px" }}>
        <AddCustomerDetails />
      </Card>
      <br />
      <Card sx={{ width: "100%", padding: "20px" }}>
        {loggedInUserDepartment !== "Marketing" && <AddModulesAndTests />}
      </Card>
    </>
  );
}
