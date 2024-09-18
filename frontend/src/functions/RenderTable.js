import React from "react";

import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TextField,
  IconButton,
  Select,
  MenuItem,
  TableContainer,
  Box,
  Button,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { DateTimePicker, TimePicker } from "@mui/x-date-pickers";
import { DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

//Working fine:
// const RenderTable = ({
//   tableColumns,
//   tableRows,
//   setTableRows,
//   rowTemplate, // Default template to add a new row
// }) => {
//   // Function to add a new row
//   const addTableRow = () => {
//     setTableRows([...tableRows, rowTemplate]); // Add a new empty row based on the row template
//   };

//   // Function to remove a row
//   const removeTableRow = (index) => {
//     const updatedRows = tableRows.filter((_, i) => i !== index);
//     setTableRows(updatedRows);
//   };

//   // Function to handle input changes in the table rows
//   const handleInputChange = (index, field, value) => {
//     const updatedRows = [...tableRows];
//     updatedRows[index][field] = value;
//     setTableRows(updatedRows);
//   };

//   // Function to handle "Observation Form" changes
//   const handleObservationFormChange = (index, value) => {
//     // Call the function to open a dialog or perform any other action
//     alert(`Observation Form changed to: ${value}`);
//     // Example: Open a dialog or perform some logic here
//     // openDialogFunction(value);

//     // Update the state for the specific field
//     handleInputChange(index, "observationForm", value);
//   };

//   const tableHeaderStyle = { backgroundColor: "#006699", fontWeight: "bold" };
//   const tableCellStyle = {
//     color: "white",
//     minWidth: "150px", // Adjust as needed
//     padding: "8px",
//   };
//   const tableContainerStyle = {
//     overflowX: "auto", // Enable horizontal scrolling
//   };

//   return (
//     <TableContainer sx={tableContainerStyle}>
//       <Table size="small">
//         <TableHead sx={tableHeaderStyle}>
//           <TableRow>
//             {tableColumns.map((column) => (
//               <TableCell
//                 key={column.id}
//                 width={column.width}
//                 align={column.align || "center"}
//                 style={tableCellStyle}
//               >
//                 {column.label}
//               </TableCell>
//             ))}
//             <TableCell>
//               <IconButton onClick={addTableRow}>
//                 <AddIcon sx={{ color: "white" }} size="small" />
//               </IconButton>
//             </TableCell>
//           </TableRow>
//         </TableHead>
//         <TableBody>
//           {tableRows.map((row, rowIndex) => (
//             <TableRow key={rowIndex}>
//               {tableColumns.map((column) => (
//                 <TableCell
//                   key={column.id}
//                   width={column.width}
//                   align={column.align || "center"}
//                 >
//                   {column.id === "serialNumber" ? (
//                     rowIndex + 1
//                   ) : column.type === "textField" ? (
//                     <TextField
//                       value={row[column.id]}
//                       onChange={(e) =>
//                         handleInputChange(rowIndex, column.id, e.target.value)
//                       }
//                       fullWidth
//                     />
//                   ) : column.type === "number" ? (
//                     <TextField
//                       type="number"
//                       value={row[column.id]}
//                       onChange={(e) =>
//                         handleInputChange(rowIndex, column.id, e.target.value)
//                       }
//                       fullWidth
//                     />
//                   ) : column.type === "select" ? (
//                     <Select
//                       value={row[column.id]}
//                       // onChange={(e) =>
//                       //   handleInputChange(rowIndex, column.id, e.target.value)
//                       // }

//                       onChange={(e) =>
//                         column.id === "observationForm"
//                           ? handleObservationFormChange(
//                               rowIndex,
//                               e.target.value
//                             )
//                           : handleInputChange(
//                               rowIndex,
//                               column.id,
//                               e.target.value
//                             )
//                       }
//                       fullWidth
//                     >
//                       {Array.isArray(column.options) &&
//                         column.options.map((option) => {
//                           if (typeof option === "string") {
//                             // For flat list of strings
//                             return (
//                               <MenuItem key={option} value={option}>
//                                 {option}
//                               </MenuItem>
//                             );
//                           } else {
//                             // For object-based options (with id and label)
//                             return (
//                               <MenuItem
//                                 key={option.id ? option.id : option.label}
//                                 value={option.id ? option.id : option.value}
//                               >
//                                 {option.label}
//                               </MenuItem>
//                             );
//                           }
//                         })}
//                     </Select>
//                   ) : column.type === "dateTime" ? (
//                     <LocalizationProvider dateAdapter={AdapterDayjs}>
//                       <DateTimePicker
//                         value={row[column.id] || null} // Ensure it's initialized properly
//                         onChange={(newValue) =>
//                           handleInputChange(rowIndex, column.id, newValue)
//                         }
//                         fullWidth
//                         renderInput={(props) => (
//                           <TextField {...props} fullWidth />
//                         )}
//                       />
//                     </LocalizationProvider>
//                   ) : column.type === "date" ? (
//                     <LocalizationProvider dateAdapter={AdapterDayjs}>
//                       <DatePicker
//                         value={row[column.id] || null} // Ensure it's initialized properly
//                         onChange={(newValue) =>
//                           handleInputChange(rowIndex, column.id, newValue)
//                         }
//                         renderInput={(props) => (
//                           <TextField {...props} fullWidth />
//                         )}
//                       />
//                     </LocalizationProvider>
//                   ) : column.type === "time" ? (
//                     <LocalizationProvider dateAdapter={AdapterDayjs}>
//                       <TimePicker
//                         value={row[column.id] || null}
//                         onChange={(newValue) =>
//                           handleInputChange(rowIndex, column.id, newValue)
//                         }
//                         renderInput={(props) => (
//                           <TextField {...props} fullWidth />
//                         )}
//                       />
//                     </LocalizationProvider>
//                   ) : (
//                     ""
//                   )}
//                 </TableCell>
//               ))}
//               <TableCell>
//                 <IconButton
//                   onClick={() => removeTableRow(rowIndex)}
//                   disabled={tableRows.length === 1}
//                 >
//                   <RemoveIcon />
//                 </IconButton>
//               </TableCell>
//             </TableRow>
//           ))}
//         </TableBody>
//       </Table>
//       <Box display="flex" justifyContent="flex-start">
//         <Button
//           variant="outlined"
//           onClick={addTableRow}
//           sx={{
//             mt: "2px",
//             mb: "2px",
//             ml: "2px",
//             mr: "2px",
//             minWidth: "120px",
//             textAlign: "center",
//           }}
//         >
//           Add Row
//         </Button>
//       </Box>
//     </TableContainer>
//   );
// };

// export default RenderTable;

///////////////////////////////////////////////////////////////////////////////////////////////////////
const RenderTable = ({
  tableColumns,
  tableRows,
  setTableRows,
  rowTemplate, // Default template to add a new row
  deletedRowIds, // Array of IDs of deleted rows
  setDeletedRowIds, // Function to update deleted row IDs
  rowIdField, // Field name that holds the unique ID of the row
}) => {
  // Function to add a new row
  const addTableRow = () => {
    setTableRows([...tableRows, { ...rowTemplate, [rowIdField]: Date.now() }]); // Add a new empty row based on the row template and assign a unique ID
  };

  // Function to remove a row
  const removeTableRow = (index) => {
    const rowId = tableRows[index][rowIdField];
    const updatedRows = tableRows.filter((_, i) => i !== index);
    setTableRows(updatedRows);

    if (rowId) {
      setDeletedRowIds((prev) => [...prev, rowId]); // Track the deleted row ID
    }
  };

  // Function to handle input changes in the table rows
  const handleInputChange = (index, field, value) => {
    const updatedRows = [...tableRows];
    updatedRows[index][field] = value;
    setTableRows(updatedRows);
  };

  // Function to handle "Observation Form" changes
  const handleObservationFormChange = (index, value) => {
    handleInputChange(index, "observationForm", value);
  };

  const tableHeaderStyle = { backgroundColor: "#006699", fontWeight: "bold" };
  const tableCellStyle = {
    color: "white",
    minWidth: "150px", // Adjust as needed
    padding: "8px",
  };
  const tableContainerStyle = {
    overflowX: "auto", // Enable horizontal scrolling
  };

  return (
    <TableContainer sx={tableContainerStyle}>
      <Table size="small">
        <TableHead sx={tableHeaderStyle}>
          <TableRow>
            {tableColumns.map((column) => (
              <TableCell
                key={column.id}
                width={column.width}
                align={column.align || "center"}
                style={tableCellStyle}
              >
                {column.label}
              </TableCell>
            ))}
            <TableCell>
              <IconButton onClick={addTableRow}>
                <AddIcon sx={{ color: "white" }} size="small" />
              </IconButton>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tableRows.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {tableColumns.map((column) => (
                <TableCell
                  key={column.id}
                  width={column.width}
                  align={column.align || "center"}
                >
                  {column.id === "serialNumber" ? (
                    rowIndex + 1
                  ) : column.type === "textField" ? (
                    <TextField
                      value={row[column.id]}
                      onChange={(e) =>
                        handleInputChange(rowIndex, column.id, e.target.value)
                      }
                      fullWidth
                    />
                  ) : column.type === "number" ? (
                    <TextField
                      type="number"
                      value={row[column.id]}
                      onChange={(e) =>
                        handleInputChange(rowIndex, column.id, e.target.value)
                      }
                      fullWidth
                    />
                  ) : column.type === "select" ? (
                    <Select
                      value={row[column.id]}
                      onChange={(e) =>
                        column.id === "observationForm"
                          ? handleObservationFormChange(
                              rowIndex,
                              e.target.value
                            )
                          : handleInputChange(
                              rowIndex,
                              column.id,
                              e.target.value
                            )
                      }
                      fullWidth
                    >
                      {Array.isArray(column.options) &&
                        column.options.map((option) => {
                          if (typeof option === "string") {
                            return (
                              <MenuItem key={option} value={option}>
                                {option}
                              </MenuItem>
                            );
                          } else {
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
                    </Select>
                  ) : column.type === "dateTime" ? (
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DateTimePicker
                        value={row[column.id] || null}
                        onChange={(newValue) =>
                          handleInputChange(rowIndex, column.id, newValue)
                        }
                        fullWidth
                        renderInput={(props) => (
                          <TextField {...props} fullWidth />
                        )}
                      />
                    </LocalizationProvider>
                  ) : column.type === "date" ? (
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        value={row[column.id] || null}
                        onChange={(newValue) =>
                          handleInputChange(rowIndex, column.id, newValue)
                        }
                        renderInput={(props) => (
                          <TextField {...props} fullWidth />
                        )}
                      />
                    </LocalizationProvider>
                  ) : column.type === "time" ? (
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <TimePicker
                        value={row[column.id] || null}
                        onChange={(newValue) =>
                          handleInputChange(rowIndex, column.id, newValue)
                        }
                        renderInput={(props) => (
                          <TextField {...props} fullWidth />
                        )}
                      />
                    </LocalizationProvider>
                  ) : (
                    ""
                  )}
                </TableCell>
              ))}
              <TableCell>
                <IconButton
                  onClick={() => removeTableRow(rowIndex)}
                  disabled={tableRows.length === 1}
                >
                  <RemoveIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Box display="flex" justifyContent="flex-start">
        <Button
          variant="outlined"
          onClick={addTableRow}
          sx={{
            mt: "2px",
            mb: "2px",
            ml: "2px",
            mr: "2px",
            minWidth: "120px",
            textAlign: "center",
          }}
        >
          Add Row
        </Button>
      </Box>
    </TableContainer>
  );
};

export default RenderTable;
