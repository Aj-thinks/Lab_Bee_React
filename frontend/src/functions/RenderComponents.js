import {
  Box,
  FormControlLabel,
  FormLabel,
  MenuItem,
  Radio,
  RadioGroup,
  TextField,
} from "@mui/material";
import React from "react";
import { Controller } from "react-hook-form";
import { DatePicker, TimePicker } from "@mui/x-date-pickers";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { UserContext } from "../Pages/UserContext";
import SignaturePadComponent from "../common/SignaturePad";

export default function RenderComponents({
  fields,
  register,
  control,
  watch,
  setValue,
}) {
  return (
    <>
      {fields.map((field) => {
        const fieldWidth = field.width || "100%"; // Default to full width if no width specified

        switch (field.type) {
          case "textField":
          case "tel":
            return (
              <TextField
                key={field.name}
                label={field.label}
                name={field.name}
                {...register(field.name)}
                fullWidth
                sx={{ mb: "10px", width: fieldWidth }}
              />
            );

          case "textArea":
            return (
              <TextField
                key={field.name}
                label={field.label}
                multiline
                rows={2}
                placeholder={field.label}
                name={field.name}
                {...register(field.name)}
                fullWidth
                sx={{ mb: "10px", width: fieldWidth }}
              />
            );

          case "datePicker":
            return (
              <Controller
                key={field.name}
                name={field.name}
                control={control}
                render={({ field: { onChange, value } }) => (
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label={field.label}
                      value={value}
                      onChange={onChange}
                      fullWidth
                      sx={{ mb: "10px", width: fieldWidth }}
                      renderInput={(params) => <TextField {...params} />}
                      format="YYYY-MM-DD"
                    />
                  </LocalizationProvider>
                )}
              />
            );

          case "dateTimePicker":
            return (
              <Controller
                key={field.name}
                name={field.name}
                control={control}
                render={({ field: { onChange, value } }) => (
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DateTimePicker
                      label={field.label}
                      value={value}
                      onChange={onChange}
                      sx={{ mb: "10px", width: fieldWidth }}
                      fullWidth
                      renderInput={(params) => <TextField {...params} />}
                      format="YYYY-MM-DD HH:mm"
                    />
                  </LocalizationProvider>
                )}
              />
            );

          case "timePicker":
            return (
              <Controller
                key={field.name}
                name={field.name}
                control={control}
                render={({ field: { onChange, value } }) => (
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <TimePicker
                      label={field.label}
                      value={value}
                      onChange={onChange}
                      sx={{ mb: "10px", width: fieldWidth }}
                      fullWidth
                      renderInput={(params) => <TextField {...params} />}
                      format="YYYY-MM-DD HH:mm"
                    />
                  </LocalizationProvider>
                )}
              />
            );

          case "select":
            const selectedValue = watch(field.name); // Watch the value of the select field
            return (
              <TextField
                key={field.name}
                name={field.name}
                select
                label={field.label}
                value={selectedValue || ""} // Set the value to the watched value
                onChange={(e) => setValue(field.name, e.target.value)} // Set the value when the selection changes
                fullWidth
                sx={{ mb: "10px", width: fieldWidth }}
              >
                {/* {field.options.map((option) => (
                  <MenuItem key={option.id} value={option.id}>
                    {option.label}
                  </MenuItem>
                ))} */}

                {Array.isArray(field.options) &&
                  field.options.map((option) => {
                    if (typeof option === "string") {
                      // For flat list of strings
                      return (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      );
                    } else {
                      // For object-based options (with id and label)
                      return (
                        <MenuItem
                          key={option.id ? option.id : option.label}
                          value={option.id ? option.id : option.value}
                        >
                          {option.label}
                        </MenuItem>
                      );
                    }
                  })}
              </TextField>
            );

          case "radio":
            return (
              <Box key={field.name} mt="10px">
                <FormLabel component="legend">{field.label}</FormLabel>
                <RadioGroup
                  row
                  aria-label={field.label}
                  name={field.name}
                  {...register(field.name)}
                  fullWidth
                  sx={{ mb: "10px", width: fieldWidth }}
                >
                  {field.options.map((option) => (
                    <FormControlLabel
                      key={option}
                      value={option}
                      control={<Radio />}
                      label={option}
                    />
                  ))}
                </RadioGroup>
              </Box>
            );

          case "signaturePad":
            return (
              <div key={field.name} style={{ width: field.width }}>
                <SignaturePadComponent />
              </div>
            );

          default:
            return null;
        }
      })}
    </>
  );
}