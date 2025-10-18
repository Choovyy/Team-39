import React, { useEffect, useRef, useState } from 'react'
import BackButton from './BackButton'   
import { randomGroupImage, randomSeason } from '@/Utils/Utility_functions'
import { useClassroomContext } from '@/Contexts/ClassroomContext'
import FacultyAvailabilityCard from './FacultyAvailabilityCard'
import PersonSearchIcon from '@mui/icons-material/PersonSearch'; 
import { AttendanceStatus, lgreen, MeetingStatus, QUEUEIT_URL, SPEAR_URL, UserRetrieved, dpurple, ProjectProposal, GroupAnalytics, MilestoneSet, SPEAR_FRONTEND_URL } from '@/Utils/Global_variables'
import { useUserContext } from '@/Contexts/AuthContext'
import PersonIcon from '@mui/icons-material/Person';
import MemberProfile from '@/Components/MemberProfile'
import { useTeamContext } from '@/Contexts/TeamContext'
import { toast } from 'react-toastify' 
import { Modal, Box, Typography, Button, IconButton, CircularProgress } from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { useMeetingsContext } from '@/Contexts/MeetingsContext'
import { useRouter } from 'next/navigation'
import { capitalizeFirstLetter} from '@/Utils/Utility_functions' 
import flag from '../../public/images/Programming Flag.png'
import catLoader from '../../public/loaders/catloader.gif'
import RadarChart from './RadarChart'
import HistogramChart from './Histogram'
import MilestoneProgressBar from './MilestoneProgressBar'
import { useMilestoneSetContext } from '@/Contexts/MilestoneSetContext'

