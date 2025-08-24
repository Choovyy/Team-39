"use client"
import React, { useEffect, useState } from 'react'
import BackButton from './BackButton'
import { Avatar, Button, CircularProgress, IconButton, Modal, Tooltip, Typography } from '@mui/material'
import { AnalyticsResult, DonutChartData, dpurple, lgreen, QUEUEIT_URL, ScatterChartData, SPEAR_URL, Team } from '@/Utils/Global_variables';
import { useRouter } from 'next/navigation';
import { useClassroomContext } from '@/Contexts/ClassroomContext';
import GroupBar from './GroupBar';
import { useTeamsContext } from '@/Contexts/TeamsContext';
import { toast } from 'react-toastify';

import medalOne from '../../public/images/1st_Place_Medal.png'
import medalTwo from '../../public/images/2nd_Place_Medal.png'
import medalThree from '../../public/images/3rd_Place_Medal.png'
import DonutChart from './DonutChart';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CatLoader from './CatLoader';
import DateRangePicker from './DateRangePicker';
import NotFound from './NotFound';
import brokenChain from '../../public/loaders/brokenchain.gif'

interface MeetingTableRow{
    facultyName:string
    groupName:string
    numFailedMeetings:number
    numGradedMeetings:number
    numUngradedMeetings:number
}


