"use client";
import BackButton from '@/Components/BackButton';
import BaseComponent from '@/Components/BaseComponent';
import { useUserContext } from '@/Contexts/AuthContext';
import { useClassroomContext } from '@/Contexts/ClassroomContext';
import { Typography, TextField, InputAdornment, MenuItem, Select } from '@mui/material';
import React, { useState, useRef, useEffect } from 'react';
import { useDownloadExcel } from 'react-export-table-to-excel';
import SearchIcon from '@mui/icons-material/Search';
import ExportToExcelButton from '@/Components/ExportToExcelButton';
import { toast } from 'react-toastify';
import { dpurple, lgreen, QUEUEIT_URL } from '@/Utils/Global_variables';
import CatLoader from '@/Components/CatLoader';
import DateRangePicker from '@/Components/DateRangePicker';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

interface Row{
    studentName:string
    teamName:string
    gradeAverage:number
}

const Page = () => {
    const user = useUserContext().user;
    const { classroom } = useClassroomContext();
    const tableref = useRef(null);
    const [originalData, setOriginalData] = useState([]); 
    const [filteredData, setFilteredData] = useState<Array<Row>>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortCategory, setSortCategory] = useState("All Category");
    const loading = useUserContext().loading
    const [dateRange, setDateRange] = useState("");
    const [startDate,setStartDate] = useState<Date|undefined>();
    const [endDate, setEndDate] = useState<Date|undefined>()

    const fetchClassRecords = async () => {
        if (!classroom?.cid) return;
    
        try {
            const response = await fetch(`${QUEUEIT_URL}/faculty/generateClassRecord/${classroom.cid}`);
            if (response.ok) {
                const data = await response.json();
                setOriginalData(data); 
                setFilteredData(data);
            } else {
                toast.error("Failed to fetch class records");
            }
        } catch (error) {
            toast.error("Caught an exception while fetching class records");
        }
    };

    useEffect(()=>{
        if(dateRange!=""){
            setStartDate(new Date(dateRange.split('-')[0]))
            setEndDate(new Date(dateRange.split('-')[1]))
        }
    },[dateRange])

    React.useEffect(() => {
        fetchClassRecords();
    }, [classroom]);

    // Handle search functionality
    const handleSearch = (e) => {
        const value = e.target.value.toLowerCase();
        setSearchTerm(value);

        if (value === "") {
            setFilteredData(originalData); // Reset to original data if search term is empty
        } else {
            const filtered = originalData.filter(row =>
                row.studentName.toLowerCase().includes(value) ||
                row.teamName.toLowerCase().includes(value) ||
                row.gradeAverage.toString().includes(value)
            );
            setFilteredData(filtered);
        }
    };

    // Handle sorting functionality
    const handleSort = (event) => {
        const category = event.target.value;
        setSortCategory(category);
        let sortedData = [...filteredData];

        if (category === "All Category") {
            sortedData.sort((a, b) => a.studentName.localeCompare(b.studentName, undefined, { sensitivity: 'base' }));
        } else if (category === "Group Name") {
            sortedData.sort((a, b) => {
                const groupComparison = a.teamName.localeCompare(b.teamName, undefined, { sensitivity: 'base' });
                if (groupComparison !== 0) {
                    return groupComparison;
                }
                return a.studentName.localeCompare(b.studentName, undefined, { sensitivity: 'base' });
            });
        } else if (category === "Grade") {
            sortedData.sort((a, b) => (a.gradeAverage === "N/A" ? 1 : b.gradeAverage === "N/A" ? -1 : a.gradeAverage - b.gradeAverage));
        }
        setFilteredData(sortedData);
    };

    const { onDownload } = useDownloadExcel({
        currentTableRef: tableref.current,
        filename: `${classroom?.courseCode}_${classroom?.section}_classroomSummary`,
        sheet: `${classroom?.courseCode}_${classroom?.section}`
    });

    if(loading || !classroom){
        return(
            <CatLoader loading={loading || !classroom}/>
        )
    }else{
        return (
            <BaseComponent>
                <div className='relative rounded-md bg-dpurple p-6 flex flex-col gap-10'>
                    <div className='flex gap-6 items-center'>
                        <BackButton />
                        <div className='flex flex-col gap-3'>
                            <Typography variant='h2' color='white' fontWeight='bold'>Section Grades</Typography>
                            <Typography variant='h6' color='white'>Total Students: {filteredData.length}</Typography>
                        </div>
                        <div className='ml-auto'>
                            <ExportToExcelButton onClick={onDownload} />
                        </div>
                    </div>
                    <div className='flex justify-between items-center mb-4 p-4 bg-white rounded-md'>
                        <TextField
                            variant='outlined'
                            placeholder='Search...'
                            value={searchTerm}
                            onChange={handleSearch}
                            sx={{ width: '30%' }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position='start'>
                                        <SearchIcon />
                                    </InputAdornment>
                                )
                            }}
                        />
                        <Select
                            value={sortCategory}
                            onChange={handleSort}
                            displayEmpty
                            sx={{ minWidth: 150 }}
                        >
                            <MenuItem value="All Category">All Category</MenuItem>
                            <MenuItem value="Group Name">Group Name</MenuItem>
                            <MenuItem value="Grade">Grade</MenuItem>
                        </Select>
                    </div>
                    <div className='bg-white relative h-screen overflow-auto'>
                        <table className='w-full border-collapse' ref={tableref}>
                            <thead className='sticky top-0 z-10 bg-lgreen'>
                                <tr>
                                    <th className='p-4 border text-start'>STUDENT NAME</th>
                                    <th className='p-4 border text-start'>GROUP NAME</th>
                                    <th className='p-4 border'>GRADE</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.map((row, index) => (
                                    <tr key={index} className='border-b'>
                                        <td className='p-4 border'>{row.studentName}</td>
                                        <td className='p-4 border'>{row.teamName}</td>
                                        <td className={`p-4 border ${row.gradeAverage < 3?'text-red-500':''} text-center font-bold`}>{row.gradeAverage}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                </div>
            </BaseComponent>
        );
    }
};

export default Page;