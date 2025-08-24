import React from 'react'
import Chat from '@/Components/Chat'
import CurrentlyTending from '@/Components/CurrentlyTending'
import LetThemInModal from '@/Components/LetThemInModal'
import MeetingBoard from '@/Components/MeetingBoard'
import QueueingList from '@/Components/QueueingList'
import StopQueueingButton from '@/Components/StopQueueingButton'
import { faculty, queueingManager1 } from '@/Sample_Data/SampleData1'
import { useUserContext } from '@/Contexts/AuthContext'
import { AttendanceStatus, Classes, Grade, QueueingManager, QUEUEIT_URL, UserType } from '@/Utils/Global_variables'
import { capitalizeFirstLetter, isPastTime, standardizeTime } from '@/Utils/Utility_functions'
import { useState } from 'react'
import { toast } from 'react-toastify'
import { useQueueingManagerContext } from '@/Contexts/QueueingManagerContext'
import { useRouter } from 'next/navigation'
import { useGradesContext } from '@/Contexts/GradesContext'

const QueueingPageFacultyView = () => {
    const user = useUserContext().user
    const [queueingLimit, setQueueingLimit] = useState(0)
    const [queueingFilter, setQueueingFilter] = useState<Array<Classes>>([])
    const [open, setOpen] = useState(false);
    const router = useRouter()
    const [timeStop, setTimeStop] = useState(0)
    const queueingManager = useQueueingManagerContext().QueueingManager
    const setQueueingManager = useQueueingManagerContext().setQueueingManager
    const grades = useGradesContext().Grades
    const setGrades = useGradesContext().setGrades
    const [notedAssignedTasks, setNotedAssignedTasks] = useState("")
    const [impedimentsEncountered, setImpedimentsEncountered] = useState("")
    const [isFollowUp, setIsFollowUp] = useState<boolean>(false)
    const openQueueing = ()=>{
        if(queueingManager?.isActive){
            toast.error("Queueing is already open.", {autoClose:2000, style:{fontWeight:'bold'}});
        }else{
            if(isPastTime(timeStop) && timeStop != 0){
                toast.error("Time limit value is past time.")
            }else if(queueingLimit < 0){
                toast.error("Queueing limit is a negative number")
            }else{

                const cateredClassrooms:Array<number> = []
                queueingFilter.map((classroom)=>{
                    cateredClassrooms.push(classroom.cid)
                })
                console.log(cateredClassrooms)
                console.log(`timeStop: ${timeStop === 0? '0':standardizeTime(timeStop)} queueingLimit: ${queueingLimit} filter: ${cateredClassrooms}`)
                fetch(`${QUEUEIT_URL}/faculty/openQueueing`,{
                    body:JSON.stringify({
                        "facultyID":user?.uid,
                        "timeEnds":timeStop === 0? null:standardizeTime(timeStop),
                        "cateringLimit":queueingLimit,
                        "cateredClassrooms":cateredClassrooms,
                        "facultyName":`${capitalizeFirstLetter(user?.firstname)} ${capitalizeFirstLetter(user?.lastname)}`
                    }),
                    method:'POST',
                    headers:{
                        'Content-Type':'application/json'
                    }
                })
                .then((res)=>{
                    if(res.ok){
                        
                        fetch(`${QUEUEIT_URL}/faculty/getQueueingManager/${user?.role == UserType.FACULTY?user.uid:classroom?.uid}`)
                        .then(async(res)=>{
                            const response = await res.json()
                            setQueueingManager(response)
                            toast.success("Queueing opened.")  
                            setQueueingLimit(0)
                            setQueueingFilter([])
                            setTimeStop(0)
                        })
                        .catch((err)=>{
                        console.log(`Fetching queueing manager error ${err}`)
                        })
                        setOpen(false)
                    }
                })
                .catch((err)=>{
                    console.log(err)
                })
            }
        }
    }

    const closeQueueing = ()=>{
        fetch(`${QUEUEIT_URL}/faculty/closeQueueing/${user?.uid}`,{
            method:'POST',
            headers:{
                'Content-Type':'application/json'
            }
        })
        .then((res)=>{
            if(res.ok){
                toast.success(`Queueing closed.`)
                setQueueingManager(null)
                setQueueingFilter([])
            }
        })
    }

    const removeTeamFromQueue = (queueingEntryID:number) =>{
        if(queueingEntryID){
                    fetch(`${QUEUEIT_URL}/queue/dequeue`,{
                        body:JSON.stringify({
                            "queueingEntryID":queueingEntryID
                        }),
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        method:'POST'
                    })
                    .then( async (res)=>{
                        switch(res.status){
                            case 200:
                                toast.success("Dequeued from the line.")
                                break;
                            case 404:
                                const text = await res.text()
                                toast.error(text)
                                break;
                            default:
                                toast.error("Server error")
                        }
                    })
                    .catch((err)=>{
                        toast.error("Something went wrong while dequeueing.")
                        console.log(err)
                    })
                }else{
                    toast.error("Queueing Entry you're trying to remove is not found in the line.")
                }
    }

    const admitQueueingEntry = (queueingEntryID:number) =>{
        if(queueingEntryID){
            fetch(`${QUEUEIT_URL}/faculty/admitQueueingEntry`,{
                body:JSON.stringify({
                    "queueingEntryID":queueingEntryID
                }),
                headers: {
                    'Content-Type': 'application/json'
                },
                method:'POST'
            })
            .then( async (res)=>{
                switch(res.status){
                    case 200:
                        toast.success("Meeting started.")
                        break;
                    case 404:
                        const text = await res.text()
                        toast.error(text)
                        break;
                    default:
                        toast.error("Server error")
                }
            })
            .catch((err)=>{
                toast.error("Something went wrong during admittance.")
                console.log(err)
            })
        }else{
            toast.error("Queueing Entry you're trying to admit is not found in the line.")
        }
    }

    const updateAttendanceStatus = (studentEmail: string) => {
        if (queueingManager?.meeting?.queueingEntry?.attendanceList) {
            // Create a new attendance list without mutating the original
            const updatedAttendanceList = queueingManager.meeting.queueingEntry.attendanceList.map((attendance) => 
                attendance.studentEmail === studentEmail
                    ? {
                        ...attendance,
                        attendanceStatus: 
                            attendance.attendanceStatus === AttendanceStatus.PRESENT
                                ? AttendanceStatus.ABSENT
                                : attendance.attendanceStatus === AttendanceStatus.ABSENT
                                ? AttendanceStatus.LATE
                                : AttendanceStatus.PRESENT
                    }
                    : attendance
            );
    
            // Create a new queueingManager object to avoid mutation
            const updatedQueueingManager = {
                ...queueingManager,
                meeting: {
                    ...queueingManager.meeting,
                    queueingEntry: {
                        ...queueingManager.meeting.queueingEntry,
                        attendanceList: updatedAttendanceList
                    }
                }
            };
    
            // Update the context with the new queueingManager
            setQueueingManager(updatedQueueingManager);
        } else {
            console.error('Attendance list not found');
        }
    };

    const concludeMeeting = ()=>{
        if(grades?.length == 0 && isFollowUp === false){
            toast.error("You have yet to grade anybody. If this meeting has no grades, check the is follow up checkbox below.")
        }else{
            console.log(queueingManager?.meeting?.queueingEntry.attendanceList)
            console.log(isFollowUp)
            fetch(`${QUEUEIT_URL}/faculty/concludeMeeting/${queueingManager?.meeting?.meetingID}`,{
                body:JSON.stringify({
                    grades:grades,
                    notedAssignedTasks:notedAssignedTasks,
                    impedimentsEncountered:impedimentsEncountered,
                    attendanceList:queueingManager?.meeting?.queueingEntry.attendanceList,
                    queueingManagerID:queueingManager?.queueingManagerID,
                    isFollowup:isFollowUp ?? false
                }),
                method:'POST',
                headers:{
                    'Content-Type':'application/json'
                }
            })
            .then( async (res)=>{
                switch(res.status){
                    case 200:
                        setGrades(undefined);
                        toast.success("Meeting concluded.")
                        break;
                    case 400:
                        const text = await res.text()
                        console.log(res)
                        toast.error(text)
                        break;
                    default:
                        toast.error("Server error")
                }
            })
            .catch((err)=>{
                toast.error("Something went wrong during admittance.")
                console.log(err)
            })
        }
    }

    return (
        <div>
            {user?.role == UserType.FACULTY && (queueingManager?.meeting || queueingManager?.isActive)?
                <div className='relative min-h-screen pt-5 flex-grow flex flex-col md:flex-row lg:flex-row xl:flex-row w-full gap-3'>
                    <div className='w-full md:w-1/4 lg:w-1/4 xl:w-1/4 flex-grow flex flex-col gap-3' style={{minWidth:'350px'}}>
                        <StopQueueingButton closeQueueing={closeQueueing} />
                        <QueueingList admitQueueingEntry={admitQueueingEntry} dequeue={removeTeamFromQueue} teams={queueingManager?.queueingEntries}/>
                    </div>
                    <div className='flex flex-col w-full gap-3' style={{minWidth:'300px'}}>
                        <CurrentlyTending concludeMeeting={concludeMeeting} meeting={queueingManager.meeting} />
                        {
                            queueingManager.meeting?
                            <MeetingBoard isFollowUp={isFollowUp} setIsFollowUp={setIsFollowUp} setImpedimentsEncountered={setImpedimentsEncountered} setNotedAssignedTasks={setNotedAssignedTasks} updateAttendanceStatus={updateAttendanceStatus} meeting={queueingManager.meeting}/>
                            :
                            <Chat adviser={user} chat={null}/>
                        }
                        
                        
                    </div>
                </div>
                :
                <LetThemInModal open={open} setOpen={setOpen} openQueueing={openQueueing} queueingFilter={queueingFilter} setIsQueueing={queueingManager?.isActive} setQueueingFilter={setQueueingFilter} setQueueingLimit={setQueueingLimit} setTimeStop={setTimeStop}/>
            }
        </div>
    )
}

export default QueueingPageFacultyView
