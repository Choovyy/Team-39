"use client";
import BaseComponent from '@/Components/BaseComponent';
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import React, { useState, useEffect } from 'react';
import { Modal, Box, Typography, TextField, Button, FormControl, InputLabel, Select, MenuItem, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CampaignIcon from '@mui/icons-material/Campaign';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import Stack from '@mui/material/Stack';
import Autocomplete from '@mui/material/Autocomplete';
import './fullCalendarStyles.css';   
import { useUserContext } from '@/Contexts/AuthContext';
import { toast } from 'react-toastify';
import { Attendance, AttendanceDTO, AttendanceStatus, dpurple, lgreen, Meeting, MeetingStatus, QUEUEIT_URL, SPEAR_URL, Team, User, UserRetrieved, UserType } from '@/Utils/Global_variables';
import { capitalizeFirstLetter } from '@/Utils/Utility_functions';
import { useRouter } from 'next/navigation';
import { useQueueingManagerContext } from '@/Contexts/QueueingManagerContext';
import CatLoader from '@/Components/CatLoader';


const modalStyle = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 450,
    bgcolor: 'background.paper',
    boxShadow: 24,
    borderRadius: '10px',
};

const buttonStyles = {
    borderRadius: '10px',
    flex: 0.2,
    transition: 'background-color 0.3s',
    textTransform: 'none',
};

const cancelButtonStyles = {
    ...buttonStyles,
    backgroundColor: 'white',
    color: 'black',
    marginRight: '10px',
    '&:hover': {
        backgroundColor: '#5a0c9d',
        color: 'white',
    },
};

const confirmButtonStyles = {
    ...buttonStyles,
    backgroundColor: '#7d57fc',
    color: 'white',
    '&:hover': {
        backgroundColor: '#5a0c9d',
    },
};

interface CalendarEvent {
    meetingID: number | undefined | null
    start: Date | null | undefined
    end: Date | null | undefined
    meetingStatus: MeetingStatus
    teamName: string;
}

interface ManualAppointmentSetting{
    teamID: number
    teamName: string
    start: Date
    end: Date
    attendanceList: Array<Attendance>
    mentorID: number
    facultyName: string
    classroomID: number
}



