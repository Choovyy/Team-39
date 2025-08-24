"use client";
import BackButton from '@/Components/BackButton';
import BaseComponent from '@/Components/BaseComponent';
import { useUserContext } from '@/Contexts/AuthContext';
import { useReportSummaryContext } from '@/Contexts/ReportSummaryContext';
import { useTeamContext } from '@/Contexts/TeamContext';
import { Classes, dpurple, lgreen, QUEUEIT_URL, ReportSummaryEntry, SPEAR_URL } from '@/Utils/Global_variables';
import { capitalizeFirstLetter } from '@/Utils/Utility_functions';
import { Typography } from '@mui/material';
import React, { useEffect, useState, useRef } from 'react';
import { toast } from 'react-toastify';
import catLoader from '../../../../../../public/loaders/catloader.gif'
import CatLoader from '@/Components/CatLoader';
import ExportToExcelButton from '@/Components/ExportToExcelButton';
import { useDownloadExcel } from 'react-export-table-to-excel';

const Page = () => {
    const user = useUserContext().user;
    const team = useTeamContext().Team;
    const [classroom, setClassroom] = useState<Classes>();
    const { ReportSummary, setReportSummary } = useReportSummaryContext();
    const [uniqueNames, setUniqueNames] = useState<Set<string>>(new Set());
    const [uniqueMeetings, setUniqueMeetings] = useState<Set<number>>(new Set());
    const [table, setTable] = useState<string[][]>([]);
    const tableref= useRef(null)

    const loading = useUserContext().loading


    const fetchClassroom = () => {
        fetch(`${SPEAR_URL}/class/${team?.classId}`)
            .then(async (res) => {
                if (res.ok) {
                    const response = await res.json();
                    setClassroom(response);
                }
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const fetchReportSummary = () => {
        fetch(`${QUEUEIT_URL}/meeting/teamMeetings/generateSummary/${team?.tid}`)
            .then(async (res) => {
                if (res.ok) {
                    const response = await res.json();
                    setReportSummary(response);
                } else {
                    toast.error("Server error");
                }
            })
            .catch((err) => {
                toast.error("Caught an exception while fetching Report Summary");
            });
    };

    useEffect(() => {
        if (!classroom) {
            fetchClassroom();
        } else {
            if(team?.adviserId == user?.uid || (classroom.firstname == capitalizeFirstLetter(user?.firstname) && classroom.lastname == capitalizeFirstLetter(user?.lastname) ||  (user?.uid !== undefined && team?.memberIds?.includes(user.uid)) )){
                fetchReportSummary();
            }
        }
    }, [classroom]);

    useEffect(() => {
        if (ReportSummary) {
            const names = new Set<string>();
            const meetings = new Set<number>();
            ReportSummary.reportSummaryEntryList.forEach((entry) => {
                names.add(entry.studentName);
                meetings.add(entry.meetingNumber);
            });
            setUniqueNames(names);
            setUniqueMeetings(meetings);
        }
    }, [ReportSummary]);

    useEffect(() => {
        if (uniqueMeetings && uniqueNames && ReportSummary) {
            const meetingsArray = Array.from(uniqueMeetings);
            const namesArray = Array.from(uniqueNames);
            let matrix = [];

            for (let i = 0; i < meetingsArray.length + 2; i++) {
                const row = [];
                switch (i) {
                    case 0:
                        row.push("Names");
                        namesArray.forEach(name => row.push(name));
                        break;

                    case meetingsArray.length + 1:
                        row.push("Final Grade");
                        namesArray.forEach((name, colIndex) => {
                            let totalGrade = 0;
                            let count = 0;

                            matrix.forEach((dataRow, rowIndex) => {
                                if (rowIndex !== 0 && rowIndex !== meetingsArray.length + 1) {
                                    const grade = dataRow[colIndex + 1];
                                    if (typeof grade === 'number') {
                                        totalGrade += grade;
                                        count++;
                                    }
                                }
                            });

                            const average = count > 0 ? (totalGrade / count).toFixed(1) : "N/A";
                            row.push(average);
                        });
                        break;

                    default:
                        const meetingDate = ReportSummary.reportSummaryEntryList.find(item => item.meetingNumber === meetingsArray[i-1])?.meetingDate;
                        row.push(`Meeting #${meetingsArray[i - 1]} d ${new Date(meetingDate).toDateString()}`);
                        namesArray.forEach(name => {
                            const entry = ReportSummary.reportSummaryEntryList.find(
                                item => item.studentName === name && item.meetingNumber === meetingsArray[i - 1]
                            );
                            row.push(entry ? entry.gradeAverage : "N/A");
                        });
                }
                matrix.push(row);
            }

            setTable(matrix)
        }
    }, [uniqueMeetings, uniqueNames, ReportSummary]);

    const {onDownload} = useDownloadExcel({
        currentTableRef:tableref.current,
        filename:`${team?.groupName}_summary`,
        sheet:`${team?.groupName}`
    })

    if(loading || !team || !classroom){
        return(
            <CatLoader loading={loading || !team || !classroom}/>
        )
    }else{
        return (
            <BaseComponent>
                <div className='relative rounded-md bg-dpurple h-full p-6 flex flex-col overflow-hidden gap-10'>
                    <div className='flex gap-6 items-center'>
                        <div>
                            <BackButton />
                        </div>
                        <div className='flex flex-col gap-3'>
                            <Typography variant='h2' color='white' fontWeight="bold">{team?.groupName}</Typography>
                            <Typography variant='h6' color='white'>{`${classroom?.courseDescription} - ${classroom?.courseCode}`}</Typography>
                        </div>
                        <div className='ml-auto'>
                            <ExportToExcelButton onClick={onDownload}/>
                        </div>
                    </div>
                    {table && table.length > 0 && (
                        <div className='flex-1 bg-white overflow-auto relative'>
                            <table style={{ borderCollapse: 'separate', borderSpacing: '0em' }} className='h-full w-full bg-black' ref={tableref}>
                                <thead className='sticky top-0 z-10'>
                                    <tr className='h-28'>
                                        {table[0].map((header, index) => (
                                            <th key={index} style={{ width: '20em' }}>
                                                <div
                                                    style={{ backgroundColor: '#E9E2FF' }}
                                                    className={`flex-1 h-full flex items-center rounded-sm justify-center`}
                                                >
                                                    <Typography textAlign={'center'} variant={header === 'Names' ? 'h6' : 'caption'} fontWeight={header === 'Names' ? 'bold' : ''}>
                                                        {header}
                                                    </Typography>
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {table.slice(1, table.length - 1).map((row, rowIndex) => (
                                        <tr key={rowIndex} className='h-20'>
                                            {row.map((cell, cellIndex) => (
                                                <td key={cellIndex}>
                                                    <div 
                                                        className='flex-1 h-full rounded-sm flex justify-center items-center flex-col' 
                                                        style={{ backgroundColor: typeof cell === 'string' && cell.startsWith("Meeting") ? '#E9E2FF' : 'white' }}
                                                    >
                                                        <Typography variant='h6' fontWeight={"bold"}>
                                                            {
                                                                typeof cell === 'string' && cell.startsWith("Meeting")? (
                                                                    <>{cell.split('d')[0]}</>
                                                                )
                                                                :
                                                                <>{cell}</>
                                                            }
                                                        </Typography>
                                                        {typeof cell === 'string' && cell.startsWith("Meeting") ? (
                                                            <Typography variant='caption' color='gray'>
                                                                {cell.split('d')[1]}
                                                            </Typography>
                                                        ) : (
                                                            <></>
                                                        )}
                                                    </div>
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                    <tr>
                                        {table[table.length - 1].map((footerCell, index) => (
                                            <th className='bg-lgreen font-bold py-6' style={{ border: 'solid 1px black' }} key={index}>
                                                {footerCell}
                                            </th>
                                        ))}
                                    </tr>
                                </tbody>
                                {/* <tfoot>
                                    <tr>
                                        {table[table.length - 1].map((footerCell, index) => (
                                            <th className='bg-lgreen font-bold py-6' style={{ border: 'solid 1px black' }} key={index}>
                                                {footerCell}
                                            </th>
                                        ))}
                                    </tr>
                                </tfoot> */}
                            </table>
                        </div>
                    
                    )}
    
                </div>
            </BaseComponent>
        );
    }
};

export default Page;
