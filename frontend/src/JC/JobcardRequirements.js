import { Box, Grid, Typography } from "@mui/material";
import React from "react";
import AddTestsList from "../Pages/AddTestsList";
import AddReliabilityTasks from "../Pages/AddReliabilityTasks";

export default function JobcardRequirements() {
  return (
    <>
      <Typography variant="h4"> Job Card Requirements</Typography>
      <br />
      {/* <AddTestsList /> */}
      <AddReliabilityTasks />
    </>
  );
}
