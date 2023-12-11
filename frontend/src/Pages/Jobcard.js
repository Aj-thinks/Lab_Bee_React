
import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Container, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Grid, InputLabel, MenuItem, FormControl, Select, FormControlLabel, Radio, RadioGroup, FormLabel, IconButton, Tooltip, Divider
} from '@mui/material';

import moment from 'moment';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { toast } from 'react-toastify';
import axios from 'axios';

import { serverBaseAddress } from './APIPage'



const Jobcard = () => {

  // State variable to fetch the users list
  const [users, setUsers] = useState([])

  const [dateTimeValue, setDateTimeValue] = useState(dayjs());
  const [eutRows, setEutRows] = useState([]);
  const [testRows, setTestRows] = useState([]);
  const [testdetailsRows, setTestDetailsRows] = useState([]);


  ////////////////////////

  const [jcNumber, setJcnumber] = useState()

  const [dcNumber, setDcnumber] = useState()
  const [jcOpenDate, setJcOpenDate] = useState()
  const [poNumber, setPonumber] = useState()
  const [jcCategory, setJcCategory] = useState("")
  const [testCategory, setTestCategory] = useState("Environmental");
  const [testInchargeName, setTestInchargeName] = useState('')

  const [companyName, setCompanyName] = useState()
  const [customerNumber, setCustomerNumber] = useState()
  const [customerName, setCustomerName] = useState()
  const [projectName, setProjectName] = useState()
  const [sampleCondition, setSampleCondition] = useState("Good")
  const [referanceDocs, setReferanceDocs] = useState()
  const [jcStatus, setJcStatus] = useState('Open');
  const [jcCloseDate, setJcCloseDate] = useState();
  const [jcText, setJcText] = useState();
  const [observations, setObservations] = useState();




  // Set Initial table data for the 'EUT' Table:
  let defNomenclature = ''
  let defEutDescription = ''
  let defQty = ''
  let defPartNo = ''
  let defModelNo = ''
  let defSerialNo = ''

  const initialEutTableData = [{
    slno: 1,
    nomenclature: defNomenclature,
    eutDescription: defEutDescription,
    qty: defQty,
    partNo: defPartNo,
    modelNo: defModelNo,
    serialNo: defSerialNo,
  }]


  // Set Initial table data for the 'Tests' Table:
  let defTest = ''
  let defNabl = ''
  let defTestStandard = ''
  let defReferanceDocument = ''


  const initialTestsTableData = [{
    slno: 1,
    test: defTest,
    nabl: defNabl,
    testStandard: defTestStandard,
    referenceDocument: defReferanceDocument,
  }]

  // Set Initial table data for the 'Tests Detail' Table:
  let defTestName = ''
  let defTestChamber = ''
  let defEutSerialNo = ''
  let defStanadrd = ''
  let defStartedBy = ''
  let defStartDate = ''
  let defEndDate = ''
  let defDuration = ''
  let defTestEndedBy = ''
  let defRemarks = ''
  let defReportNo = ''
  let defReportPreparedBy = ''
  let defNablploaded = ''
  let defReportStatus = ''

  const initialTestDetailsTableData = [{
    slno: 1,
    testName: defTestName,
    testChamber: defTestChamber,
    eutSerialNo: defEutSerialNo,
    standard: defStanadrd,
    testStartedBy: defStartedBy,
    startDate: defStartDate,
    endDate: defEndDate,
    duration: defDuration,
    testEndedBy: defTestEndedBy,
    remarks: defRemarks,
    reportNo: defReportNo,
    preparedBy: defReportPreparedBy,
    nablUploaded: defNablploaded,
    reportStatus: defReportStatus
  }]


  //State variables to operate the tabular data of the Job-card page tables:
  const [eutTableData, setEutTableData] = useState(initialEutTableData);
  const [testsTableData, setTestsTableData] = useState(initialTestsTableData);
  const [testDetailsTableData, settestDetailsTableData] = useState(initialTestDetailsTableData);


  // Function to get the selected sample condition state:
  const handleSampleConditionChange = (event) => {
    setSampleCondition(event.target.value);
  };

  // Function to get the selected test category state:
  const handleTestCategoryChange = (event) => {
    setTestCategory(event.target.value);
  };

  // To get the selected date and Time
  const handleDateChange = (newDate) => {

    // Format the selected date into DATETIME format
    const formattedDate = newDate ? dayjs(newDate).format('YYYY-MM-DD HH:mm:ss') : null;
    setJcOpenDate(formattedDate);
  };

  // To get the selected date and Time
  const handlecloseDateChange = (newDate) => {

    // Format the selected date into DATETIME format
    const formattedCloseDate = newDate ? dayjs(newDate).format('YYYY-MM-DD HH:mm:ss') : null;
    setJcCloseDate(formattedCloseDate);
  };

  /////////////////////////////////////////

  // Functions to add and remove the 'EUT Details' table rows on clicking the add and remove icon. 
  const handleAddEutRow = () => {
    if (eutRows.length > 0) {
      const lastId = eutRows[eutRows.length - 1].id
      // console.log(eutRows.length);
      const newRow = { id: lastId + 1 };
      setEutRows([...eutRows, newRow]);
    }
    else {
      const newRow = { id: eutRows.length };
      setEutRows([...eutRows, newRow]);
    }
  };

  const handleRemoveEutRow = (id) => {
    const updatedRows = eutRows.filter((row) => row.id !== id);
    setEutRows(updatedRows);
  };


  // Functions to add and remove the 'Tests' table rows on clicking the add and remove icon. 
  const handleAddTestRow = () => {
    if (testRows.length > 0) {
      const lastId = testRows[testRows.length - 1].id
      const newRow = { id: lastId + 1 };
      setTestRows([...testRows, newRow]);
    }
    else {
      const newRow = { id: testRows.length };
      setTestRows([...testRows, newRow]);
    }
  };

  const handleRemoveTestRow = (id) => {
    const updatedRows = testRows.filter((row) => row.id !== id);
    setTestRows(updatedRows);
  };


  // Functions to add and remove the 'Test Details' table rows on clicking the add and remove icon. 
  const handleAddTestDetailsRow = () => {
    if (testdetailsRows.length > 0) {
      const lastId = testdetailsRows[testdetailsRows.length - 1].id
      const newRow = { id: lastId + 1 };
      setTestDetailsRows([...testdetailsRows, newRow]);
    }
    else {
      const newRow = { id: testdetailsRows.length };
      setTestDetailsRows([...testdetailsRows, newRow]);
    }
  };

  const handleRemoveTestDetailsRow = (id) => {
    const updatedRows = testdetailsRows.filter((row) => row.id !== id);
    setTestDetailsRows(updatedRows);
  };

  ////////////////////////////////////////////////

  const [jcnumberstring, setJcnumberstring] = useState("");
  const [jcCount, setJcCount] = useState()


  // Function to get the current year and month:
  const getCurrentYearAndMonth = () => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // Adding 1 because months are zero-indexed

    return { currentYear, currentMonth };
  };

  // Use Effect to fetch the last jc number and generate the new jc number:
  useEffect(() => {

    const { currentYear, currentMonth } = getCurrentYearAndMonth();

    let finYear = currentYear;

    if (currentMonth > 2) {
      finYear = `${currentYear}-${currentYear + 1}/${currentMonth}`;
      //console.log('2', finYear)
    } else {
      finYear = `${currentYear - 1}-${currentYear}/${currentMonth}`;
      //console.log('3', finYear)
    }


    //fetch the latest jcnumber count
    const fetchJCCount = async () => {

      axios.post(`${serverBaseAddress}/api/getJCCount`, {
        finYear
      }).then(res => {
        if (res.status === 200) {
          console.log(res.data);
          setJcCount(res.data)
        }
        if (res.status === 500) {
          console.log(res.status);
        }
      })
    }
    fetchJCCount().then(() => {
      console.log("jcCount:", jcCount);

    });


    //generate jcnumber dynamically
    const dynamicjcnumberstring = `${finYear}-${(jcCount + 1).toString().padStart(3, '0')}`;
    setJcnumberstring(dynamicjcnumberstring);
    //console.log('final value is', dynamicjcnumberstring);

  }, [jcCount]);


  // To submit the Job-card data and store it in a database:
  const handleSubmitJobcard = (e) => {
    console.log('this is jobcard')

    e.preventDefault()
    setJcnumberstring((prev) => {
      const numericPart = parseInt(prev.slice(-3), 10);
      const nextNumericPart = numericPart + 1;
      const formattedNumericPart = nextNumericPart.toString().padStart(3, '0');
      return prev.slice(0, -3) + formattedNumericPart;
    });


    try {

      axios.post(`${serverBaseAddress}/api/add_jobcard`, {
        jcNumber: jcnumberstring,
        dcNumber,
        jcOpenDate,
        poNumber,
        jcCategory: testCategory,
        testInchargeName,
        companyName,
        customerNumber,
        customerName,
        projectName,
        sampleCondition,
        referanceDocs,
        jcStatus,
        jcCloseDate,
        jcText,
        observations,


      })
      // toast.success('JC Submitted Successfully');
    } catch (error) {
      console.error('Error submitting jobcard:', error);
    }


    // Function to extract EUT details based on the index
    const eutdetailsdata = (i) => {

      return {

        nomenclature: eutRows[i].nomenclature,
        eutdescription: eutRows[i].eutDescription,
        qty: eutRows[i].qty,
        partno: eutRows[i].partNo,
        modelno: eutRows[i].modelNo,
        serialno: eutRows[i].serialNo,
        jcNumber: jcnumberstring,
      }
    }


    // Iterating over eutRows using map to submit data to the server
    eutRows.map((row, index) => {
      //console.log('tata', index);
      axios.post(`${serverBaseAddress}/api/eutdetails`, eutdetailsdata(index))

        .then(
          res => {
            if (res.status === 200)
              toast.success('eutdetails  Submitted Succesfully')
          }
        )
    })



    // Function to extract tests data based on the index
    const testsdata = (i) => {
      return {
        test: testRows[i].test,
        nabl: testRows[i].nabl,
        teststandard: testRows[i].testStandard,
        referencedocument: testRows[i].referenceDocument,
        jcNumber: jcnumberstring,
      }
    }
    // Iterating over testRows using map to submit data to the server
    testRows.map((row, index) => {
      //console.log('unicorn', index);
      axios.post(`${serverBaseAddress}/api/tests`, testsdata(index))

        .then(
          res => {
            if (res.status === 200)
              toast.success('tests  Submitted Succesfully')
          }
        )

    })


    // Function to extract test details based on the index

    console.log('AAAAAAAA', testdetailsRows[0].test);
    const testdetailsdata = (i) => {
      console.log('pppppppppp', testdetailsRows[i].startDate);
      const formattedstartDate = moment(testdetailsRows[i].startDate).format('YYYY-MM-DD');
      const formattedendDate = moment(testdetailsRows[i].endDate).format('YYYY-MM-DD');

      console.log('Formatted Start Date:', formattedstartDate);
      console.log('Formatted End Date:', formattedendDate);

      return {

        test: testdetailsRows[i].test,
        chamber: testdetailsRows[i].chamber,
        eutserialno: testdetailsRows[i].eutSerialNo,
        standard: testdetailsRows[i].standard,
        testStartedBy: testdetailsRows[i].testStartedBy,
        startdate: testdetailsRows[i].startDate,
        enddate: testdetailsRows[i].endDate,
        duration: testdetailsRows[i].duration,
        endedby: testdetailsRows[i].endedBy,
        remarks: testdetailsRows[i].remarks,
        reportno: testdetailsRows[i].reportNo,
        preparedby: testdetailsRows[i].preparedBy,
        nabluploaded: testdetailsRows[i].nablUploaded,
        reportstatus: testdetailsRows[i].reportStatus,
        jcNumber: jcnumberstring,
      }

    }
    //console.log('the data is :', testdetailsdata);
    // Iterating over testdetailsRows using map to submit data to the server
    testdetailsRows.map((row, index) => {
      //console.log('insex iss', index);
      axios.post(`${serverBaseAddress}/api/testdetails`, testdetailsdata(index))
        .then(
          res => {
            if (res.status === 200)
              toast.success('testdetails  Submitted Succesfully')
          }
        )
    })
  }


  // function handle changes in eutrow data
  const handleEutRowChange = (index, field, value) => {
    const updatedRows = [...eutRows];
    updatedRows[index][field] = value; // Update the particular field in EUTrow at the given index with a new value
    setEutRows(updatedRows);
  };

  // function handle changes in testrow data
  const handleTestRowChange = (index, field, value) => {
    const updatedRows = [...testRows];
    updatedRows[index][field] = value;
    setTestRows(updatedRows);
  };

  // function handle changes in testdetailsrow data
  const handleTestDetailsRowChange = (index, field, value) => {
    //console.log(index, field, value);
    //console.log('testdetailsRows is ', testdetailsRows);
    const updatedRows = [...testdetailsRows];
    updatedRows[index] = { ...updatedRows[index], [field]: value };


    if (field === 'startDate' || field === 'endDate') {
      const startDate = new Date(updatedRows[index].startDate);
      const endDate = new Date(updatedRows[index].endDate);

      if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
        const durationInMillis = endDate.getTime() - startDate.getTime();
        const durationInMinutes = Math.round(durationInMillis / (1000 * 60 * 60));

        updatedRows[index] = { ...updatedRows[index], duration: durationInMinutes };
      }
    }
    setTestDetailsRows(updatedRows);
  };



  // To clear the fields of job card:
  const handleClearJobcard = () => {
    //toast.success('Cleared')
    setJcnumber('');
    setDcnumber('');
    setJcOpenDate('');
    setPonumber('');
    //setJcCategory('');
    setTestCategory('');
    setTestInchargeName('');
    setCompanyName('');
    setCustomerNumber('');
    setCustomerName('');
    setProjectName('');
    setSampleCondition('');
    setReferanceDocs('');
    setJcStatus('');
    setJcText('');
    setJcCloseDate('');
    setObservations('');

  }

  //////////////////////////////////////////////////////////


  // UseEffect to set the quotation data during update of the quotation:
  useEffect(() => {
    axios.get(`${serverBaseAddress}/api/getTestingUsers/`)
      .then(result => {
        setUsers(result.data)
      })

  }, [])



  //Font for thetable headers:
  const tableHeaderFont = { fontSize: 16, fontWeight: 'bold' }

  const HeaderCell = ({ children }) => (
    <TableCell>
      <Typography sx={tableHeaderFont}>
        {children}
      </Typography>
    </TableCell>
  );


  return (

    <>
      <Divider>
        <Typography variant='h4' sx={{ color: '#003366' }}> Job-Card </Typography>
      </Divider>
      <br />

      <form onSubmit={handleSubmitJobcard}>

        <Box sx={{ paddingTop: '5', paddingBottom: '5px', marginTop: '5px', marginBottom: '5px', border: 1, borderColor: 'primary.main' }}>

          {/* First Grid box */}
          <Grid container justifyContent="center" spacing={2} >
            <Grid item xs={6} elevation={4} sx={{ borderRadius: 3 }} >

              <Typography variant='h5' align='center'> Primary JC Details </Typography>
              <br />

              <Container component="span" margin={1} paddingright={1} elevation={11}>

                <Box >
                  <Typography variant="h6" align='center' sx={{ marginBottom: '16px', marginRight: '20px', marginLeft: '20px', fontWeight: 'bold', fontStyle: 'italic', color: 'blue', textDecoration: 'underline' }}>
                    JC Number : {jcnumberstring}
                  </Typography>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <TextField
                      sx={{ width: '50%', borderRadius: 3 }}
                      label="DC Number"
                      margin="normal"
                      variant="outlined"
                      autoComplete="on"
                      type="text"
                      name="dc_formnumber"
                      value={dcNumber}
                      onChange={(e) => setDcnumber(e.target.value)}
                    />

                    <TextField
                      sx={{ width: '45%', borderRadius: 3 }}
                      label="PO Number"
                      margin="normal"
                      variant="outlined"
                      autoComplete="on"
                      type="text" name="po_number"
                      value={poNumber}
                      onChange={(e) => setPonumber(e.target.value)}
                    />
                  </div>

                  <br />

                  <div style={{ display: 'flex', justifyContent: 'space-between' }} >
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DateTimePicker sx={{ width: '50%', borderRadius: 3 }}
                        label="JC Open Date"
                        variant="outlined"
                        margin="normal"
                        value={dateTimeValue}
                        onChange={handleDateChange}
                        renderInput={(props) => <TextField {...props} />}
                        format="YYYY-MM-DD HH:mm:ss"
                      />
                    </LocalizationProvider>


                    <FormControl sx={{ width: '45%', borderRadius: 3 }} >
                      <InputLabel >Test Incharge</InputLabel>
                      <Select
                        label="test-incharge"
                        value={testInchargeName}
                        onChange={(e) => setTestInchargeName(e.target.value)}

                      //onChange={(e) => handleInputChange(row.slno, 'user_id', e.target.value)}
                      >
                        {users.map((item) => (<MenuItem key={item.id} value={item.name}>{item.name}</MenuItem>))}
                      </Select>
                    </FormControl>
                  </div>
                  <br />

                  <FormControl sx={{ width: '50%', }}>
                    <FormLabel id="test-category-buttons-group-label">Test Category:</FormLabel>
                    <RadioGroup
                      row
                      aria-label="Category"
                      name="category"
                      value={testCategory}
                      onChange={handleTestCategoryChange}  >
                      <FormControlLabel value="Environmental" control={<Radio />} label="Environmental " />
                      <FormControlLabel value="Screening" control={<Radio />} label="Screening " />
                      <FormControlLabel value="Other" control={<Radio />} label="Other " />
                    </RadioGroup>
                  </FormControl>

                </Box>
              </Container>
            </Grid>


            {/* Second Grid box */}
            <Grid item xs={6} elevation={4} sx={{ borderRadius: 3 }}>

              <Typography variant='h5' align='center'> Customer Details </Typography>
              <br />

              <Container component="span" margin={1} paddingright={1} elevation={11}>
                <Box >
                  <TextField
                    sx={{ borderRadius: 3, marginRight: '10px' }}
                    label="Company Name"
                    margin="normal"
                    variant="outlined"
                    autoComplete="on"
                    fullWidth
                    input type="text" name="company_name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>

                    <TextField
                      sx={{ width: '45%', borderRadius: 3 }}
                      label="Customer Name/Signature"
                      margin="normal"
                      variant="outlined"
                      type="text"
                      name="customer_signature"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />

                    <TextField
                      sx={{ width: '50%', borderRadius: 3 }}
                      label="Contact Number"
                      margin="normal"
                      variant="outlined"
                      type="number"
                      value={customerNumber}
                      onChange={(e) => setCustomerNumber(e.target.value)}
                    />

                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }} >
                    <TextField
                      sx={{ width: '45%', borderRadius: 3 }}
                      label="Project Name"
                      margin="normal"
                      variant="outlined"
                      fullWidth
                      type="text" name="project_name"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                    />

                    <TextField
                      sx={{ width: '50%', borderRadius: 3 }}
                      label="Reference Document(If Any)"
                      margin="normal"
                      variant="outlined"
                      fullWidth
                      type="text" name="referance_document"
                      value={referanceDocs}
                      onChange={(e) => setReferanceDocs(e.target.value)}
                    />
                  </div>


                  <br />

                  <FormControl sx={{ width: '50%', }}>
                    <FormLabel id="sample-condition-buttons-group-label">Sample Condition:</FormLabel>
                    <RadioGroup
                      row
                      aria-label="sample-condition"
                      name="sample-condition"
                      value={sampleCondition}
                      onChange={handleSampleConditionChange} >
                      <FormControlLabel value="Good" control={<Radio />} label="Good " />
                      <FormControlLabel value="Other" control={<Radio />} label="Other " />
                    </RadioGroup>
                  </FormControl>
                </Box>
              </Container>

            </Grid>
          </Grid>

        </Box>

        <br />

        <Box >
          {/* Table Container */}
          <Typography sx={{ marginTop: '5', paddingBottom: '3', paddingTop: '5' }} variant="h5"> EUT Details </Typography>

          <TableContainer component={Paper} >
            <Table size='small' aria-label="simple table">
              <TableHead sx={{ backgroundColor: '#227DD4' }}>
                <TableRow >
                  <HeaderCell >Sl No</HeaderCell>
                  {/* <HeaderCell align='center'>JC Number</HeaderCell> */}
                  <HeaderCell align='center'>Nomenclature</HeaderCell>
                  <HeaderCell align='center'>Eut Description</HeaderCell>
                  <HeaderCell align='center'>Qty</HeaderCell>
                  <HeaderCell align='center'>Part No</HeaderCell>
                  <HeaderCell align='center'>Model No</HeaderCell>
                  <HeaderCell align='center'>Serial No</HeaderCell>
                  <HeaderCell>

                    <IconButton size='small'>
                      <Tooltip title='Add Row' arrow>
                        <AddIcon onClick={handleAddEutRow} />
                      </Tooltip>
                    </IconButton>

                  </HeaderCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {eutRows.map((row, index) => {
                  return (
                    <TableRow key={row.id}>
                      <TableCell>{index + 1}</TableCell>
                      {/* <TableCell>
                        <TextField style={{ align: "center" }} variant="outlined" />
                      </TableCell> */}
                      <TableCell>
                        <TextField style={{ align: "center" }} variant="outlined"
                          value={row.nomenclature}
                          onChange={(e) => handleEutRowChange(index, 'nomenclature', e.target.value)} />
                      </TableCell>

                      <TableCell>
                        <TextField style={{ align: "center" }} variant="outlined"
                          value={row.eutDescription}
                          onChange={(e) => handleEutRowChange(index, 'eutDescription', e.target.value)} />
                      </TableCell>

                      <TableCell>
                        <TextField style={{ align: "center" }} variant="outlined"
                          value={row.qty}
                          onChange={(e) => handleEutRowChange(index, 'qty', e.target.value)} />
                      </TableCell>

                      <TableCell>
                        <TextField style={{ align: "center" }} variant="outlined"
                          value={row.partNo}
                          onChange={(e) => handleEutRowChange(index, 'partNo', e.target.value)} />
                      </TableCell>

                      <TableCell>
                        <TextField style={{ align: "center" }} variant="outlined"
                          value={row.modelNo}
                          onChange={(e) => handleEutRowChange(index, 'modelNo', e.target.value)}
                        />
                      </TableCell>

                      <TableCell>
                        <TextField style={{ align: "center" }} variant="outlined"
                          value={row.serialNo}
                          onChange={(e) => handleEutRowChange(index, 'serialNo', e.target.value)}
                        />
                      </TableCell>

                      <TableCell>
                        <IconButton size='small'>
                          <Tooltip title='Remove Row' arrow>
                            <RemoveIcon onClick={() => handleRemoveEutRow(row.id)} />
                          </Tooltip>
                        </IconButton>
                      </TableCell>

                    </TableRow>
                  )
                }
                )}
              </TableBody>
            </Table>
          </TableContainer>



          <br />


          <Typography sx={{ marginTop: '5', paddingBottom: '3', paddingTop: '5' }} variant="h5"> Tests </Typography>

          <TableContainer component={Paper} >
            <Table size='small' aria-label="simple table">
              <TableHead sx={{ backgroundColor: '#227DD4' }}>
                <TableRow>
                  <HeaderCell >Sl No</HeaderCell>
                  <HeaderCell align="center">Test</HeaderCell>
                  <HeaderCell align="center">NABL</HeaderCell>
                  <HeaderCell align="center">Test Standard</HeaderCell>
                  <HeaderCell align="center">Reference Document</HeaderCell>
                  <HeaderCell>
                    <IconButton size='small'>
                      <Tooltip title='Add Row' arrow>
                        <AddIcon onClick={handleAddTestRow} />
                      </Tooltip>
                    </IconButton>
                  </HeaderCell>

                </TableRow>
              </TableHead>
              <TableBody>
                {testRows.map((row, index) => (
                  <TableRow key={row.id}>
                    <TableCell>{index + 1}</TableCell>

                    <TableCell>
                      <TextField style={{ align: "center" }} variant="outlined"
                        value={row.test}
                        onChange={(e) => handleTestRowChange(index, 'test', e.target.value)} />
                    </TableCell>

                    <TableCell >

                      <FormControl sx={{ width: '100%', borderRadius: 3, align: "center" }} >
                        <InputLabel >Test Category</InputLabel>
                        <Select label="Nabl-non-nabl-status"
                          value={row.nabl}
                          onChange={(e) => handleTestRowChange(index, 'nabl', e.target.value)}>
                          <MenuItem value="nabl">NABL</MenuItem>
                          <MenuItem value="non-nabl">Non-NABL</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>

                    <TableCell>
                      <TextField style={{ align: "center" }} variant="outlined"
                        value={row.testStandard}
                        onChange={(e) => handleTestRowChange(index, 'testStandard', e.target.value)} />
                    </TableCell>


                    <TableCell>
                      <TextField style={{ align: "center" }} variant="outlined"
                        value={row.referenceDocument}
                        onChange={(e) => handleTestRowChange(index, 'referenceDocument', e.target.value)} />
                    </TableCell>

                    <TableCell >
                      <IconButton size='small'>
                        <Tooltip title='Remove Row' arrow>
                          <RemoveIcon onClick={() => handleRemoveTestRow(row.id)} />
                        </Tooltip>
                      </IconButton>
                    </TableCell>

                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>



          <br />

          <Typography sx={{ marginTop: '5', paddingBottom: '3', paddingTop: '5' }} variant="h5">Test Details</Typography>

          <TableContainer component={Paper}  >
            <Table size='small' aria-label="simple table" >
              <TableHead sx={{ backgroundColor: '#227DD4' }}>
                <TableRow>
                  <TableCell >Sl No</TableCell>
                  <TableCell sx={{ minWidth: '300px' }} align="center">Test</TableCell>
                  <TableCell sx={{ minWidth: '150px' }} align="center">Chamber</TableCell>
                  <TableCell sx={{ minWidth: '150px' }} align="center">EUT Serial No</TableCell>
                  <TableCell sx={{ minWidth: '150px' }} align="center">Standard</TableCell>
                  <TableCell sx={{ minWidth: '150px' }} align="center">Started By</TableCell>
                  <TableCell sx={{ minWidth: '250px' }} align="center">Start Date & Time </TableCell>
                  <TableCell sx={{ minWidth: '250px' }} align="center">End Date & Time</TableCell>
                  <TableCell sx={{ minWidth: '150px' }} align="center">Duration(Hrs)</TableCell>
                  <TableCell sx={{ minWidth: '150px' }} align="center">Ended By</TableCell>
                  <TableCell sx={{ minWidth: '150px' }} align="center">Remarks</TableCell>
                  <TableCell sx={{ minWidth: '150px' }} align="center">Report No</TableCell>
                  <TableCell sx={{ minWidth: '150px' }} align="center">Prepared By</TableCell>
                  <TableCell sx={{ minWidth: '150px' }} align="center">NABL Uploaded</TableCell>
                  <TableCell sx={{ minWidth: '150px' }} align="center">Report Status</TableCell>

                  <TableCell>
                    <IconButton size='small'>
                      <Tooltip title='Add Row' arrow>
                        <AddIcon onClick={handleAddTestDetailsRow} />
                      </Tooltip>
                    </IconButton>
                  </TableCell>

                </TableRow>
              </TableHead>

              <TableBody>
                {testdetailsRows.map((row, index) => (
                  <TableRow key={row.id}>
                    <TableCell>{index + 1}</TableCell>


                    <TableCell> <TextField style={{ align: "center" }} variant="outlined"
                      value={row.testName}
                      onChange={(e) => handleTestDetailsRowChange(index, 'testName', e.target.value)} />
                    </TableCell>

                    <TableCell> <TextField style={{ align: "center" }} variant="outlined"
                      value={row.testChamber}
                      onChange={(e) => handleTestDetailsRowChange(index, 'testChamber', e.target.value)} />
                    </TableCell>

                    <TableCell> <TextField style={{ align: "center" }} variant="outlined"
                      value={row.eutSerialNo}
                      onChange={(e) => handleTestDetailsRowChange(index, 'eutSerialNo', e.target.value)} />
                    </TableCell>

                    <TableCell>
                      <TextField style={{ align: "center" }} variant="outlined"
                        value={row.standard}
                        onChange={(e) => handleTestDetailsRowChange(index, 'standard', e.target.value)}
                      />
                    </TableCell>

                    <TableCell>
                      <FormControl sx={{ width: '100%', borderRadius: 3 }} >
                        <InputLabel >Started By</InputLabel>
                        <Select
                          label="test-started-by"
                          value={row.user_name}
                          onChange={(e) => handleTestDetailsRowChange(index, 'testStartedBy', e.target.value)}
                        >
                          {users.map((item) => (<MenuItem key={item.id} value={item.name}>{item.name}</MenuItem>))}
                        </Select>
                      </FormControl>
                    </TableCell>

                    <TableCell>
                      {/* <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DateTimePicker sx={{ width: '100%', borderRadius: 3 }}
                          label="Test start date"
                          variant="outlined"
                          margin="normal"
                          // value={dateTimeValue}
                          // onChange={handleDateChange}                         
                          renderInput={(props) => <TextField {...props} />}
                        />
                      </LocalizationProvider> */}
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DateTimePicker sx={{ width: '100%', borderRadius: 3 }}
                          label="Test start date"
                          variant="outlined"
                          margin="normal"
                          // value={dateTimeValue}
                          // onChange={handleDateChange}
                          value={row.startDate}
                          onChange={(date) => handleTestDetailsRowChange(index, 'startDate', date)}

                          renderInput={(props) => <TextField {...props} />}
                          format="DD/MM/YYYY HH:mm A"
                        />
                      </LocalizationProvider>
                    </TableCell>


                    <TableCell>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DateTimePicker sx={{ width: '100%', borderRadius: 3 }}
                          label="Test end date"
                          variant="outlined"
                          margin="normal"
                          // value={dateTimeValue}
                          // onChange={handleDateChange}
                          value={row.endDate}
                          onChange={(date) => handleTestDetailsRowChange(index, 'endDate', date)}

                          renderInput={(props) => <TextField {...props} />}
                          format="DD/MM/YYYY HH:mm A"
                        />
                      </LocalizationProvider>
                    </TableCell>

                    <TableCell> <TextField style={{ align: "center" }} variant="outlined"
                      value={row.duration}
                      onChange={(e) => handleTestDetailsRowChange(index, 'duration', e.target.value)} />
                    </TableCell>

                    <TableCell>
                      <FormControl sx={{ width: '100%', borderRadius: 3 }} >
                        <InputLabel >Ended By</InputLabel>
                        <Select
                          label="test-ended-by"
                          value={row.user_name}
                          onChange={(e) => handleTestDetailsRowChange(index, 'testEndedBy', e.target.value)}
                        //onChange={(e) => handleInputChange(row.slno, 'user_id', e.target.value)}
                        >
                          {users.map((item) => (<MenuItem key={item.id} value={item.name}>{item.name}</MenuItem>))}
                        </Select>
                      </FormControl>
                    </TableCell>

                    <TableCell> <TextField style={{ align: "center" }} variant="outlined"
                      value={row.remarks}
                      onChange={(e) => handleTestDetailsRowChange(index, 'remarks', e.target.value)} />
                    </TableCell>

                    <TableCell> <TextField style={{ align: "center" }} variant="outlined"
                      value={row.reportNo}
                      onChange={(e) => handleTestDetailsRowChange(index, 'reportNo', e.target.value)} />
                    </TableCell>

                    <TableCell>
                      <FormControl sx={{ width: '100%', borderRadius: 3 }} >
                        <InputLabel >Report Prepared By</InputLabel>
                        <Select
                          label="report-prepared-by"
                          value={row.user_name}
                          onChange={(e) => handleTestDetailsRowChange(index, 'preparedBy', e.target.value)}
                        //onChange={(e) => handleInputChange(row.slno, 'user_id', e.target.value)}
                        >
                          {users.map((item) => (<MenuItem key={item.id} value={item.name}>{item.name}</MenuItem>))}
                        </Select>
                      </FormControl>

                    </TableCell>

                    <TableCell>
                      <FormControl sx={{ width: '100%', borderRadius: 3 }} >
                        <InputLabel >Status</InputLabel>
                        <Select label="Nabl-upload-status"
                          value={row.nablUploaded}
                          onChange={(e) => handleTestDetailsRowChange(index, 'nablUploaded', e.target.value)}
                        >
                          <MenuItem value="not-sent">Uploaded</MenuItem>
                          <MenuItem value="sent">Not-Uploaded</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>


                    <TableCell>
                      <FormControl sx={{ width: '100%', borderRadius: 3 }} >
                        <InputLabel >Status</InputLabel>
                        <Select label="Report-delivery-status"
                          value={row.reportStatus}
                          onChange={(e) => handleTestDetailsRowChange(index, 'reportStatus', e.target.value)}>

                          <MenuItem value="not-sent">Not Sent</MenuItem>
                          <MenuItem value="sent">Sent</MenuItem>
                          <MenuItem value="on-hold">On Hold</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>

                    <TableCell>
                      <IconButton size='small'>
                        <Tooltip title='Remove Row' arrow>
                          <RemoveIcon onClick={() => handleRemoveTestDetailsRow(row.id)} />
                        </Tooltip>
                      </IconButton>
                    </TableCell>

                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <br />


          <Box sx={{ paddingTop: '5', paddingBottom: '5px', marginTop: '5px', marginBottom: '5px', border: 1, borderColor: 'primary.main' }}>

            <Container maxWidth="s">
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <FormControl sx={{ width: '50%', marginBottom: '20px', marginRight: '15px', marginTop: '20px', borderRadius: 3, alignContent: 'left' }} >
                    <InputLabel >JC Status</InputLabel>
                    <Select
                      label="JcStatus"
                      value={jcStatus}
                      // onChange={handleChangeJcStatus}
                      onChange={(e) => setJcStatus(e.target.value)}
                    >
                      <MenuItem value="Open">Open</MenuItem>
                      <MenuItem value="Running">Running</MenuItem>
                      <MenuItem value="Close">Close</MenuItem>

                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={6} >
                  {jcStatus === 'Close' && (
                    // <DateTimePicker sx={{ marginBottom: '16px', marginTop: '20px', marginLeft: '15px', borderRadius: 3 }}
                    //   label="JC Close Date"
                    //   variant="outlined"
                    //   fullWidth
                    //   // defaultValue={dayjs()}
                    //   value={jcCloseDate}
                    //   onChange={handlecloseDateChange}
                    //   renderInput={(props) => <TextField {...props} />}
                    //   format="DD/MM/YYYY HH:mm A"
                    // />
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DateTimePicker sx={{ width: '75%', marginBottom: '20px', marginTop: '20px', marginLeft: '15px', marginRight: '15px', borderRadius: 3 }}
                        label="JC close Date"
                        variant="outlined"
                        margin="normal"
                        value={jcCloseDate}
                        onChange={handlecloseDateChange}
                        renderInput={(props) => <TextField {...props} />}
                        format="YYYY-MM-DD HH:mm:ss"
                      />
                    </LocalizationProvider>

                  )}


                  {jcStatus === 'Open' && (
                    <Typography variant="h6">
                      <TextField sx={{ width: '75%', marginBottom: '20px', marginTop: '20px', marginLeft: '15px', marginRight: '15px', borderRadius: 3 }}
                        onChange={(e) => setJcText(e.target.value)}
                      />
                    </Typography>
                  )}
                  <TextField
                    sx={{ width: '75%', marginBottom: '20px', marginLeft: '15px', marginRight: '15px', borderRadius: 3 }}
                    label="Observations(if any)"
                    margin="normal"
                    variant="outlined"
                    multiline={true}
                    rows={4}
                    autoComplete="on"
                    onChange={(e) => setObservations(e.target.value)}
                  />
                </Grid>
              </Grid>

            </Container>

          </Box>
        </Box>

        <Box sx={{ marginTop: 3, marginBottom: 0.5, alignContent: 'center' }}>
          <Button sx={{ borderRadius: 3, margin: 0.5 }}
            variant="contained"
            color="primary"
            onClick={handleClearJobcard}>
            Clear
          </Button>

          <Button sx={{ borderRadius: 3, margin: 0.5 }}
            variant="contained"
            color="primary"
            onClick={handleSubmitJobcard}
          >
            Submit
          </Button>

        </Box>


      </form >
    </>
  )
}

export default Jobcard;