import React, { useContext, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { toast } from "react-toastify";
import { serverBaseAddress } from "../Pages/APIPage";
import { UserContext } from "../Pages/UserContext";
import axios from "axios";

export default function CreateCTRF() {
  const [companyId, setCompanyId] = useState("");
  const [ctrfReferanceID, setCtrfReferanceID] = useState("");
  const [ctrfLinkToBeShared, setCtrfLinkToBeShared] = useState("");
  const [openCtrfDialog, setOpenCtrfDialog] = useState(false);

  const { loggedInUser, loggedInUserDepartment } = useContext(UserContext);

  const handleSubmitNewCTRF = (e) => {
    e.preventDefault();

    if (companyId === "" || companyId === null) {
      toast.error("Company ID cannot be empty");
      return;
    }

    const enteredCompanyId = companyId.toUpperCase().slice(0, 6);
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear().toString().slice(-2);
    const currentMonth = (currentDate.getMonth() + 1)
      .toString()
      .padStart(2, "0");
    const currentDay = currentDate.getDate().toString().padStart(2, "0");
    const currentHour = currentDate.getHours().toString().padStart(2, "0");
    const currentMinute = currentDate.getMinutes().toString().padStart(2, "0");
    const currentSecond = currentDate.getSeconds().toString().padStart(2, "0");

    const currentTimeStamp = `${currentHour}${currentMinute}${currentSecond}`;
    const formattedCTRFId = `CTRF${currentYear}${currentMonth}${currentDay}${currentTimeStamp}${enteredCompanyId}`;

    if (formattedCTRFId) {
      axios.post(`${serverBaseAddress}/api/add-ctrf`, {
        enteredCompanyId,
        formattedCTRFId,
        loggedInUser,
      });

      toast.success(`CTRF created successfully. ${formattedCTRFId}`);
      setCtrfReferanceID(formattedCTRFId);
      // setCtrfLinkToBeShared(
      //   `https://labbee.beanalytic.com/emi_jobcard/${formattedCTRFId}`
      // );
      // setCtrfLinkToBeShared(
      //   `http://localhost:3000/emi_jobcard/${formattedCTRFId}`
      // );
    }
  };

  const handleOpenCtrfDialog = () => {
    setOpenCtrfDialog(true);
  };

  const closeCtrfDialog = () => {
    setCompanyId("");
    setCtrfReferanceID("");
    setCtrfLinkToBeShared("");
    setOpenCtrfDialog(false);
  };

  return (
    <>
      <Divider>
        <Typography variant="h4" sx={{ color: "#003366" }}>
          Customer Test Request Form(CTRF)
        </Typography>
      </Divider>

      <Box
        sx={{
          display: "flex",
          justifyContent: { xs: "center", md: "flex-end" },
          alignItems: "center",
          mt: { xs: 2, md: 0 },
        }}
      >
        <Button
          sx={{
            borderRadius: 1,
            bgcolor: "orange",
            color: "white",
            borderColor: "black",
            padding: { xs: "8px 16px", md: "6px 12px" }, // Adjust padding for different screen sizes
            fontSize: { xs: "0.875rem", md: "1rem" }, // Adjust font size for different screen sizes
          }}
          variant="contained"
          color="primary"
          onClick={handleOpenCtrfDialog}
        >
          Create new CTRF
        </Button>
      </Box>

      <Grid container justifyContent="center" alignItems="center">
        <Dialog
          open={openCtrfDialog}
          onClose={closeCtrfDialog}
          fullWidth
          maxWidth="sm"
          sx={{
            borderRadius: 3,
            backgroundColor:
              "linear-gradient(to bottom, #66ccff 0%, #ccccff 100%)",
          }}
        >
          <DialogTitle variant="h5" align="center" sx={{ pb: 1 }}>
            Create CTRF
          </DialogTitle>
          <DialogContent>
            <form onSubmit={handleSubmitNewCTRF}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Company Name/ID"
                    variant="outlined"
                    value={companyId}
                    fullWidth
                    onChange={(e) => setCompanyId(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Stack
                    spacing={2}
                    direction="row"
                    sx={{ mt: 1 }}
                    justifyContent="center"
                  >
                    <Button type="submit" variant="contained" color="primary">
                      SUBMIT
                    </Button>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={closeCtrfDialog}
                    >
                      CANCEL
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </form>

            {ctrfReferanceID && (
              <Grid item xs={12}>
                <Typography
                  align="center"
                  color="#003366"
                  underline="hover"
                  sx={{ mt: 2 }}
                >
                  CTRF Referance ID: {ctrfReferanceID}
                </Typography>
              </Grid>
            )}

            {ctrfLinkToBeShared && (
              <Grid item xs={12}>
                <Typography
                  //   variant="h6"
                  align="center"
                  color="#6600ff"
                  underline="hover"
                  sx={{ mt: 2 }}
                >
                  CTRF Link: {ctrfLinkToBeShared}
                </Typography>
              </Grid>
            )}
          </DialogContent>
        </Dialog>
      </Grid>
    </>
  );
}
