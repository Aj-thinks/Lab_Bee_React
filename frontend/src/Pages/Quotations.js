import React from 'react'
import { Box, Typography } from '@mui/material';
import QuotaionTemplates from '../templateQuotation/List';

const Quotations = () => {
    return (
        <div>
            <Typography variant='h5'> Quotations</Typography>
            <QuotaionTemplates />
        </div>
    )
}

export default Quotations;