export default function Page() {
    const userContext = useUserContext();
    const user = userContext.user;

    const [open, setOpen] = useState(false);
    const [meetingPackage, setMeetingPackage] = useState<ManualAppointmentSetting>();
    const [successModalOpen, setSuccessModalOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [appointments, setAppointments] = useState<CalendarEvent[]>([]);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [confirmationOpen, setConfirmationOpen] = useState(false);
    const router = useRouter();
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [eventDetailsModalOpen, setEventDetailsModalOpen] = useState(false);
    const {QueueingManager, setQueueingManager} = useQueueingManagerContext()
    const [loading,setLoading] = useState<boolean>(false)
    const [groupNames, setGroupNames] = useState<Array<string>>([])
    const [teams, setTeams] = useState<Array<Team>>([]);

    const fetchMemberDetails = (team:Team, groupName:string) => {
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
            
            setMeetingPackage((prev)=>({
                ...prev,
                "teamName":groupName,
                "teamID": team?.tid,
                "attendanceList":attendanceList,
                "mentorID":user?.uid,
                "facultyName":`${capitalizeFirstLetter(user?.firstname)} ${capitalizeFirstLetter(user?.lastname)}`,
                "classroomID":team.classId,
            }))
        });
    }

    const handleGroupNameInputChange = (groupName:string)=>{
        const team = teams.find((team)=>team.groupName == groupName)
        fetchMemberDetails(team, groupName)
        
    }
    useEffect(()=>{
        if(user?.role === UserType.FACULTY){
            fetch(`${SPEAR_URL}/team/mentored/${user.uid}`)
            .then(async(res)=>{
                if(res.ok){
                    const response:Array<Team> = await res.json();
                    response.map((team)=>{
                        setGroupNames((prev)=>[...prev, team.groupName])
                        setTeams(response)
                    })
                }else{
                    toast.error("Server error while fetching your mentees.")
                }
            })
            .catch((err)=>{
                console.log(err);
                toast.error("Caught an exception while fetching your mentees.")
            })
        }
    },[user])
    const daysOfWeek = {
        SUNDAY: 0,
        MONDAY: 1,
        TUESDAY: 2,
        WEDNESDAY: 3,
        THURSDAY: 4,
        FRIDAY: 5,
        SATURDAY: 6
    };
    function getDateForDayAtTime(dayName:string, timeString:string) {
        const now = new Date();
        const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        const targetDay = daysOfWeek[dayName]; // Convert input to uppercase
    
        // Calculate the difference in days
        const daysDifference = (targetDay - currentDay + 7) % 7; // Ensure it's always positive
    
        // If the target day is today, we want to set the time for today
        const targetDate = new Date(now);
        targetDate.setDate(now.getDate() + daysDifference);
    
        // Split the time string into hours, minutes, and seconds
        const [hours, minutes, seconds] = timeString.split(':').map(Number);
        
        // Set the time
        targetDate.setHours(hours, minutes, seconds, 0);
        
        return targetDate;
    }
    
    const startMeeting = (meetingID:number | undefined) =>{
        setLoading(true)
        fetch(`${QUEUEIT_URL}/meeting/teamMeetings/startAppointment/${meetingID}`)
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
            toast.error("Caught an exception while starting appointment.")
        })
        .finally(()=>{
            setLoading(false)
        })
    }

    useEffect(() => {
        if (teams) {
            const today = new Date().toLocaleString('en-US', { weekday: 'long' }).toUpperCase(); // Get today's day as a string
            teams
                .filter((team) => team.scheduledDay !== today) // Exclude teams scheduled for today
                .forEach((team) => { // Use forEach instead of map since you're not returning a new array
                    // console.log(getDateForDayAtTime(team.scheduledDay, team.start));
                    const appointment: CalendarEvent = {
                        "start": team.scheduledDay && team.start? getDateForDayAtTime(team.scheduledDay, team.start): null,
                        "end": team.scheduledDay && team.end? getDateForDayAtTime(team.scheduledDay, team.end):null,
                        "teamName": team.groupName,
                        "meetingStatus": MeetingStatus.SCHEDULED,
                        "meetingID": undefined
                    };
                    setAppointments((prev) => [...prev, appointment]);
                });
        }
    }, [teams]);

    // useEffect(()=>{
    //     if(teams){
    //         teams.map((team)=>{
    //             console.log(getDateForDayAtTime(team.scheduledDay,team.start))
    //             const appointment:CalendarEvent ={
    //                 "start":getDateForDayAtTime(team.scheduledDay,team.start),
    //                 "end":getDateForDayAtTime(team.scheduledDay,team.end),
    //                 "teamName":team.groupName, 
    //                 "meetingStatus":MeetingStatus.SET_AUTOMATED,
    //                 "meetingID":undefined
    //             }
    //             setAppointments((prev)=>[...prev, appointment])
    //         })
    //     }
        
    // },[teams])

    // useEffect(()=>{
    //     if(appointments){
    //         console.log(`Appointments updated:`)
    //         console.log(appointments)
    //     }
    // },[appointments])

    useEffect(() => { 
        if(user){
            fetch(`${QUEUEIT_URL}/meeting/teamMeetings/facultyAppointments/${user?.uid}`)
            .then(async(res)=>{
                if(res.ok){
                    
                    const response:Array<Meeting> = await res.json();
                    let foo:Array<CalendarEvent> = []
                    response.map((meeting)=>{
                        foo.push({
                            "end":new Date(meeting.end),
                            "start":new Date(meeting.start),
                            "meetingID":meeting.meetingID,
                            "meetingStatus":meeting.meetingStatus,
                            "teamName":meeting.teamName
                        })
                    })
                    setAppointments((prev)=>[...prev, ...foo])
                }else{
                    toast.error("Server error while fetching appointments")
                }
            })
            .catch((err)=>{
                console.log(err)
                toast.error("Caught an exception while fetching appointments.")
            })
        }
    }, [user]);

    useEffect(()=>{
        console.log(appointments)
    },[appointments])

    const formatDateForInput = (date) => {
        // Convert the date to the required format: yyyy-MM-ddTHH:mm
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const handleDateSelect = (selectInfo: any) => {
        if(new Date() > selectInfo.start){
            toast.error("Please refrain from selecting past times.")
        }else{
            const formattedStart = formatDateForInput(selectInfo.start)
            const formattedEnd = formatDateForInput(selectInfo.end)
            setMeetingPackage((prev)=>({
                ...prev,
                "start":formattedStart,
                "end":formattedEnd
            }))
            setOpen(true)
        }
    };

    const handleClose = () => {
        setOpen(false);
        setErrorMessage('');
    };

    const handleSubmit = () => {
        // console.log(meetingPackage)
        if(isFormValid()){
            fetch(`${QUEUEIT_URL}/meeting/teamMeetings/createAppointment`,{
                method:'POST',
                body:JSON.stringify(meetingPackage),
                headers:{
                    'Content-Type':'application/json'
                }
            })
            .then(async(res)=>{

                switch(res.status){
                    case 200:
                        const response:Meeting = await res.json();
                        const event:CalendarEvent = {
                            "start":new Date(response.start),
                            "end":new Date(response.end),
                            "meetingID":response.meetingID,
                            "meetingStatus":response.meetingStatus,
                            "teamName":response.queueingEntry.teamName
                        }
                        setAppointments((prev)=>[...prev,event])
                        setSuccessMessage('Session Created Successfully');
                        setSuccessModalOpen(true);
                        break;
                    case 400:
                        toast.error(await res.text());
                        break;
                    default:
                        toast.error("Server error.")
                }
            })
            .catch((err)=>{
                console.log(err)
                toast.error("Something went wrong.")
            })
            .finally(()=>{
                handleClose();
            })
        }
    };

    const handleSuccessClose = () => {
        setSuccessModalOpen(false);
    };

    const handleEventClick = (eventInfo: any) => { 
        // console.log("Event Info:", eventInfo);
 
        const selectedEvent:CalendarEvent = {
            meetingID:eventInfo.event._def.extendedProps.meetingID,
            start: eventInfo.event.start,
            end: eventInfo.event.end,
            meetingStatus: eventInfo.event._def.extendedProps.meetingStatus,
            teamName: eventInfo.event._def.extendedProps.teamName,
        };

        // console.log("Selected Event:", selectedEvent); 
        setSelectedEvent(selectedEvent);
        setEventDetailsModalOpen(true);
    };

    const handleCancelSession = () => {
        if (selectedEvent) { 
            fetch(`${QUEUEIT_URL}/meeting/teamMeetings/facultyAppointments/cancel/${selectedEvent.meetingID}`,{
                method:'POST'
            })
            .then(async(res)=>{
                switch(res.status){
                    case 200:
                        setAppointments((prev)=>
                            prev.filter((meeting)=>meeting.meetingID != selectedEvent.meetingID)
                        )
                        setConfirmationOpen(false);
                        setSuccessMessage('Session Cancelled Successfully');
                        setEventDetailsModalOpen(false);
                        setSuccessModalOpen(true);
                        break;
                    case 400:
                        const response = await res.text()
                        toast.error(response);
                        break;
                    default:
                        toast.error("Server error");
                }
            })
            .catch((err)=>{
                console.log(err)
                toast.error("Caught an exception while cancelling appointment.");
            })
            
        }
    };

    const isFormValid = () => {
        // Check if meetingPackage is defined
        if (!meetingPackage) {
            return false;
        }
    
        // Check if all required fields are defined and not empty
        const { teamID, teamName, start, end, attendanceList } = meetingPackage;
    
        return (
            teamID !== undefined &&
            teamName !== undefined && teamName.trim() !== '' &&
            start !== undefined &&
            end !== undefined &&
            Array.isArray(attendanceList) && attendanceList.length > 0
        );
    };

    if(loading || user == null || user.role !== UserType.FACULTY || !appointments){
        return(
            <CatLoader loading={loading || user == null || user.role !== UserType.FACULTY || !appointments}/>
        )
    }else{
        return (
            <div className='h-screen overflow-auto'>
                <BaseComponent>
                    <div className='border-2 border-black mt-5 rounded-xl bg-white p-10 md:p-6 sm:p-4 w-full max-h-[80vh] overflow-auto relative'>
                        <Typography className="text-center text-2xl md:text-xl sm:text-lg" variant='h5' fontWeight='bold' style={{ textAlign: 'center' }}>
                            Your Calendar Schedule
                        </Typography>
                        <div className="mx-auto overflow-x-auto" style={{ width: '95%' }} >
                            
                            <FullCalendar
                                allDaySlot={false}
                                selectOverlap={false}
                                slotMinTime='08:00:00'
                                slotMaxTime='18:00:00'
                                height="70vh"
                                plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
                                initialView="timeGridWeek"
                                selectable={true}
                                select={handleDateSelect}
                                events={appointments}
                                hiddenDays={[0]}
                                validRange={{
                                    start: new Date()
                                }}
                                headerToolbar={{
                                    start: 'timeGridWeek,timeGridDay',
                                    center: 'title',
                                    right: 'prev,next'
                                }}
                                eventContent={(eventInfo) => {
                                    // console.log(eventInfo)
                                    const startTime = eventInfo?.event?.start?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                    const endTime = eventInfo?.event?.end?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                    const meetingStatus = eventInfo.event.extendedProps.meetingStatus
                                    const groupName = eventInfo.event._def.extendedProps.teamName;
    
                                    return (
                                        <div style={{ whiteSpace: 'normal', overflowY: 'auto', textOverflow: 'ellipsis', color:meetingStatus === MeetingStatus.SET_MANUALLY ? '#fff':'#000' , 
                                        backgroundColor: meetingStatus === MeetingStatus.SET_MANUALLY ? dpurple:

                                        meetingStatus === MeetingStatus.STARTED_AUTOMATED 
                                        || meetingStatus === MeetingStatus.STARTED_FACULTY_INITIATED 
                                        || meetingStatus === MeetingStatus.STARTED_MANUALLY 
                                        || meetingStatus === MeetingStatus.STARTED_TEAM_INITIATED?'orange': 
                                        
                                        meetingStatus === MeetingStatus.ATTENDED_FACULTY_CONDUCTED
                                        || meetingStatus === MeetingStatus.FOLLOWUP_MEETING
                                        || meetingStatus === MeetingStatus.ATTENDED_SCHEDULE_CONDUCTED?'silver':lgreen, width: '100%', height:'100%', display:'flex', flexDirection:'column', padding:'0em 5px'}}>
                                            <Typography variant='caption'>{`${startTime} - ${endTime} `}</Typography>
                                            <Typography  fontWeight={"bold"}>{groupName}</Typography>
                                            <Typography color={meetingStatus === MeetingStatus.SET_MANUALLY?lgreen:dpurple} variant='caption' >{meetingStatus === MeetingStatus.SET_AUTOMATED?<>Scheduled</>:meetingStatus === MeetingStatus.SET_MANUALLY?<>Appointment</>:<></>}</Typography>
                                        </div>
                                    );
                                }}
                                eventClick={handleEventClick}
                            />
                        </div>
                    </div>
                </BaseComponent>
    
                <Modal open={open} onClose={handleClose}>
                    <Box sx={modalStyle}>
                        <Typography
                            variant="h6"
                            component="h2"
                            style={{
                                backgroundColor: '#7d57fc',
                                color: 'white',
                                fontWeight: 'bold',
                                padding: '25px',
                                borderRadius: '10px 10px 0 0',
                                textAlign: 'center',
                                width: '100%',
                            }}
                        >
                            Set Consultation or Presentation Session
                        </Typography>
                        <div style={{ padding: '3% 10% 10% 10%' }}>
                            <hr />
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '3px 0' }}>
                                <Typography variant="body1" style={{ textAlign: 'left' }}>
                                    Start Time:
                                </Typography>
                                <TextField
                                    type="datetime-local"
                                    disabled
                                    value={meetingPackage?.start}
                                    margin="normal"
                                    required
                                />
                            </div>
                            {errorMessage && (
                                <Typography variant="body1" style={{ color: 'red', marginBottom: '10px' }}>
                                    {errorMessage}
                                </Typography>
                            )}
                            <hr />
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '3px 0' }}>
                                <Typography variant="body1" style={{ textAlign: 'left' }}>
                                    End Time:
                                </Typography>
                                <TextField
                                    type="datetime-local"
                                    disabled
                                    value={meetingPackage?.end}
                                    margin="normal"
                                    required
                                />
                            </div>
                            <Stack spacing={2} >
                                <Autocomplete
                                    freeSolo
                                    options={groupNames}
                                    onInputChange={(event, newInputValue) => {
                                        handleGroupNameInputChange(newInputValue);
                                        // setGroupName(newInputValue);
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Enter Group Name"
                                            margin="normal"
                                            required
                                            InputProps={{
                                                ...params.InputProps,
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <SearchIcon />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    )}
                                />
                            </Stack>
                            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '25%' }}>
                                <Button 
                                    onClick={handleClose}
                                    sx={cancelButtonStyles}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={handleSubmit}
                                    style={{
                                        backgroundColor: isFormValid() ? '#7d57fc' : 'rgb(222, 213, 252)',
                                        color: 'white',
                                        borderRadius: '10px',
                                        flex: 0.2,
                                        transition: 'background-color 0.3s',
                                        textTransform: 'none',
    
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = isFormValid() ? '#5a0c9d' : 'rgb(222, 213, 252)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = isFormValid() ? '#7d57fc' : 'rgb(222, 213, 252)';
                                    }}
                                    disabled={!isFormValid()}
                                >
                                    Set
                                </Button>
                            </div>
                        </div>
                    </Box>
                </Modal>
     
                <Modal open={eventDetailsModalOpen} onClose={() => setEventDetailsModalOpen(false)}>
                    <Box sx={modalStyle}>
                        <Box
                            style={{
                                display: 'flex',
                                alignItems: 'center',  
                                justifyContent: 'space-between',  
                                backgroundColor: selectedEvent?.meetingStatus === MeetingStatus.SCHEDULED?lgreen:'#7d57fc',
                                color: selectedEvent?.meetingStatus === MeetingStatus.SCHEDULED?'black':'white',
                                fontWeight: 'bold',
                                borderRadius: '10px 10px 0 0',
                                padding: '25px', 
                                width: '100%',
                            }}
                        >
                            <Typography
                                variant="h6"
                                component="h2"
                                style={{
                                    textAlign: 'left',
                                    fontWeight: 'bold',
                                }}
                            >
                                Details
                            </Typography>
                            {[
                                MeetingStatus.SCHEDULED,
                                MeetingStatus.STARTED_AUTOMATED,
                                MeetingStatus.STARTED_FACULTY_INITIATED,
                                MeetingStatus.STARTED_MANUALLY,
                                MeetingStatus.STARTED_TEAM_INITIATED,
                                MeetingStatus.ATTENDED_FACULTY_CONDUCTED,
                                MeetingStatus.ATTENDED_SCHEDULE_CONDUCTED,
                                MeetingStatus.FOLLOWUP_MEETING
                                ].includes(selectedEvent?.meetingStatus) || (
                                    <Button
                                    variant="contained"
                                    onClick={() => startMeeting(selectedEvent?.meetingID)} 
                                    style={{
                                        backgroundColor: '#CCFC57',
                                        color: 'black',
                                        borderRadius: '5px',
                                        borderWidth: '1px',
                                        borderStyle: 'solid',
                                        borderColor: 'black',
                                        transition: 'background-color 0.3s',
                                        textTransform: 'none',
                                    }}
                                >
                                    <CampaignIcon style={{ marginRight: '8px' }} />
                                    Meet Now
                                </Button>
                            )}
                        </Box>
                        {selectedEvent && (
                            <div style={{ padding: '3% 10% 10% 10%' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                    <Typography variant="body1">Group Name: </Typography>
                                    <Typography variant="body1" style={{ textAlign: 'right', fontWeight: 'bold' }}>{selectedEvent.teamName}</Typography>
                                </div><hr />
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                    <Typography variant="body1">Date: </Typography>
                                    <Typography variant="body1" style={{ textAlign: 'right', fontWeight: 'bold' }}>
                                        {selectedEvent?.start?.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                    </Typography>
                                </div><hr />
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                    <Typography variant="body1">Start Time: </Typography>
                                    <Typography variant="body1" style={{ textAlign: 'right', fontWeight: 'bold' }}>
                                        {selectedEvent?.start?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Typography>
                                </div><hr />
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                    <Typography variant="body1">End Time: </Typography>
                                    <Typography variant="body1" style={{ textAlign: 'right', fontWeight: 'bold' }}>
                                        {selectedEvent?.end?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Typography>
                                </div>
                                {[
                                MeetingStatus.SCHEDULED,
                                MeetingStatus.STARTED_AUTOMATED,
                                MeetingStatus.STARTED_FACULTY_INITIATED,
                                MeetingStatus.STARTED_MANUALLY,
                                MeetingStatus.STARTED_TEAM_INITIATED,
                                MeetingStatus.ATTENDED_FACULTY_CONDUCTED,
                                MeetingStatus.ATTENDED_SCHEDULE_CONDUCTED,
                                MeetingStatus.FOLLOWUP_MEETING
                                ].includes(selectedEvent.meetingStatus) || (
                                <div style={{ display: 'flex', justifyContent: 'right', marginTop: '25%' }}>
                                    <Button
                                    variant="outlined"
                                    onClick={() => setConfirmationOpen(true)}
                                    style={{
                                        backgroundColor: '#7D57FC',
                                        color: 'white',
                                        borderRadius: '5px',
                                        borderWidth: '1px',
                                        borderStyle: 'solid',
                                        borderColor: 'black',
                                        transition: 'background-color 0.3s',
                                        textTransform: 'none',
                                    }}
                                    >
                                    <ClearRoundedIcon style={{ marginRight: '8px', fontSize: '1.3em' }} />
                                    Cancel Session
                                    </Button>
                                </div>
                                )}

                            </div>
                        )}
                    </Box>
                </Modal>
    
                <Modal open={successModalOpen} onClose={() => setSuccessModalOpen(false)}>
                    <Box sx={modalStyle}>
                        <div style={{ padding: '10% 10% 10% 10%', textAlign: 'center' }}>
                            <CheckCircleIcon style={{ color: '#7d57fc', fontSize: '50px' }} />
                            <Typography
                                variant="h6"
                                component="h2"
                                style={{
                                    color: 'black',
                                    padding: '25px',
                                    borderRadius: '10px 10px 0 0',
                                    textAlign: 'center',
                                    width: '100%',
                                }}
                            >
                                {successMessage}
                            </Typography>
                            <Button
                                variant="contained"
                                onClick={() => setSuccessModalOpen(false)}
                                style={{
                                    backgroundColor: '#7d57fc',
                                    color: 'white',
                                    borderRadius: '10px',
                                    flex: 0.2,
                                    transition: 'background-color 0.3s',
                                    textTransform: 'none',
                                }}
                            >
                                Close
                            </Button>
                        </div>
                    </Box>
                </Modal>
     
                <Modal
                    open={confirmationOpen}
                    onClose={() => setConfirmationOpen(false)}
                    aria-labelledby="confirmation-modal-title"
                    aria-describedby="confirmation-modal-description"
                >
                    <Box sx={modalStyle}>
                        <div style={{ padding: '10% 10% 10% 10%', textAlign: 'center' }}>
                            <Typography
                                id="confirmation-modal-title"
                                variant="h4"
                                component="h2"
                                style={{ color: '#7D57FC', padding: '0 25px', fontWeight:'bold' }}
                            >
                                Cancel Session
                            </Typography>
                            <Typography id="confirmation-modal-description" variant="body1" style={{ marginBottom: '40px' }}>
                                Are you sure you want to cancel this team's session?
                            </Typography>
                            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                                <Button
                                    onClick={() => setConfirmationOpen(false)}
                                    sx={cancelButtonStyles}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleCancelSession}
                                    sx={confirmButtonStyles}
                                >
                                    Confirm
                                </Button>
                            </Box>
                        </div>
                    </Box>
                </Modal>
    
            </div>
        );
    }
}