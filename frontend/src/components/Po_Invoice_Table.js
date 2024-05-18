import React, { useEffect, useState } from 'react'

import {
  Autocomplete,
  Box,
  Card,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography
} from '@mui/material'
import { serverBaseAddress } from '../Pages/APIPage';
import axios from 'axios';
import { toast } from 'react-toastify';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import moment from 'moment';
import { getCurrentMonthYear, getFinancialYear } from '../functions/UtilityFunctions';
import ConfirmationDialog from './ConfirmationDialog';
import SearchBar from './SearchBar';
import DateRangeFilter from './DateRangeFilter';
import { CreatePieChart, CreateBarChart } from '../functions/DashboardFunctions';

import { DataGrid, GridColumns } from '@mui/x-data-grid';
import HomeCharts from '../Pages/HomeCharts';



export default function PoInvoiceStatusTable({ newJcAdded, openDialog, setOpenDialog, onRowClick }) {


  const [poDataList, setPoDataList] = useState([])
  const [originalPoDataList, setOriginalPoDataList] = useState([]);
  const [page, setPage] = useState(0);                          //To setup pages of the table
  const [rowsPerPage, setRowsPerPage] = useState(10);            //To show the number of rows per page

  const [filterRow, setFilterRow] = useState([]);               //To filter out the table based on search
  const [refresh, setRefresh] = useState(false)

  const [poMonthYear, setPoMonthYear] = useState(getCurrentMonthYear())
  const [monthYearList, setMonthYearList] = useState([])

  const [financialYear, setFinancialYear] = useState(getFinancialYear())
  const [financialYearList, setFinancialYearList] = useState([])

  const [poDataForChart, setPoDataForChart] = useState('')


  const [openDeleteDataDialog, setOpenDeleteDataDialog] = useState(false);
  const [selectedItemForDeletion, setSelectedItemForDeletion] = useState(null);


  // Custom style for the table header
  const tableHeaderStyle = { backgroundColor: '#668799', fontWeight: 'extra-bold' }

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Calibration due label for the KPI
  const currentMonthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(currentDate);
  const currentYearAndMonth = `${currentMonthName}-${currentYear}`;


  useEffect(() => {

    let requiredAPIdata = {
      _fields: 'jc_number, jc_month, jc_category, rfq_number, rfq_value, po_number, po_value, po_status, invoice_number, invoice_value, invoice_status, status, remarks',
      monthYear: poMonthYear,
    }

    const urlParameters = new URLSearchParams(requiredAPIdata).toString()


    if (filterRow.length > 0) {
      setFilterRow(filterRow)
    } else {

      const getPoAndInvoiceList = async () => {
        try {
          const response = await axios.get(`${serverBaseAddress}/api/getPoInvoiceDataList?` + urlParameters);
          if (response.status === 200) {
            setPoDataList(response.data);
            setOriginalPoDataList(response.data)
          } else {
            console.error('Failed to fetch PO Month list. Status:', response.status);
          }
        } catch (error) {
          console.error('Failed to fetch the data', error);
        }
      }
      getPoAndInvoiceList()
    }
  }, [newJcAdded, poMonthYear, filterRow, refresh])


  useEffect(() => {
    const getMonthYearListOfPO = async () => {
      try {
        const response = await axios.get(`${serverBaseAddress}/api/getPoDataYearMonth`);
        if (response.status === 200) {
          setMonthYearList(response.data);
          // setFinancialYearList(response.data)
          // console.log('fin is', financialYear)
        } else {
          console.error('Failed to fetch PO Month list. Status:', response.status);
        }
      } catch (error) {
        console.error('Failed to fetch the data', error);
      }
    }
    getMonthYearListOfPO()



    const getFinancialYearListOfPO = async () => {
      try {
        const response = await axios.get(`${serverBaseAddress}/api/getPoDataFinancialYear`);
        if (response.status === 200) {
          setFinancialYearList(response.data)
        } else {
          console.error('Failed to fetch PO Month list. Status:', response.status);
        }
      } catch (error) {
        console.error('Failed to fetch the data', error);
      }
    }
    getFinancialYearListOfPO()



  }, [poMonthYear, monthYearList])


  //////////////////////////////////////////////////////////////////////////////
  // Data fetching to plot the charts:

  const getDataForPOPieChart = async () => {
    try {
      const poStatusResponse = await axios.get(`${serverBaseAddress}/api/getPoStatusData/${poMonthYear}`);
      if (poStatusResponse.status === 200) {

        const poData = poStatusResponse.data[0]; // Access the first element of the response array
        // console.log('Response data:', poData);
        setPoDataForChart({
          receivedPoCount: poData.receivedPoCount,
          notReceivedPoCount: poData.notReceivedPoCount,
          receivedPoSum: poData.receivedPoSum,
          notReceivedPoSum: poData.notReceivedPoSum,

          invoiceSentCount: poData.invoiceSentCount,
          invoiceNotSentCount: poData.invoiceNotSentCount,
          invoiceSentSum: poData.invoiceSentSum,
          invoiceNotSentSum: poData.invoiceNotSentSum,

          paymentReceivedCount: poData.paymentReceivedCount,
          paymentNotReceivedCount: poData.paymentNotReceivedCount,
          paymentOnHoldCount: poData.paymentOnHoldCount,
          paymentOnHoldSum: poData.paymentOnHoldSum



        });

      } else {
        console.error('Failed to fetch PO data for chart. Status:', poStatusResponse.status);
      }
    } catch (error) {
      console.error('Failed to fetch the PO data', error);
    }
  };

  getDataForPOPieChart();

  // Creating a pie chart for calibration status for chambers and equipments:
  const poStatusPieChart = {
    labels: ['PO Received', 'PO Not Received'],
    datasets: [{
      data: [poDataForChart.receivedPoCount, poDataForChart.notReceivedPoCount],
      backgroundColor: ['#8cd9b3', '#ff6666'],
    }],
  }

  const optionsForPoStatusPieChart = {
    responsive: true,
    // maintainAspectRatio: false,   // False will keep the size small. If it's true then we can define the size using aspectRatio
    aspectRatio: 2.5,
    plugins: {
      legend: {
        position: 'top',
        display: true,
      },
      title: {
        display: true,
        text: 'PO Status',
        font: {
          family: 'Helvetica Neue',
          size: 30,
          weight: 'bold'
        }
      },
      subtitle: {
        display: true,
        text: 'Monthly Received & Not Received PO',
        font: {
          family: 'Arial',
          size: 15,
          weight: 'bold'
        }
      },
      datalabels: {
        display: true,
        color: 'black',
        fontWeight: 'bold',
        font: {
          family: 'Arial',
          size: 15,
          weight: 'bold'
        }
      }
    }
  }

  const invoiceStatusPieChart = {
    labels: ['Invoice Sent', 'Invoice Not Sent'],
    datasets: [{
      data: [poDataForChart.invoiceSentCount, poDataForChart.invoiceNotSentCount],
      backgroundColor: ['#8cd9b3', '#ff6666'],
    }],
  }

  const optionsForInvoiceStatusPieChart = {
    responsive: true,
    // maintainAspectRatio: false,   // False will keep the size small. If it's true then we can define the size using aspectRatio
    aspectRatio: 2.5,
    plugins: {
      legend: {
        position: 'top',
        display: true,
      },
      title: {
        display: true,
        text: 'Invoice Status',
        font: {
          family: 'Helvetica Neue',
          size: 30,
          weight: 'bold'
        }
      },
      subtitle: {
        display: true,
        text: 'Monthly Sent & Not Sent Invoices',
        font: {
          family: 'Arial',
          size: 15,
          weight: 'bold'
        }
      },
      datalabels: {
        display: true,
        color: 'black',
        fontWeight: 'bold',
        font: {
          family: 'Arial',
          size: 15,
          weight: 'bold'
        }
      }
    }
  }


  const paymentStatusPieChart = {
    labels: ['Payment Received', 'Payment Not Received', 'Payment on Hold'],
    datasets: [{
      data: [poDataForChart.paymentReceivedCount, poDataForChart.paymentNotReceivedCount, poDataForChart.paymentOnHoldCount],
      backgroundColor: ['#8cd9b3', '#ff6666', '#668799'],
    }],
  }

  const optionsForPaymentStatusPieChart = {
    responsive: true,
    // maintainAspectRatio: false,   // False will keep the size small. If it's true then we can define the size using aspectRatio
    aspectRatio: 2.5,
    plugins: {
      legend: {
        position: 'top',
        display: true,
      },
      title: {
        display: true,
        text: 'Payment Status',
        font: {
          family: 'Helvetica Neue',
          size: 30,
          weight: 'bold'
        }
      },
      subtitle: {
        display: true,
        text: 'Monthly Recieved and Pending Payment Status',
        font: {
          family: 'Arial',
          size: 15,
          weight: 'bold'
        }
      },
      datalabels: {
        display: true,
        color: 'black',
        fontWeight: 'bold',
        font: {
          family: 'Arial',
          size: 15,
          weight: 'bold'
        }
      }
    }
  }



  const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];



  const monthWisePoCount = {
    labels,
    datasets: [
      {
        label: 'Dataset 1',
        // data: labels.map(() => faker.datatype.number({ min: 0, max: 1000 })),
        data: [10, 25, 15, 14, 75, 45, 60],
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
      // {
      //   label: 'Dataset 2',
      //   // data: labels.map(() => faker.datatype.number({ min: 0, max: 1000 })),
      //   data: [20, 35, 18, 27, 60, 90, 30],
      //   backgroundColor: 'rgba(53, 162, 235, 0.5)',
      // },
    ],
  }

  const optionsForMonthWisePoCount = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top'
      },
      title: {
        display: true,
        text: 'Chart.js Bar Chart',
      },
    },
  }


  // // Pie Chart Options for 




  const handleMonthYearOfPo = (event) => {
    setPoMonthYear(event.target.value)
  }


  const handleFinancialYearChange = (event) => {
    setFinancialYear(event.target.value)
  }




  const editSelectedRowData = (item) => {
    setOpenDialog(true)
    onRowClick(item);
  }


  // Function to open the dialog and set the selected item for deletion
  const handleOpenDeleteDataDialog = (e, item) => {
    e.stopPropagation();
    setSelectedItemForDeletion(item);
    setOpenDeleteDataDialog(true);

  }

  // Function to close the dialog
  const handleCloseDeleteDataDialog = () => {
    setOpenDeleteDataDialog(false)
  }

  const handleDeleteData = async () => {

    if (!selectedItemForDeletion) {
      console.error('No item selected for deletion');
      return;
    }

    // USe JavaScript 'encodeURIComponent' to encode the strings with the forward slashes(/)
    const jcNumberToBeDeleted = encodeURIComponent(selectedItemForDeletion.jc_number);

    try {
      const deleteResponse = await axios.delete(`${serverBaseAddress}/api/deletePoData/${jcNumberToBeDeleted}`);

      if (deleteResponse.status === 200) {
        toast.success('PO Data Deleted Successfully');
        setOpenDeleteDataDialog(false)
        setRefresh(!refresh)
      }
    } catch (error) {
      console.error('Failed to delete data:', error);
    }

  }


  // Function to change the page of a table using Tablepagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  };

  // Function to handle or show the rows per page of a table using Tablepagination
  const handleRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value)
    setPage(0)
  };


  // const tableHeadersList = [
  //   { id: 'Sl No', label: 'Sl No' },
  //   { id: 'jcNumber', label: 'JC Number' },
  //   { id: 'jcDate', label: 'JC Date' },
  //   { id: 'jcCategory', label: 'JC Category' },
  //   { id: 'rfqNumber', label: 'RFQ' },
  //   { id: 'rfqValue', label: 'RFQ Value' },
  //   { id: 'poNumber', label: 'PO' },
  //   { id: 'poValue', label: 'PO Value' },
  //   { id: 'poStatus', label: 'PO Status' },
  //   { id: 'invoiceNumber', label: 'Invoice' },
  //   { id: 'invoiceValue', label: 'Invoice Value' },
  //   { id: 'invoiceStatus', label: 'Invoice Status' },
  //   { id: 'status', label: 'Status' },
  //   { id: 'remarks', label: 'Remarks' },
  //   { id: 'actions', label: 'Action' }
  // ]


  //Function for the search bar and to filter the table based on the user search input
  const [searchInputText, setSearchInputText] = useState("")


  const onChangeOfSearchInput = (e) => {
    const searchText = e.target.value.toLowerCase(); // Convert search text to lowercase
    setSearchInputText(searchText);


    const filteredData = originalPoDataList.filter(item => (
      item.jc_number.toLowerCase().includes(searchText) ||
      item.jc_month.toLowerCase().includes(searchText) ||
      item.jc_category.toLowerCase().includes(searchText) ||
      item.rfq_number.toLowerCase().includes(searchText) ||
      item.rfq_value.toLowerCase().includes(searchText) ||
      item.po_number.toLowerCase().includes(searchText) ||
      item.po_value.toLowerCase().includes(searchText) ||
      item.po_status.toLowerCase().includes(searchText) ||
      item.invoice_number.toLowerCase().includes(searchText) ||
      item.invoice_value.toLowerCase().includes(searchText) ||
      item.invoice_status.toLowerCase().includes(searchText) ||
      item.status.toLowerCase().includes(searchText) ||
      item.remarks.toLowerCase().includes(searchText)
    ));

    // Update the poDataList with the filtered data
    setPoDataList(filteredData);
  };


  const onClearSearchInput = () => {
    setSearchInputText("")
    setPoDataList(originalPoDataList);
  }






  // const rows = [
  //   { id: 1, col1: 'Hello', col2: 'World' },
  //   { id: 2, col1: 'DataGridPro', col2: 'is Awesome' },
  //   { id: 3, col1: 'MUI', col2: 'is Amazing' },
  // ];

  const columns = [
    { field: 'id', headerName: 'ID', width: 20 },
    { field: 'jc_number', headerName: 'JC Number', width: 150 },
    { field: 'jc_month', headerName: 'JC Month', width: 150 },
    { field: 'jc_category', headerName: 'JC Category', width: 100 },
    { field: 'rfq_number', headerName: 'RFQ Number', width: 100 },
    { field: 'rfq_value', headerName: 'RFQ Value', width: 100 },
    { field: 'po_number', headerName: 'PO Number', width: 100 },
    { field: 'po_value', headerName: 'PO Value', width: 100 },
    { field: 'po_status', headerName: 'PO Status', width: 150 },
    { field: 'invoice_number', headerName: 'Invoice Number', width: 150 },
    { field: 'invoice_value', headerName: 'Invoice Value', width: 100 },
    { field: 'invoice_status', headerName: 'Invoice Status', width: 150 },
    { field: 'payment_status', headerName: 'Payment Status', width: 150 },
    { field: 'remarks', headerName: 'Remarks', width: 100 },
  ];


  const [selectedDateRange, setSelectedDateRange] = useState(null);

  const handleDateRangeChange = (selectedDateRange) => {
    setSelectedDateRange(selectedDateRange);
  };

  const handleDateRangeClear = () => {
    setSelectedDateRange(null);
  }


  return (
    <>

      <Grid container spacing={2} alignItems="center">
        {/* Container for FormControl and DateRangeFilter aligned to the left */}
        <Grid item xs={8} container alignItems="center">
          <Grid item sx={{ mr: 2 }}>
            <FormControl sx={{ width: '200px' }}>
              <InputLabel>Select Month-Year</InputLabel>
              <Select
                label="Month-Year"
                type="text"
                value={poMonthYear}
                onChange={handleMonthYearOfPo}
              >
                {monthYearList.map((item, index) => (
                  <MenuItem key={index} value={item}>{item}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item >
            <DateRangeFilter
              onClickDateRangeSelectDoneButton={handleDateRangeChange}
              onClickDateRangeSelectClearButton={handleDateRangeClear}
            />
          </Grid>

        </Grid>

        {/* Container for search bar aligned to the right */}
        <Grid item xs={4} container justifyContent="flex-end">
          <SearchBar
            placeholder='Search'
            searchInputText={searchInputText}
            onChangeOfSearchInput={onChangeOfSearchInput}
            onClearSearchInput={onClearSearchInput}
          />
        </Grid>
      </Grid>

      {/* </Box> */}



      {/* {
        poDataList.length === 0 ? 'No Data Found' :
          <Box>
            <TableContainer component={Paper} >
              <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead sx={tableHeaderStyle}>
                  <TableRow>
                    {tableHeadersList?.map((header) => (
                      <TableCell
                        key={header.id}
                        align="center"
                      >
                        {header.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {poDataList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((item, index) => (
                    <TableRow
                      key={index}
                      align='center'
                      sx={{ '&:hover': { cursor: 'pointer' } }}
                      onClick={() => editSelectedRowData(item)}
                    >
                      <TableCell component="th" scope="row">{index + 1}</TableCell>
                      {Object.entries(item).map(([key, value], index) => {

                        if (key === 'id') return null;
                        return (
                          <TableCell key={index} align="center">
                            {key === 'jc_month' ? moment(value).format('DD/MM/YYYY') : value}
                          </TableCell>
                        );
                      })}

                      <TableCell align="center">
                        <IconButton variant='outlined' size='small' onClick={(e) => handleOpenDeleteDataDialog(e, item)}>
                          <Tooltip title='Remove' arrow>
                            <DeleteIcon fontSize="inherit" />
                          </Tooltip>
                        </IconButton>
                      </TableCell>

                    </TableRow>
                  ))}
                </TableBody>

              </Table>

            </TableContainer>

            <TablePagination
              rowsPerPageOptions={[10, 25, 50]}
              component="div"
              count={poDataList.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleRowsPerPage}
            />


            <ConfirmationDialog
              open={openDeleteDataDialog}
              onClose={handleCloseDeleteDataDialog}
              onConfirm={handleDeleteData}
              title='Delete Confirmation'
              contentText='Are you sure you want to delete this data?'
              confirmButtonText="Delete"
              cancelButtonText="Cancel"
            />

          </Box >

      } */}


      <Box sx={{ mt: 1, mb: 1, border: '1px solid black' }}>

        <Grid container spacing={2} >
          <Grid item xs={12} md={4} >
            <CreatePieChart
              data={poStatusPieChart}
              options={optionsForPoStatusPieChart}
            />

            <Typography variant='h6'> Total PO Received Value: {poDataForChart.receivedPoSum} </Typography>
            <Typography variant='h6'> Total PO Pending Value: {poDataForChart.notReceivedPoSum} </Typography>

          </Grid>

          <Grid item xs={12} md={4} >
            <CreatePieChart
              data={invoiceStatusPieChart}
              options={optionsForInvoiceStatusPieChart}
            />


          </Grid>

          <Grid item xs={12} md={4}>
            <CreatePieChart
              data={paymentStatusPieChart}
              options={optionsForPaymentStatusPieChart}
            />

            <Typography variant='h6'> Total Payment Received: {poDataForChart.receivedPoSum} </Typography>
            <Typography variant='h6'> Total Payment Pending: {poDataForChart.notReceivedPoSum} </Typography>
            <Typography variant='h6'> Total Payment On Hold: {poDataForChart.paymentOnHoldSum} </Typography>
          </Grid>
        </Grid>

      </Box>

      <Box>

        <Grid item xs={4}>
          <FormControl sx={{ display: 'flex', justifyItems: 'flex-start', mt: 2, width: '50%', pb: 2 }}>
            <InputLabel>Select Financial Year</InputLabel>
            <Select
              label="Year"
              type="text"
              value={financialYear}
              onChange={handleFinancialYearChange}
            >
              {financialYearList.map((item, index) => (
                <MenuItem key={index} value={item}>{item}</MenuItem>
              ))}

            </Select>
          </FormControl>
        </Grid>

        <CreateBarChart
          data={monthWisePoCount}
          options={optionsForMonthWisePoCount}
        />
      </Box>

      {/* <HomeCharts /> */}

      <div style={{ height: 300, width: '100%', pt: 2 }}>
        <DataGrid
          rows={poDataList}
          columns={columns}
          sx={{ '&:hover': { cursor: 'pointer' } }}
          onRowClick={(params) => editSelectedRowData(params.row)}
          pageSize={5}
          rowsPerPageOptions={[5, 10, 20]}
          headerStyle={tableHeaderStyle}
        />
      </div>
    </>
  )
}