const GroupDetailAdviserView = () => {
    const {Teams, setTeams} = useTeamsContext();
    const classroomContext = useClassroomContext().classroom
    const [classroom, setClassroom] = useState(classroomContext)
    const [viewEnrolleesModalOpen, setViewEnrolleesModalOpen] = useState(false)
    const [analyticsData, setAnalyticsData] = useState<AnalyticsResult | undefined>()
    const [dummyAnalytics, setDummyAnalytics] = useState<AnalyticsResult | undefined>()
    const [dateRange, setDateRange] = useState("");
    const [startDate,setStartDate] = useState<string|undefined>();
    const [endDate, setEndDate] = useState<string|undefined>()
    const [meetingAnalytics, setMeetingAnalytics] = useState<Array<MeetingTableRow>>()
    const [filteredData, setFilteredData] = useState<Array<MeetingTableRow>>();
    const [filterInputString, setFilterInputString] = useState<string>("")

    
    useEffect(() => {
        if (dateRange !== "") {
            console.log(`Date Range: ${dateRange}`);
            const [startStr, endStr] = dateRange.split(" - ");
            const start = new Date(startStr);
            const end = new Date(endStr);
    
            // Start: 8 AM local = 00:00 UTC
            start.setHours(8, 0, 0, 0);
    
            // End: add 1 day, then set to 7 AM local = 23:00 UTC of previous day
            end.setDate(end.getDate() + 1);
            end.setHours(8, 0, 0, 0);
    
            setStartDate(start.toISOString());
            setEndDate(end.toISOString());
        }
    }, [dateRange]);
    
    

    useEffect(()=>{
        console.log(`start: ${startDate} \n end: ${endDate}`)
        fetch(`${QUEUEIT_URL}/faculty/meetingsTable/${classroom?.cid}`,{
            body:JSON.stringify({
                "start":startDate,
                "end":endDate
            }),
            method:'POST',
            headers:{
                'Content-Type':'application/json'
            }
        })
        .then(async(res)=>{
            if(res.ok){
                const response:Array<MeetingTableRow> = await res.json()
                setMeetingAnalytics(response)
            }else{
                const err_text = await res.text()
                console.log(err_text)
            }
        })
        .catch((err)=>{
            console.log(err)
        })
    },[startDate,endDate])

    
    const openViewEnrolleesModal = ()=>{
    setViewEnrolleesModalOpen(true)
    }
    const closeViewEnrolleesModal = ()=>{
    setViewEnrolleesModalOpen(false)
    }
    const router = useRouter()
    useEffect(()=>{
    if(classroomContext){
        setClassroom(classroomContext)
    }
    },[classroomContext,router])


    useEffect(()=>{
        if(classroom){
            fetch(`${SPEAR_URL}/classroom/team/${classroom?.cid}`)
            .then( async (res)=>{
                switch(res.status){
                    case 200:
                        const response:Array<Team> = await res.json(); 
                        setTeams(response)
                        break;
                    case 404:
                        setTeams(undefined)
                        break;
                    default:
                        toast.error("Server error")
                }
            })
            .catch((err)=>{
                toast.error("Caught an exception while fetching teams.")
                console.log(err)
            })

            fetch(`${QUEUEIT_URL}/faculty/classroomAnalytics/${classroom.cid}`)
            .then(async(res)=>{
                if(res.ok){
                    const response:AnalyticsResult = await res.json();
                    console.log(response)
                    const teacherNames = new Set<string>
                    // const studentIDs = new Set<number>
                    const teamNames = new Set<string>
                    Teams?.map((team)=>{
                        if(team.adviserName != null){
                            teacherNames.add(team.adviserName)
                        }
                        if(team.groupName != null){
                            teamNames.add(team.groupName)
                        }
                    })
                    teacherNames.forEach(name=>{
                        if(!response.pieChartData.labels.includes(name)){
                            response.pieChartData.labels.push(name);
                            response.pieChartData.datasets[0].backgroundColor.push('red')
                            response.pieChartData.datasets[0].data.push(0)
                        }
                    })
                    teamNames.forEach(teamName=>{
                        if(!response.scatterPlotDataset.datasets.filter(dataset => dataset.label == teamName).length){
                            response.scatterPlotDataset.datasets.push({
                                "backgroundColor":'red',
                                "data":[{
                                    "x":0,
                                    "y":0
                                }],
                                "label":teamName
                            })
                        }
                    })
                    setDummyAnalytics(response);
                }else{
                    console.log("Failed to retrieve analytics.")
                }
            })
            .catch((err)=>{
                console.log(err)
            })
        }
        
    },[classroom])

    useEffect(() => {
        const updateAnalytics = async () => {
            if (!dummyAnalytics) return;
            let foo: AnalyticsResult = JSON.parse(JSON.stringify(dummyAnalytics));
            const teacherNames = new Set<string>();
            const teamNames = new Set<string>();
    
            Teams?.forEach((team) => {
                if(team.adviserName){
                    teacherNames.add(team.adviserName);
                }
                teamNames.add(team.groupName);
            });
    
            for (const name of teacherNames) {
                if (!foo.pieChartData.labels.includes(name)) {
                    foo.pieChartData.labels.push(name);
                    foo.pieChartData.datasets[0].backgroundColor.push('red');
                    foo.pieChartData.datasets[0].data.push(0);
                }
            }
    
            for (const teamName of teamNames) {
                if (!foo.scatterPlotDataset.datasets.some(dataset => dataset.label === teamName)) {
                    foo.scatterPlotDataset.datasets.push({
                        "backgroundColor": 'red',
                        "data": [{ "x": 0, "y": 0 }],
                        "label": teamName
                    });
                }
            }
    
            console.log("Updated foo:", foo);
            setAnalyticsData(foo);
        };
    
        updateAnalytics();
    }, [dummyAnalytics, Teams]); 

    useEffect(() => {
        if (filterInputString === "") {
            setFilteredData(meetingAnalytics || []); 
        } else {
            const filtered = (meetingAnalytics || []).filter(item => 
                item.groupName.toLowerCase().includes(filterInputString.toLowerCase()) ||
                item.facultyName.toLowerCase().includes(filterInputString.toLowerCase())
            );
            setFilteredData(filtered); 
        }
    }, [filterInputString, meetingAnalytics]);
    

    if(!Teams && !analyticsData){
        return(
            <CatLoader loading={!Teams && !analyticsData}/>
        )
    }else{
        return (
            <div className='flex flex-col flex-grow w-full h-fit relative mt-5 rounded-md p-6 gap-6' style={{backgroundColor:'#F4F7FE'}}>
    
                {/* classroom general information */}
                <div className='h-fit flex w-full p-3 bg-dpurple justify-between items-center rounded-md'>
                    <div className='flex gap-12 items-center '>
                        <BackButton/>
                        <div className='flex flex-col gap-3'>
                        <Typography variant='h5' className='text-white text-lg font-bold'>{classroom?.courseDescription}</Typography>
                        <Typography variant='caption' className='text-white text-lg'>{`${classroom?.courseCode} - ${classroom?.section}`}</Typography>
                        </div>
                    </div>
                    <Button onClick={()=>{router.push("/dashboard/classroom/summary")}} sx={{backgroundColor:lgreen, color:'black', textTransform:'none', fontWeight:'bold', padding:'0.5em 2em'}}>Class Record</Button>
                </div>
    
                {Teams?
                    <>
                        {/* 2nd row charts */}
                        <div className='w-full flex gap-6'>
            
                            {/* team perfomance rankings */}
                            <div className='bg-white p-6 flex-1 rounded-md gap-12 flex flex-col'>
                                <Typography variant='h6' fontWeight={"bold"} textAlign={"center"}>{`Top Teams`}</Typography>
                                {analyticsData?.topTeams && (analyticsData?.topTeams[0]?.gradeAverage != 0 || analyticsData?.topTeams[0]?.gradeAverage != null || analyticsData?.topTeams[0]?.gradeAverage != undefined)?
                                    <div className='w-full flex items-end h-full '>
                                        {
                                            analyticsData?.topTeams.length >= 2 && analyticsData.topTeams[1].gradeAverage != 0?
                                            <div className='bg-gradient-to-b overflow-hidden from-dpurple to-white h-2/3 flex-1 relative rounded-md rounded-tr-none'>
                                                <img src={medalTwo.src} alt="2nd place medal" style={{margin:'0 auto'}}/>
                                                <div className='flex-grow flex flex-col items-center justify-center p-3'>
                                                    <Typography variant='caption' fontWeight={"bold"}>{analyticsData?.topTeams[1]?.teamName}</Typography>
                                                    <Typography variant='h6' fontWeight={"bold"}>{analyticsData?.topTeams[1]?.gradeAverage}</Typography>
                                                </div>
                                            </div>
                                            :
                                            <></>
                                        }
                                        <div className='bg-gradient-to-b overflow-hidden from-lgreen to-white h-full flex-1 relative rounded-md flex flex-col'>
                                            <img src={medalOne.src} alt="1st place medal" style={{margin:'0 auto'}}/>
                                            <div className='flex-grow flex flex-col items-center justify-center p-3'>
                                                <Typography variant='caption' fontWeight={"bold"}>{analyticsData?.topTeams[0]?.teamName}</Typography>
                                                <Typography variant='h6' fontWeight={"bold"}>{analyticsData?.topTeams[0]?.gradeAverage}</Typography>
                                            </div>
                                        </div>
                                        {
                                            analyticsData?.topTeams.length >= 3 && analyticsData.topTeams[2].gradeAverage != 0?
                                            <div className='bg-gradient-to-b overflow-hidden from-dpurple to-white h-1/2 flex-1 relative rounded-md rounded-tl-none'>
                                                <img src={medalThree.src} alt="3rd place medal" style={{margin:'0 auto'}}/>
                                                <div className='flex-grow flex flex-col items-center justify-center p-3'>
                                                    <Typography variant='caption' fontWeight={"bold"}>{analyticsData?.topTeams[2]?.teamName}</Typography>
                                                    <Typography variant='h6' fontWeight={"bold"}>{analyticsData?.topTeams[2]?.gradeAverage}</Typography>
                                                </div>
                                            </div>
                                            :
                                            <></>
                                        }
                                    </div>
                                    :
                                    <></>
                                }
                            </div>

                            <div className='bg-white flex-1 h-full py-6 overflow-hidden'>
                                <div className='w-full flex justify-between gap-3 items-end px-3 pb-2'>
                                    <input onChange={(e)=>{setFilterInputString(e.target.value)}} className='border rounded-md h-fit flex-1 p-2' type="text" name="filter" id="filter" placeholder='Filter'/>
                                    <div className='w-fit'>  
                                        <span className='flex'><CalendarMonthIcon fontSize='small'/><Typography variant='caption' >Date Filter</Typography></span>
                                        <DateRangePicker dateRange={dateRange} setDateRange={setDateRange}/>
                                    </div>
                                </div>
                                <div className='h-96 overflow-auto'>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                                        <thead>
                                            <tr>
                                                <th className='p-2 text-start bg-lgreen'>Group Name</th>
                                                <th className='p-2 text-start bg-lgreen'>Faculty Name</th>
                                                <th className='p-2 text-start bg-lgreen'>Meeting Sparkline</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredData?.map((item, index) => {
                                                const totalMeetings =
                                                    item.numFailedMeetings + item.numGradedMeetings + item.numUngradedMeetings;
                                                const failedWidth = (item.numFailedMeetings / totalMeetings) * 100;
                                                const gradedWidth = (item.numGradedMeetings / totalMeetings) * 100;
                                                const ungradedWidth = (item.numUngradedMeetings / totalMeetings) * 100;

                                            return (
                                                <tr key={index}>
                                                    <td className={`p-2 ${index%2!=0?'bg-slate-200':'bg-white'}`}>{item.groupName}</td>
                                                    <td className={`p-2 ${index%2!=0?'bg-slate-200':'bg-white'}`}>{item.facultyName}</td>
                                                    <td className={`p-2 ${index%2!=0?'bg-slate-200':'bg-white'}`}>
                                                        <div style={{ width: '100%', height: '10px', display: 'flex' }}>
                                                            <Tooltip title={`Failed Meetings: ${item.numFailedMeetings}`}>
                                                                <div
                                                                    style={{
                                                                    width: `${failedWidth}%`,
                                                                    backgroundColor: 'red',
                                                                    height: '100%',
                                                                    }}
                                                                ></div>
                                                            </Tooltip>
                                                            <Tooltip title={`Graded Meetings: ${item.numGradedMeetings}`}>
                                                                <div
                                                                    style={{
                                                                    width: `${gradedWidth}%`,
                                                                    backgroundColor: 'green',
                                                                    height: '100%',
                                                                    }}
                                                                ></div>
                                                            </Tooltip>
                                                            <Tooltip title={`Ungraded Meetings: ${item.numUngradedMeetings}`}>
                                                                <div
                                                                    style={{
                                                                    width: `${ungradedWidth}%`,
                                                                    backgroundColor: 'orange',
                                                                    height: '100%',
                                                                    }}
                                                                ></div>
                                                            </Tooltip>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>



                        <div className='flex gap-6 w-full h-fit' style={{height:'500px'}}>
                            <div className='bg-white p-6 rounded-md flex flex-col gap-6 flex-grow overflow-auto'>
                                    <Typography variant='h6' fontWeight={"bold"}>Teams</Typography>
                                    {Teams?.map((team,index)=>(
                                        <GroupBar key={index} team={team} index={index}/>
                                    ))}
                            </div>
                            <div className='bg-white p-6 rounded-md flex-1 h-full flex flex-col gap-6 w-1/3 aspect-square justify-center items-center'>
                                    {
                                        analyticsData?.pieChartData?
                                        <DonutChart chartData={analyticsData?.pieChartData} chartTitle='Mentor Performance'/>
                                        :
                                        <CircularProgress/>
                                    }
                            </div>
                        </div>
                    </>
                    :
                    <div className='bg-white flex-grow flex items-center justify-center'>
                        <NotFound>
                            <img src={brokenChain.src} alt="brokenChain" />
                            <Typography variant='h6'>Nothing to show. This classroom has no data yet. No teams, no queueing entries, no nothing.</Typography>
                            <Typography variant='caption' color='gray'>Here, let me get you back to the homepage.</Typography>
                        </NotFound>
                    </div>
                }
    
                
            </div>
        
        )
    }
}

export default GroupDetailAdviserView