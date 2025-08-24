"use client"
import BackButton from '@/Components/BackButton'
import BaseComponent from '@/Components/BaseComponent'
import { useTeamContext } from '@/Contexts/TeamContext'
import { Button, CircularProgress, IconButton, Tooltip, Typography } from '@mui/material'
import React, { useEffect, useRef, useState } from 'react'
import CampaignIcon from '@mui/icons-material/Campaign';
import { Attendance, AttendanceStatus, dpurple, GroupAnalytics, lgreen, MeetingStatus, MilestoneSet, QUEUEIT_URL, SPEAR_URL, User, UserRetrieved, UserType } from '@/Utils/Global_variables'
import MemberProfile from '@/Components/MemberProfile'
import '../group/group.css'
import { capitalizeFirstLetter, randomAvatar, randomQuotes } from '@/Utils/Utility_functions'
import mentorImage from '../../../../../public/images/mentor.png'
import { useUserContext } from '@/Contexts/AuthContext'
import { toast } from 'react-toastify'
import { useMeetingsContext } from '@/Contexts/MeetingsContext'
import catLoader from '../../../../../public/loaders/catloader.gif'
import AssessmentIcon from '@mui/icons-material/Assessment';
import { useRouter } from 'next/navigation'
import { useQueueingManagerContext } from '@/Contexts/QueueingManagerContext'
import CatLoader from '@/Components/CatLoader'
import ModifyAttendanceGradeEntry from '@/Components/ModifyAttendanceGradeEntry'
import HistogramChart from '@/Components/Histogram'
import RadarChart from '@/Components/RadarChart'
import { useMilestoneSetContext } from '@/Contexts/MilestoneSetContext'
import MilestoneProgressBar from '@/Components/MilestoneProgressBar'

interface MeetingPackage{
    attendanceList: Array<Attendance>
    teamName: string
    teamID: number
    mentorID: number
    facultyName: string
    classroomID: number
}

interface ModifyAttendanceGradeEntryProps{
    meetingID:number
    studentFirstname:string
    studentLastname:string
}





