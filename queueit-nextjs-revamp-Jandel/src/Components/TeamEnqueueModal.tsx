"use client"
import { useUserContext } from '@/Contexts/AuthContext'
import { useTeamContext } from '@/Contexts/TeamContext'
import { Attendance, AttendanceStatus, dpurple, QUEUEIT_URL, SPEAR_URL, User, UserRetrieved } from '@/Utils/Global_variables'
import { Button, Modal, Stack, Typography } from '@mui/material'
import React, { useEffect, useRef, useState } from 'react'
import AttendanceLogger from './AttendanceLogger'
import { useClassroomContext } from '@/Contexts/ClassroomContext'
import { toast } from 'react-toastify'
import { useFacultyContext } from '@/Contexts/FacultyContext'

interface StudentEnqueueModalProps {
    modalToggle: boolean
    setModalToggle: Function
}

const StudentEnqueueModal: React.FC<StudentEnqueueModalProps> = ({ modalToggle, setModalToggle }) => {
    const user = useUserContext().user
    const team = useTeamContext().Team
    const classroom = useClassroomContext().classroom
    const [attendanceList, setAttendanceList] = useState<Array<Attendance>>([])
    const faculty = useFacultyContext().Faculty
    const fetchMemberDetails = () => {
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
            const uniqueMembers:Array<UserRetrieved> = data.filter((member: User) => member !== null && !attendanceList.some((m: User) => `${m.firstname} ${m.lastname}` === `${member.firstname} ${member.lastname}`));
            // console.log(uniqueMembers)
            uniqueMembers.map((member)=>{
                const attendance:Attendance = {
                    "attendanceStatus":AttendanceStatus.PRESENT,
                    "firstname":member.firstname,
                    "lastname":member.lastname,
                    "studentEmail":member.email
                }

                setAttendanceList((prev)=>[...prev, attendance])
            })
        });
    }

    const updateAttendanceStatus = (studentEmail: string) => {
        // console.log(attendanceList)
        setAttendanceList((prev) => 
            prev.map((attendance) => 
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
            )
        );
    };

    const getInLine = ()=>{
        // console.log(attendanceList)
        if(attendanceList.filter(attendance => attendance.attendanceStatus == AttendanceStatus.PRESENT).length == 0){
            toast.error("What's the point of getting in line, if everybody is absent right?")
        }else{
            fetch(`${QUEUEIT_URL}/queue/enqueue`,{
                method:'POST',
                body:JSON.stringify(
                    {
                        "facultyID":faculty?.uid,
                        "teamID":team?.tid,
                        "teamName":team?.groupName,
                        "classReference":`${classroom?.courseCode.toLocaleUpperCase()} - ${classroom?.section.toUpperCase()}`,
                        "classroomID":classroom?.cid,
                        "attendanceList":attendanceList,
                    }
                ),
                headers:{
                    'Content-Type': 'application/json',
                }
            })
            .then( async (res)=>{
                // console.log(res)
                switch(res.status){
                    case 200:
                        toast.success(`Your team is now in the queue.`)
                        setModalToggle(false)
                        break;
                    case 400:
                        const message400 = await res.text();
                        toast.error(message400)
                        break;
                    case 404:
                        const message404 = await res.text();
                        toast.error(message404)
                        break;
                    default:
                        toast.error(`Server error`)
                        break;
                }
            })
            .catch((err)=>{
                console.log(`Fetch error: ${err}`)
            })
        }
        
    }

    useEffect(() => {
        if (modalToggle) {
            setAttendanceList([]); // Clear members when modal is opened
            if (team) {
                fetchMemberDetails();
            }
        }
    }, [modalToggle, team]);

    return (
        <Modal open={modalToggle} onClose={() => { setModalToggle(false); setAttendanceList([]); }}>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', backgroundColor: 'white' }} className='flex flex-col gap-3 p-5 rounded-md justify-center items-center'>
                <Typography sx={{ textAlign: 'center' }} variant='subtitle1' fontWeight='bold'>{`Hello Team ${team?.groupName}`}</Typography>
                <Typography sx={{ width: '75%', textAlign: 'center' }} variant='caption' color='gray'>Prior to adding your team to the queue, please toggle your individual attendance for this consultation.</Typography>
                <div className='w-2/3 flex flex-col gap-3 h-auto overflow-auto'>
                    <AttendanceLogger updateAttendanceStatus={updateAttendanceStatus} attendanceList={attendanceList} />
                    <Button disabled={attendanceList.length == 0} onClick={getInLine} sx={{backgroundColor:dpurple, color:'white'}}>Get in line</Button>
                </div>
            </div>
        </Modal>
    )
}

export default StudentEnqueueModal