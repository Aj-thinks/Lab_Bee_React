import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Box,
    Divider,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    Typography,
} from '@mui/material'

import { serverBaseAddress } from './APIPage'
import axios from 'axios';

import PendingIcon from '@mui/icons-material/Pending';

import { toast } from 'react-toastify';

import { CreateButtonWithLink } from '../functions/ComponentsFunctions';
import { getCurrentMonthYear } from '../functions/UtilityFunctions';
import { DataGrid } from '@mui/x-data-grid';
import DateRangeFilter from '../components/DateRangeFilter';
import SearchBar from '../components/SearchBar';
import dayjs from 'dayjs';



export default function JCHome() {

    const location = useLocation();

    const navigate = useNavigate();

    // State variables to hold the data fetched from the database:

    const [jcTableData, setJcTableData] = useState([]);   //fetch data from the database & to show inside a table

    const [originalJcTableData, setOriginalJcTableData] = useState([]);

    const [loading, setLoading] = useState(true);                 //To show loading label

    const [msg, setMsg] = useState(<Typography variant='h4'> Loading...</Typography>);

    const [error, setError] = useState(null);                     //To show error label

    const [filterRow, setFilterRow] = useState([]);               //To filter out the table based on search



    const [refresh, setRefresh] = useState(false)

    const [jcMonthYear, setJCMonthYear] = useState(getCurrentMonthYear())
    const [jcMonthYearList, setJcMonthYearList] = useState([])

    const [selectedJCDateRange, setSelectedJCDateRange] = useState(null);

    const [searchInputTextOfJC, setSearchInputTextOfJC] = useState("")

    const [filteredJcData, setFilteredJcData] = useState(jcTableData);




    // Simulate fetching jc data from the database
    useEffect(() => {

        const jcTableDataRefresh = location.state?.updated;

        let requiredAPIdata = {
            _fields: 'jc_number, jc_category, jc_open_date, company_name,  jc_status',
            monthYear: jcMonthYear,
        }

        const urlParameters = new URLSearchParams(requiredAPIdata).toString()

        const quotesURL = `${serverBaseAddress}/api/getPrimaryJCData?` + urlParameters

        if (filterRow.length > 0) {
            setFilterRow(filterRow)
        } else {
            const fetchJCDataFromDatabase = async () => {
                try {
                    const response = await axios.get(quotesURL);
                    setJcTableData(response.data);
                    setOriginalJcTableData(response.data)
                    setLoading(false);
                } catch (error) {
                    console.error('Failed to fetch the data', error);
                    setError(error);
                    setLoading(false);
                }
            };
            fetchJCDataFromDatabase();
        }

    }, [jcMonthYear, filterRow, refresh, location.state]);



    useEffect(() => {
        const getMonthYearListOfJC = async () => {
            try {
                const response = await axios.get(`${serverBaseAddress}/api/getJCYearMonth`);
                if (response.status === 200) {
                    setJcMonthYearList(response.data);
                } else {
                    console.error('Failed to fetch JC months list. Status:', response.status);
                }
            } catch (error) {
                console.error('Failed to fetch the data', error);
            }
        }
        getMonthYearListOfJC()
    }, [jcMonthYear, jcMonthYearList, refresh, location.state])



    //useEffect to filter the table based on the search input
    useEffect(() => {
        setFilteredJcData(jcTableData);
    }, [jcTableData]);


    //If data is loading then show Loading text
    if (loading) {
        // return <div>Loading... <PendingIcon /> </div>
        return <div>No Job-cards Found <PendingIcon /> </div>
    }


    //If any error found then show the error
    if (error) {
        return <div>Error: {error.message}</div>;
    }


    // Custom style for the table header
    const tableHeaderStyle = { backgroundColor: '#0f6675', fontWeight: 'bold' }

    //Table columns
    const columns = [
        { field: 'id', headerName: 'SL No', width: 100, align: 'center', headerAlign: 'center', headerClassName: 'custom-header-color' },
        { field: 'jc_number', headerName: 'JC Number', width: 200, align: 'center', headerAlign: 'center', headerClassName: 'custom-header-color' },
        { field: 'jc_open_date', headerName: 'JC Open Date', width: 200, align: 'center', headerAlign: 'center', headerClassName: 'custom-header-color' },
        { field: 'jc_category', headerName: 'JC Category', width: 200, align: 'center', headerAlign: 'center', headerClassName: 'custom-header-color' },
        { field: 'company_name', headerName: 'Company', width: 200, align: 'center', headerAlign: 'center', headerClassName: 'custom-header-color' },
        { field: 'jc_status', headerName: 'JC Status', width: 200, align: 'center', headerAlign: 'center', headerClassName: 'custom-header-color' },
    ];

    // on changing the month-year selection:
    const handleMonthYearOfJC = (event) => {
        setJCMonthYear(event.target.value)
    }


    // To edit the selected JC
    const editSelectedRowData = (item) => {
        navigate(`/jobcard/${item.id}`)
    }


    // on selecting the two different dates or date ranges.
    const handleJCDateRangeChange = (selectedJCDateRange) => {

        if (selectedJCDateRange && selectedJCDateRange.startDate && selectedJCDateRange.endDate) {
            const formattedDateRange = `${dayjs(selectedJCDateRange.startDate).format('YYYY-MM-DD')} - ${dayjs(selectedJCDateRange.endDate).format('YYYY-MM-DD')}`;
            setSelectedJCDateRange(formattedDateRange);
            fetchJCDataBetweenTwoDates(formattedDateRange);
        } else {
            console.log('Invalid date range format');
        }
    }

    // To clear the selected dates or date ranges.
    const handleJCDateRangeClear = () => {
        setSelectedJCDateRange(null)
        setJcTableData(originalJcTableData)
    }

    // function with api address to fetch the JC details between the two date ranges:
    const fetchJCDataBetweenTwoDates = async (dateRange) => {
        try {
            const response = await axios.get(`${serverBaseAddress}/api/getPrimaryJCDataBwTwoDates`, {
                params: { selectedJCDateRange: dateRange }
            });
            setJcTableData(response.data);
        } catch (error) {
            console.error('Error fetching JC data:', error);
        }
    };


    //Start the search filter using the searchbar
    const onChangeOfSearchInputOfJC = (e) => {
        const searchText = e.target.value;
        setSearchInputTextOfJC(searchText);
        filterDataGridTable(searchText);
    }

    //Function to filter the table
    const filterDataGridTable = (searchValue) => {
        const filtered = jcTableData.filter((row) => {
            return Object.values(row).some((value) =>
                value.toString().toLowerCase().includes(searchValue.toLowerCase())
            )
        })
        setFilteredJcData(filtered);
    }

    //Clear the search filter
    const onClearSearchInputOfJC = () => {
        setSearchInputTextOfJC("");
        setFilteredJcData(jcTableData);
    }


    return (

        <>
            <Divider>
                <Typography variant='h4' sx={{ color: '#003366' }}> Job-Card Dashboard </Typography>
            </Divider>

            <br />

            {/* Create a button with a link using 'CreateButtonWithLink' function */}
            <CreateButtonWithLink
                title='Create a new JC'
                to={`/jobcard`} >
                Create new Job-Card
            </CreateButtonWithLink>

            <br />

            <Grid container spacing={2} alignItems="center">

                <Grid item xs={8} container alignItems="center">
                    <Grid item sx={{ mr: 2 }}>
                        <FormControl sx={{ width: '200px' }}>
                            <InputLabel>Select Month-Year</InputLabel>
                            <Select
                                label="Month-Year"
                                type="text"
                                onChange={handleMonthYearOfJC}
                                value={jcMonthYear}
                            >
                                {jcMonthYearList.map((item, index) => (
                                    <MenuItem key={index} value={item}>{item}</MenuItem>
                                ))}

                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item >
                        <DateRangeFilter
                            onClickDateRangeSelectDoneButton={handleJCDateRangeChange}
                            onClickDateRangeSelectClearButton={handleJCDateRangeClear}
                        />

                    </Grid>
                </Grid>

                {/* Container for search bar aligned to the right */}
                <Grid item xs={4} container justifyContent="flex-end">
                    <SearchBar
                        placeholder='Search JC'
                        searchInputText={searchInputTextOfJC}
                        onChangeOfSearchInput={onChangeOfSearchInputOfJC}
                        onClearSearchInput={onClearSearchInputOfJC}
                    />
                </Grid>

            </Grid>



            <Box
                sx={{
                    height: 500,
                    width: '63%',
                    '& .custom-header-color': {
                        backgroundColor: '#0f6675',
                        color: 'whitesmoke',
                        fontWeight: 'bold',
                        fontSize: '15px',
                    },
                    mt: 2,
                }}
            >
                <DataGrid
                    rows={filteredJcData}
                    columns={columns}
                    sx={{ '&:hover': { cursor: 'pointer' } }}
                    onRowClick={(params) => editSelectedRowData(params.row)}
                    pageSize={5}
                    rowsPerPageOptions={[5, 10, 20]}
                />
            </Box>

        </>
    )
}