const page = () => {
    const user = useUserContext().user
    const team = useTeamContext().Team
    const [mentorAvatar, setMentorAvatar] = useState<string>()
    // const [meetings, setMeetings] = useState(1)
    const quote = useRef<string>(null)
    const [mentor, setMentor] = useState<User>()
    const {Meetings,setMeetings} = useMeetingsContext();
    const router = useRouter();
    const {QueueingManager, setQueueingManager} = useQueueingManagerContext()
    const {MilestoneSet, setMilestoneSet} = useMilestoneSetContext()
    const [teamAnalytics,setTeamAnalytics] = useState<GroupAnalytics>()
    
    useEffect(()=>{
        if(team){
            fetch(`${QUEUEIT_URL}/faculty/teamAnalytics/${team.tid}`)
            .then(async(res)=>{
                if(res.ok){
                    const response:GroupAnalytics = await res.json()
                    console.log(response)
                    response.histogramData.datasets[0].label = "Number Of Presence in Meetings"
                    response.radarData.datasets[0].label = "Performance Web"
                    setTeamAnalytics(response)
                }else{
                    console.log(res.status)
                }
            })
            .catch((err)=>{
                console.log(err)
            })

            fetch(`${QUEUEIT_URL}/milestone/getSet/${team.tid}`)
            .then(async(res)=>{
                if(res.ok){
                    const response:MilestoneSet = await res.json()
                    setMilestoneSet(response)
                }else{
                    setMilestoneSet(null)
                }
            })
            .catch((err)=>{
                console.log(err)
            })
        }
        
    },[team])

    useEffect(()=>{
        if(team?.adviserId){
            fetch(`${SPEAR_URL}/get-teacher/${team.adviserId}`,{
                method:"GET",
                headers:{
                    'Authorization': `Bearer ${user?.token}`
                }
            })
            .then(async(res)=>{
                switch(res.status){
                    case 200:
                        const response = await res.json()
                        setMentor(response)
                        setMentorAvatar(randomAvatar())
                        break;
                    case 404:
                        toast.error(`Faculty with ID: ${team.adviserId} not found.`)
                        break;
                    default:
                        console.log(res)
                        toast.error("Server error.");
                }
            })
            .catch((err)=>{
                console.log(err);
                toast.error("Caught an exception while fetching student details.")
            })
        }
    },[team])

    useEffect(()=>{
        quote.current = randomQuotes().quote
        if(team){
            fetch(`${QUEUEIT_URL}/meeting/teamMeetings/${team.tid}`)
            .then(async(res)=>{
                if(res.ok){
                    const response = await res.json();
                    console.log(response)
                    setMeetings(response)
                }else{
                    toast.error("Something went wrong while fetching meeting history.")
                }
            })
            .catch((err)=>{
                toast.error("Failed, caught an exception.")
                console.log(err)
            })
        }
    },[])

    const [loading,setLoading] = useState<boolean>(false)
    
    const meetNow = ()=>{
        setLoading(true)
        const memberPromises = team?.memberIds.map((memberID) => {
            return fetch(`${SPEAR_URL}/get-student/${memberID}`, {
                headers: {
                    'Authorization': `Bearer ${user?.token}`,
                    'Content-Type': 'application/json',
                },
                method: 'GET'
            })
            .then(response => response.json())
            .catch(err => {
                console.log(err)
                return null; // Return null in case of error
            });
        });
        Promise.all(memberPromises).then((data) => {
            let attendanceList:Array<Attendance> = []
            const uniqueMembers:Array<UserRetrieved> = data.filter((member: User) => member !== null && !attendanceList.some((m: User) => `${m.firstname} ${m.lastname}` === `${member.firstname} ${member.lastname}`));
            // console.log(uniqueMembers)
            uniqueMembers.map((member)=>{
                const attendance:Attendance = {
                    "attendanceStatus":AttendanceStatus.PRESENT,
                    "firstname":member.firstname,
                    "lastname":member.lastname,
                    "studentEmail":member.email
                }
                attendanceList.push(attendance);
            })

            const meetingPackage:MeetingPackage = {
                "teamName":team?.groupName,
                "teamID": team?.tid,
                "attendanceList":attendanceList,
                "mentorID":user?.uid,
                "facultyName":`${capitalizeFirstLetter(user?.firstname)} ${capitalizeFirstLetter(user?.lastname)}`,
                "classroomID":team?.classId
            }

            fetch(`${QUEUEIT_URL}/meeting/teamMeetings/spontaneous/${user?.uid}`,{
                body:JSON.stringify(
                    meetingPackage
                ),
                method:'POST',
                headers:{
                    'Content-Type':'application/json'
                }
            })
            .then(async(res)=>{
                if(res.ok){
                    if(!QueueingManager || QueueingManager.queueingManagerID != user?.uid){
                        fetch(`${QUEUEIT_URL}/faculty/getQueueingManager/${user?.role == UserType.FACULTY?user.uid:faculty?.uid}`)
                        .then(async(res)=>{
                            switch(res.status){
                                case 200:
                                    const response = await res.json()
                                    setQueueingManager(response)
                                    router.push("/queue")
                                    break;
                                default:
                                const responseText = await res.text()
                                toast.error(responseText)
                            }
                        })
                        .catch((err)=>{
                            console.log(`Fetching queueing manager error ${err}`)
                        })
                        .finally(()=>{
                            setLoading(false)
                        })
                    }
                }else{
                    const err_text = await res.text()
                    toast.error(err_text)
                }
            })
            .catch((err)=>{
                console.log(err)
                toast.error("Caught an exception")
            })
            .finally(()=>{
                setLoading(false)
            })
        });

        
    }

    const [editAttendanceAndGradeModalOpen, setEditAttendanceAndGradeModalOpen] = useState<boolean>(false)
    const [editAttendanceAndGradeModalProps, setAttendanceAndModalProps] = useState<ModifyAttendanceGradeEntryProps>()
    const handleAttendanceClick = (meetingID:number, studentFirstname:string, studentLastname:string)=>{
        setEditAttendanceAndGradeModalOpen(true)
        setAttendanceAndModalProps({
            "meetingID":meetingID,
            "studentFirstname":studentFirstname,
            "studentLastname":studentLastname,
        })
    }

    let attendedIndex = 0
    

    if(loading){
        <CatLoader loading={loading}/>
    }else{
        return (
            <BaseComponent>
                <div className='flex-grow relative pb-5 rounded-xl bg-black mt-5 gap-12'>
                    <div className='bg-dpurple flex flex-col p-5 pb-48 z-20 relative' style={{borderTopLeftRadius:'10px', borderTopRightRadius:'10px', borderBottomLeftRadius:'80px', borderBottomRightRadius:'80px'}}>
                        <div className='flex flex-col lg:flex-row xl:flex-row gap-10 justify-between items-start'>
                            <BackButton/>
                            <div className=' flex-1 flex flex-col self-center'>
                                <Typography variant='h4' color='white' fontWeight='bold'>{team?.groupName}</Typography>
                                <div className='text-white flex items-end gap-1'>
                                    <Typography variant='caption'>Consultation Schedule:</Typography>
                                    <Typography variant='subtitle2' fontWeight='bold'>{team?.scheduledDay} {team?.start} - {team?.end}</Typography>
                                </div>
                            </div>
                            <IconButton onClick={()=>{meetNow()}} sx={{color:'black', backgroundColor:lgreen, borderRadius:'5px', display:'flex', gap:'5px', alignSelf:'center', '&:hover':{backgroundColor:'yellowgreen'}}} >
                                <CampaignIcon/>
                                <p style={{fontSize:'16px'}}>Meet Now</p>
                            </IconButton>
                        </div>

                        <div className='pt-3 w-full'>
                            <Typography textAlign={"center"} variant='h4' fontWeight='bold' color='white'>Members</Typography>
                            <div className={`flex justify-center gap-3 w-full overflow-auto py-3`}>
                                {team?.memberIds.map((member, index)=>(
                                    <div key={index}>
                                        <MemberProfile  memberID={member}/>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {teamAnalytics?.histogramData != null && teamAnalytics.radarData != null?
                            <div className='w-full h-96 flex gap-3'>
                                <div className='flex-1 bg-white rounded-md flex justify-center items-center p-12'>
                                    {teamAnalytics?.histogramData?
                                        <HistogramChart data={teamAnalytics?.histogramData}/>
                                        :
                                        <CircularProgress/>
                                    }
                                </div>
                                <div className='flex-1 bg-white rounded-md flex justify-center items-center p-12'>
                                    {teamAnalytics?.radarData?
                                        <RadarChart data={teamAnalytics?.radarData}/>
                                        :
                                        <CircularProgress/>
                                    }
                                </div>
                            </div>
                            :<></>
                        }
                        {
                            MilestoneSet != null?
                            <div className='w-full py-3 z-10'>
                                <MilestoneProgressBar/>
                            </div>
                            :
                            <></>
                        }
                    </div>
                    <div className='relative'>
                        <div className='relative z-50 px-5'>
                            <div className='bg-lgreen w-full md:w-1/2 lg:w-1/2 xl:w-1/2 rounded-full h-44 z-50 relative flex items-center justify-center' style={{marginTop:'-90px', justifySelf:'center'}}>
                                {mentor?
                                    <div className='w-full h-full p-5 flex justify-start items-center relative'>
                                        <span className='w-1/2 md:text-center lg:text-center xl:text-center1'>
                                            <Typography variant='h6' fontWeight='bold'>{`${capitalizeFirstLetter(mentor.firstname)} ${capitalizeFirstLetter(mentor.lastname)}`}</Typography>
                                            <Typography variant='subtitle2'>Mentor</Typography>
                                        </span>
                                        <img src={mentorImage.src} alt="mentor" style={{height:'200%', position:'absolute', right:0,bottom:0, marginBottom:'-86px', marginRight:'-50px', zIndex:-1}} />
                                    </div> 
                                    :
                                    <div className='flex flex-col gap-3 p-5 text-center'>
                                        <Typography variant='h6'>{`"${quote.quote}"`}</Typography>
                                        <Typography variant='caption' fontWeight='bold'>{`-${quote.author}`}</Typography>
                                    </div>
                                }
                            </div>
                        </div>
                        <div className='h-24 z-10 bg-black absolute w-full' style={{marginTop:'-90px'}}>
                            
                        </div>

                        <div className='bg-black w-full relative pt-10 p-5 flex flex-col gap-6'>
                            <IconButton onClick={()=>{router.push("/dashboard/classroom/group/summary")}} sx={{color:'black', backgroundColor:lgreen, borderRadius:'5px', display:'flex', gap:'5px', alignSelf:'end', '&:hover':{backgroundColor:'yellowgreen'}, textTransform:'none'}}><AssessmentIcon fontSize='small'/><p style={{fontSize:'16px'}}>Generate Summary</p></IconButton>
                            {Meetings?.map((historyEntry, index) => {
                                const isAttended = historyEntry.meetingStatus === MeetingStatus.ATTENDED_QUEUEING_CONDUCTED || 
                                                historyEntry.meetingStatus === MeetingStatus.ATTENDED_FACULTY_CONDUCTED ||
                                                historyEntry.meetingStatus === MeetingStatus.FOLLOWUP_MEETING;

                                return isAttended ? (
                                    <div key={index} style={{ backgroundColor: '#1D1D1C' }} className="p-10 flex flex-col gap-3 rounded-md">
                                        <Typography color={lgreen} variant="h4" fontWeight="bold">
                                            {`Meeting #${++attendedIndex}`} {/* Increment only for attended meetings */}
                                        </Typography>
                                        <Typography variant="h6" color="white">{new Date(historyEntry?.start).toDateString()}</Typography>
                                        <Typography variant='caption' color={historyEntry.meetingStatus === MeetingStatus.FOLLOWUP_MEETING?'warning':dpurple}>{historyEntry.meetingStatus}</Typography>
                                        <div className="flex gap-3">
                                            {historyEntry?.attendanceList.map((attendanceEntry, idx) => (
                                                <Tooltip 
                                                    key={idx} 
                                                    title="Click to edit" 
                                                    onClick={() => handleAttendanceClick(historyEntry.meetingID, attendanceEntry.firstname, attendanceEntry.lastname)}
                                                >
                                                    <div 
                                                        className={`cursor-pointer ${
                                                            attendanceEntry.attendanceStatus === AttendanceStatus.ABSENT 
                                                                ? 'bg-notlushred' 
                                                                : attendanceEntry.attendanceStatus === AttendanceStatus.LATE 
                                                                ? 'bg-notlushorange' 
                                                                : 'bg-notlushgreen'
                                                        } rounded-md px-3 py-2`}
                                                    >
                                                        <Typography>{`${capitalizeFirstLetter(attendanceEntry.lastname)}, ${capitalizeFirstLetter(attendanceEntry.firstname)}`}</Typography>
                                                    </div>
                                                </Tooltip>
                                            ))}
                                        </div>
                                        <div className="flex flex-col gap-3">
                                            <Typography color="white" variant="h6" fontWeight="bold">What will you do?</Typography>
                                            <div className="w-full p-3 border-2 border-white max-h-48 overflow-auto" style={{ backgroundColor: 'black', color: 'white' }}>
                                                <Typography variant="subtitle2" sx={{ lineHeight: '2.5em' }}>
                                                    {historyEntry?.notedAssignedTasks || 'None recorded for this meeting session'}
                                                </Typography>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-3">
                                            <Typography color="white" variant="h6" fontWeight="bold">Are there any impediments?</Typography>
                                            <div className="w-full p-3 border-2 border-white max-h-48 overflow-auto" style={{ backgroundColor: 'black', color: 'white' }}>
                                                <Typography variant="subtitle2" sx={{ lineHeight: '2.5em' }}>
                                                    {historyEntry?.impedimentsEncountered || 'No impediments recorded'}
                                                </Typography>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div key={index} style={{ backgroundColor: '#1D1D1C' }} className="p-10 flex justify-between items-center rounded-md">
                                        <div>
                                            {/* <Typography color={lgreen} variant="h4" fontWeight="bold">{`Meeting #${index + 1}`}</Typography> */}
                                            <Typography variant="h6" color="gray">{new Date(historyEntry?.attendanceList[0].attendanceDate).toDateString()}</Typography>
                                        </div>
                                        <div>
                                            {historyEntry.meetingStatus === MeetingStatus.CANCELLED ? (
                                                <Typography variant="caption" color="error" fontWeight="bold">Mentor cancelled an appointment on {new Date(historyEntry.start).toDateString()}.</Typography>
                                            ) : historyEntry.meetingStatus === MeetingStatus.FAILED_DEFAULTED ? (
                                                <Typography variant="caption" color="error" fontWeight="bold">Both parties did not show up on the agreed schedule.</Typography>
                                            ) : historyEntry.meetingStatus === MeetingStatus.FAILED_FACULTY_NO_SHOW ? (
                                                <Typography variant="caption" color="error" fontWeight="bold">Mentor did not show up on the agreed schedule.</Typography>
                                            ) : historyEntry.meetingStatus === MeetingStatus.FAILED_TEAM_NO_SHOW ? (
                                                <Typography variant="caption" color="error" fontWeight="bold">Team did not show up on the agreed schedule.</Typography>
                                            ) : historyEntry.meetingStatus === MeetingStatus.SET_AUTOMATED ? (
                                                <Typography variant="caption" color="primary" fontWeight="bold">System automated meeting is expected.</Typography>
                                            ) : historyEntry.meetingStatus === MeetingStatus.SET_MANUALLY ? (
                                                <Typography variant="caption" color="primary" fontWeight="bold">Mentor created an appointment for {new Date(historyEntry.end).toDateString()}.</Typography>
                                            ) :(
                                                <Typography variant="subtitle2" color="success" fontWeight="bold">Ongoing</Typography>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
                <ModifyAttendanceGradeEntry open={editAttendanceAndGradeModalOpen} setOpen={setEditAttendanceAndGradeModalOpen} props={editAttendanceAndGradeModalProps}/>
            </BaseComponent>
        )
    }
}

export default page
