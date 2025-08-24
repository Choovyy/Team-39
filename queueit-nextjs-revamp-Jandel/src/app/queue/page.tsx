"use client"

import BaseComponent from '@/Components/BaseComponent'
import CatLoader from '@/Components/CatLoader'
import NotFound from '@/Components/NotFound'
import QueueingPageFacultyView from '@/Components/QueueingPageFacultyView'
import QueueingPageStudentView from '@/Components/QueueingPageStudentView'
import { useUserContext } from '@/Contexts/AuthContext'
import { useClassroomContext } from '@/Contexts/ClassroomContext'
import { useFacultyContext } from '@/Contexts/FacultyContext'
import { useQueueingManagerContext } from '@/Contexts/QueueingManagerContext'
import { dpurple, QueueingManager, QUEUEIT_URL, UserType } from '@/Utils/Global_variables'
import { useWebSocket } from '@/WebSocket/WebSocketContext'
import { Typography } from '@mui/material'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'

const page = () => {
    const user = useUserContext().user
    const client = useWebSocket();
    const {QueueingManager, setQueueingManager} = useQueueingManagerContext()
    const classroom = useClassroomContext().classroom
    const router = useRouter()
    const faculty = useFacultyContext().Faculty
    const [loading,setLoading] = useState<boolean>(true)
    const userLoading = useUserContext().loading

    useEffect(()=>{
      if(userLoading){
        return;
      }
      if(!user){
        router.push('/login')
      }

      if(!classroom && user?.role==UserType.STUDENT){
        router.push('/dashboard')
      }
    },[])

    useEffect(()=>{
      if(userLoading){
        return;
      }
      setLoading(true)
      if((user?.uid && user?.role == UserType.FACULTY) || faculty?.uid){
        fetch(`${QUEUEIT_URL}/faculty/getQueueingManager/${user?.role == UserType.FACULTY?user.uid:faculty?.uid}`)
        .then(async(res)=>{
          switch(res.status){
            case 200:
              const response = await res.json()
              setQueueingManager(response)
              break;
            default:
              // const responseText = await res.text()
              // toast.error(responseText)
          }
        })
        .catch((err)=>{
          console.log(`Fetching queueing manager error ${err}`)
        })
        .finally(()=>{
          setLoading(false)
        })
      }else{
        console.log(`role: ${user?.role} and uid: ${user?.uid}`)
        setLoading(false)
        toast.error("Could not refer to the right queueing manager.")
      }
    },[user])

    useEffect(()=>{
      if (client) {
        const queueingStatusSubscription = client.subscribe(`/topic/queueStatus/adviser/${user?.role == UserType.FACULTY?user.uid:faculty?.uid}`, (message) => {
            const receivedMessage = JSON.parse(message.body);
            // console.log(`Received from websocket! ${receivedMessage}`)
            // (console.log(receivedMessage))
            if(receivedMessage === true){
              fetch(`${QUEUEIT_URL}/faculty/getQueueingManager/${user?.role == UserType.FACULTY?user.uid:faculty?.uid}`)
              .then(async(data)=>{
                  switch(data.status){
                      case 200:
                          const response:QueueingManager = await data.json()
                          // console.log(response)
                          setQueueingManager(response);
                          break;
                      default:
                          toast.error("Something went wrong while fetching Faculty active status.")
                  }
              })
              .catch((err)=>{
                  console.log(err)
                  toast.error("Caught an exception while fetching Faculty active status.")
              })
            }else{
              setQueueingManager((prev:QueueingManager) => ({
                ...prev, // Spread the previous state
                queueingEntries: receivedMessage // Update the queueingEntries with the new data
              }))
            }
        });

        const facultyStatusSubscription = client.subscribe(`/topic/facultyActivity/adviser/${user?.role == UserType.FACULTY?user.uid:faculty?.uid}`, (message) => {
                        const receivedMessage:QueueingManager = JSON.parse(message.body);
                        // console.log(receivedMessage)
                        setQueueingManager(receivedMessage)
                    });

        return () => {
            // console.log('Unsubscribing');
            queueingStatusSubscription.unsubscribe();
            facultyStatusSubscription.unsubscribe();
        };
      }
    },[client])

    if(loading){
      return(
        <CatLoader loading={loading}/>
      )
    }else{
      return (
        <BaseComponent opacity={0.25}>
          {
            loading?
              <CatLoader loading={loading}/>:
                !QueueingManager && user?.role == UserType.STUDENT?
                  <NotFound>
                    <Typography sx={{color:dpurple}} variant='h6' fontWeight={"bold"}>Faculty hidden</Typography>
                    <Typography textAlign={"center"} variant='caption' color='gray'>We do not think the faculty you are referring to is not ready.</Typography>
                  </NotFound>
                  :
                  user?.role == UserType.FACULTY?
                    <QueueingPageFacultyView/>
                    :
                    <QueueingPageStudentView/>
          }
        </BaseComponent>
      )
    }
}

export default page