import { Button, Typography } from '@mui/material'
import React from 'react' 
import { dpurple, lgreen } from '@/Utils/Global_variables'
import { useDownloadExcel } from 'react-export-table-to-excel'

const ExportToExcelButton = ({ onClick }) => { 

    const buttonStyles = {
        backgroundColor: lgreen,
        color: 'black',
        width: 'fit-content',
        padding: '1em 1.5em',
        textTransform: 'none',
        '&:hover': {
            backgroundColor: '#AEDB41',
            color: 'black',
        },
    }; 
    
    return (
        <Button sx={buttonStyles} onClick={(onClick)}>
            Export Table
        </Button>
    );
};

export default ExportToExcelButton;