const GroupDetailStudentView = () => {
    const classroomContext = useClassroomContext()
    const classroom = classroomContext.classroom
    const team = useTeamContext().Team
    const user = useUserContext().user
    const groupContext = useTeamContext()
    const {Meetings,setMeetings} = useMeetingsContext();
    const groupAvatar = useRef<string>(randomGroupImage())
    const [project, setProject] = useState<ProjectProposal | undefined>(undefined)
    const [mentor, setMentor] = useState<UserRetrieved | undefined>(undefined)
    const [season, setSeason] = useState<string>() 
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [teamAnalytics,setTeamAnalytics] = useState<GroupAnalytics | null | undefined>()
    const {MilestoneSet, setMilestoneSet} = useMilestoneSetContext()
    const router = useRouter();

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };



    const fetchCurrentStudentTeam = async ()=>{
        fetch(`${SPEAR_URL}/team/myTeam/${classroom?.cid}/${user?.uid}`)
            .then(async (data)=>{
                // console.log(data)
                if(data.ok){
                    const team_data = await data.json()
                    groupContext.setTeam(team_data)
                }else{
                    groupContext.setTeam(undefined)
                }
            })
            .catch((err)=>{
                console.log(err)
                toast.error("Something went wrong while fetching your team.")
            })
    }

    const fetchCurrentStudentMentor = async ()=>{
        fetch(`${SPEAR_URL}/get-teacher/${groupContext.Team?.adviserId}`)
            .then(async (data)=>{
                if(data.ok){
                    const mentor_data = await data.json()
                    setMentor(mentor_data)
                }
            })
            .catch((error)=>{
                console.log(error)
            })
    }

    const fetchCurrentStudentProject = async ()=>{
        fetch(`${SPEAR_URL}/proposals/class/${classroom?.cid}/student/${user?.uid}`)
            .then(async (data)=>{
                const project_data = await data.json()
                setProject(project_data)
            })
            .catch((err)=>{
                console.log(err)
                toast.error("Something went wrong while fetching your project proposals.")
            })
    }

    useEffect(()=>{
        if(team){
            fetch(`${QUEUEIT_URL}/meeting/teamMeetings/${team.tid}`)
            .then(async(res)=>{
                if(res.ok){
                    const response = await res.json();
                    // console.log(response)
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
    },[team])

    useEffect(()=>{
        fetchCurrentStudentTeam();
    },[])

    useEffect(()=>{
        if (groupContext.Team){
            fetchCurrentStudentProject()
        }
        setSeason(randomSeason())
        if(groupContext.Team?.adviserId){
            fetchCurrentStudentMentor()
        }
    },[groupContext.Team])

    useEffect(()=>{
        if(team){
            fetch(`${QUEUEIT_URL}/faculty/teamAnalytics/${team.tid}`)
            .then(async(res)=>{
                if(res.ok){
                    const response:GroupAnalytics = await res.json()
                    if(response.histogramData != null){
                        response.histogramData.datasets[0].label = "Number Of Presence in Meetings"
                    }

                    if(response.radarData != null){
                        response.radarData.datasets[0].label = "Grade"
                        response.radarData.datasets[0].fill = true
                    }
                    setTeamAnalytics(response)
                }else{
                    console.log(res.status)
                    setTeamAnalytics(null)
                }
            })
            .catch((err)=>{
                setTeamAnalytics(null)
                console.log(err)
            })


            fetch(`${QUEUEIT_URL}/milestone/getSet/${team.tid}`)
            .then(async(res)=>{
                if(res.ok){
                    const response:MilestoneSet = await res.json()
                    setMilestoneSet(response)
                }else{
                    const err_text = await res.text()
                    // console.log(err_text)
                                        setMilestoneSet({
                                                milestoneSetID: 0,
                                                teamID: team.tid,
                                                approverID: team?.adviserId ? team.adviserId : (classroom?.uid as number),
                                                milestones: [],
                                                teamName: team.groupName,
                                                approved: false,
                                                approvedDate: new Date().toISOString(),
                                                completionPercentage: 0
                                            });
                }
            })
            .catch((err)=>{
                console.log(err)
            })
        }else{
            setTeamAnalytics(null)
        }
    },[team])
 

    return (
        <>
            <div className='flex flex-col h-full relative z-2'>
                <div className='bg-dpurple w-full flex relative rounded-md items-center p-10 h-40'>
                    <BackButton/>
                    <div className='flex flex-col justify-start gap-2 flex-1 px-10 z-10'>
                        <p className='text-base md:lg:xl:text-3xl text-white font-bold' >{classroom?.courseDescription}</p>
                        <Typography variant='h6' color='white'>{classroom?.section}</Typography>
                    </div>
                    <img className='hidden md:block lg:block xl:block z-0' src={season} alt="season" style={{height:'250%', position:'absolute', bottom:0, right:0, zIndex:0}}/>
                </div>
                <div className='w-full flex flex-col md:lg:xl:flex-row py-5 gap-3 relative h-[calc(100vh*1.5)]'>
                    <div className='flex flex-col gap-3 w-full md:lg:xl:w-2/3 h-full'>
                        <div className='flex gap-3 flex-col md:lg:xl:flex-row'>
                            <div className='flex-1'>
                                <FacultyAvailabilityCard facultyID={classroom?.uid} facultyFirstname={classroom?.firstname} facultyLastname={classroom?.lastname} facultyDesignation='Adviser'/>
                            </div>
                            {
                                groupContext.Team && mentor?
                                <div className='flex-1'>
                                    <FacultyAvailabilityCard facultyID={mentor.uid} facultyFirstname={mentor.firstname} facultyLastname={mentor.lastname} facultyDesignation='Mentor'/>
                                </div>
                                :
                                <></>
                            }
                        </div>

                        {
                            team && MilestoneSet?.milestones?.length >0?
                            <div className='w-full'>
                                <MilestoneProgressBar/>
                            </div>
                            :
                            <></>
                        }
                        
                        <div className='bg-white w-100 border border-black rounded-md overflow-auto h-full'>
                            {Meetings?.length && team?
                                <div className='flex flex-col gap-3'>
                                    <div className='flex justify-between items-center bg-dpurple p-3'>
                                        <Typography variant='h6' fontWeight={"bold"} color='white' >Meeting History</Typography>
                                        {/* <IconButton size='small' onClick={()=>{router.push("/dashboard/classroom/group/summary")}} sx={{color:'black', backgroundColor:lgreen, borderRadius:'5px', display:'flex', gap:'5px', alignSelf:'center', '&:hover':{backgroundColor:'yellowgreen'}, textTransform:'none'}}><AssessmentIcon fontSize='small'/><p style={{fontSize:'16px'}}>Generate Summary</p></IconButton> */}
                                    </div>
                                    <div className='flex flex-col gap-3 '>
                                        {Meetings.map((historyEntry,index)=>(
                                            historyEntry.meetingStatus === MeetingStatus.ATTENDED_QUEUEING_CONDUCTED || historyEntry.meetingStatus === MeetingStatus.ATTENDED_FACULTY_CONDUCTED || historyEntry.meetingStatus === MeetingStatus.FOLLOWUP_MEETING?
                                            <div key={index} className='p-10 flex flex-col gap-3 border-b border-black'>
                                                <Typography variant='subtitle1' fontWeight={"bold"}>{`Meeting #${index + 1}`}</Typography>
                                                <Typography variant='caption' color='gray'>{new Date(historyEntry?.start).toDateString()}</Typography>
                                                <Typography variant='caption' color={historyEntry.meetingStatus === MeetingStatus.FOLLOWUP_MEETING?'warning':dpurple}>{historyEntry.meetingStatus}</Typography>
                                                <div className='flex flex-col md:lg:xl:flex-row gap-3'>
                                                    {historyEntry?.attendanceList.map((attendanceEntry,index)=>(
                                                        <div key={index} className={`${attendanceEntry.attendanceStatus == AttendanceStatus.ABSENT?'bg-notlushred':attendanceEntry.attendanceStatus == AttendanceStatus.LATE?'bg-notlushorange':'bg-notlushgreen'} rounded-md px-3 py-2`}>
                                                            <Typography fontWeight={"bold"} variant='caption'>{`${capitalizeFirstLetter(attendanceEntry.lastname)}, ${capitalizeFirstLetter(attendanceEntry.firstname)} `}</Typography>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className='flex flex-col gap-3'>
                                                    <Typography color='white' variant='caption' fontWeight={"bold"}>What will you do?</Typography>
                                                    <div className='w-full p-3 rounded-md max-h-48 overflow-auto border border-black'>
                                                        <Typography variant='subtitle2' sx={{lineHeight:'2.5em'}}>{historyEntry?.notedAssignedTasks || 'None recorded for this meeting session'}</Typography>
                                                    </div>
                                                </div>
                                                <div className='flex flex-col gap-3'>
                                                    <Typography color='white' variant='caption' fontWeight={"bold"}>Are there any impediments?</Typography>
                                                    <div className='w-full p-3 border border-black rounded-md max-h-48 overflow-auto'>
                                                        <Typography variant='subtitle2' sx={{lineHeight:'2.5em'}}>{historyEntry?.impedimentsEncountered || 'No impediments recorded'}</Typography>
                                                    </div>
                                                </div>
                                            </div>
                                            :
                                            <div key={index} className='p-10 flex justify-between items-center border-b border-black'>
                                                <div>
                                                    <Typography variant='subtitle1' fontWeight={"bold"}>{`Meeting #${index + 1}`}</Typography>
                                                    <Typography variant='caption' color='gray'>{new Date(historyEntry?.start).toDateString()}</Typography>
                                                </div>
                                                <div>
                                                    {historyEntry.meetingStatus === MeetingStatus.CANCELLED?
                                                        <Typography variant='caption' color='error' fontWeight={"bold"}>Mentor cancelled the appointment.</Typography>
                                                        :historyEntry.meetingStatus === MeetingStatus.FAILED_DEFAULTED?
                                                            <Typography variant='caption' color='error' fontWeight={"bold"}>Both parties did not show up on the agreed schedule.</Typography>
                                                            :historyEntry.meetingStatus === MeetingStatus.FAILED_FACULTY_NO_SHOW?
                                                                <Typography variant='caption' color='error' fontWeight={"bold"}>Mentor did not show up on the agreed schedule.</Typography>
                                                                :historyEntry.meetingStatus === MeetingStatus.FAILED_TEAM_NO_SHOW?
                                                                    <Typography variant='caption' color='error' fontWeight={"bold"}>Team did not show up on the agreed schedule.</Typography>
                                                                    :historyEntry.meetingStatus === MeetingStatus.SET_AUTOMATED?
                                                                        <Typography variant='caption' color='primary' fontWeight={"bold"}>System automated meeting is expected.</Typography>
                                                                        :historyEntry.meetingStatus === MeetingStatus.SET_MANUALLY?
                                                                            <Typography variant='caption' color='primary' fontWeight={"bold"}>Mentor created an appointment for {new Date(historyEntry.end).toDateString()}.</Typography>
                                                                            :
                                                                            <Typography variant='caption' color='success' fontWeight={"bold"}>Ongoing</Typography>
                                                    }
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            : 
                                <div style={{padding:'2em'}} className='flex items-center flex-col justify-center gap-3 h-full'>
                                    <img src={catLoader.src} alt="catLoader" style={{height:'150px'}} />
                                    <Typography variant='subtitle2' fontWeight={"bold"} color={dpurple}>The cat guardian has spawned. Guess this team has yet to conduct any meetings. </Typography>
                                </div> 
                            }
                        </div>
                    </div>
                    <div className=' flex-grow flex flex-col gap-3 h-full '>
                        <div onClick={handleOpenModal} className='flex-1 border border-black bg-white rounded-lg flex flex-col py-3 items-center justify-center'>
                            <Typography variant='subtitle1' fontWeight='bold' textAlign='center'>{groupContext.Team?<>Team {groupContext.Team.groupName}</>:<>Groups</>}</Typography>
                            <div className='flex flex-col items-center justify-center'>
                                {groupContext.Team?<img 
                                    src={groupAvatar.current} 
                                    alt="groupIcon" 
                                    className="w-24 h-24 object-cover rounded-full" 
                                />:<PersonSearchIcon sx={{fontSize:'5em'}}/>}
                                {groupContext.Team?
                                    // <Typography variant='h6' fontWeight='bold' textAlign='center'>{`[${groupContext.Team.projectName}]`}</Typography>
                                    <></>
                                    :
                                    <Typography variant='caption' color='gray' textAlign='center'>You have yet to find any group. Connect with others.</Typography>
                                }
                            </div>
                            {groupContext.Team?
                                <div className='w-full flex gap-3 items-end justify-center'>
                                    <PersonIcon sx={{fontSize:'2em'}}/> 
                                    <Typography sx={{textDecoration:'underline', fontWeight:'bold', cursor:'pointer'}}>{`${groupContext?.Team?.memberIds?.length} ${groupContext?.Team?.memberIds?.length > 1?'Members':'Member'}`}</Typography>
                                </div>
                                :
                                <Button onClick={()=>{router.push(SPEAR_FRONTEND_URL)}} className='w-fit self-center' sx={{backgroundColor:dpurple, color:'white', padding:'0.6em 1em'}}>Connect</Button>
                            }
                        </div>
                        {
                            team?
                            <div className=' flex-1 flex flex-col justify-center items-center gap-3 relative border border-black bg-white rounded-md py-3'>
                                <Typography variant='subtitle1' fontWeight={"bold"} textAlign={"center"}>Milestones</Typography>
                                <img src={flag.src} alt="flag" className='h-24 w-24 aspect-square' />
                                <Typography className='w-1/2' textAlign={"center"} variant='caption'>Manage your project's progress by adding and editing modules and submodules</Typography>
                                <Button onClick={()=>{router.push('/dashboard/classroom/milestone')}} sx={{backgroundColor:dpurple, color:'white', textTransform:'none'}}>Manage</Button>
                            </div>
                            :
                            <></>
                        }
                        {
                                team && teamAnalytics != null?
                                    <div className=' flex-1 border border-black bg-white rounded-lg flex flex-col py-3'>
                                        {teamAnalytics?.radarData?
                                            <RadarChart data={teamAnalytics?.radarData}/>
                                            :
                                            <CircularProgress size={'small'}/>
                                        }
                                    </div>
                                    :
                                    <></>
                        }
                        
                        {
                            team && teamAnalytics != null?
                            <div className=' flex-1 border border-black bg-white rounded-lg flex flex-col py-3'>
                                {teamAnalytics?.histogramData != null?
                                    <HistogramChart data={teamAnalytics.histogramData}/>
                                    :
                                    <CircularProgress size={'small'}/>
                                }
                            </div>
                            :
                            <></>
                        }

                    </div>
                </div>
            </div>

            <Modal open={isModalOpen} onClose={handleCloseModal}>
                <Box
                    onClick={handleCloseModal} // This ensures clicks outside the modal close it
                    className="flex items-center justify-center h-screen"
                >
                    
                    <Box
                        onClick={(e) => e.stopPropagation()} // Prevents closing when clicking inside the modal
                        className="flex flex-col items-center justify-center px-10 py-5 bg-white shadow-lg rounded-lg"
                    >
                        <Typography textAlign="center" variant="h3" fontWeight="bold" color="black">
                            Members
                        </Typography> 
                        <div className="flex gap-3 min-w-max mt-4">
                            {team?.memberIds?.length > 0 ? (
                                team.memberIds.map((member, index) => (
                                    <div key={index}>
                                        <MemberProfile memberID={member} />
                                    </div>
                                ))
                            ) : (
                                <Typography textAlign="center" color="gray">No members available</Typography>
                            )}
                        </div> 
                    </Box>
                </Box>
            </Modal> 
        </>
        
    )
}

export default GroupDetailStudentView