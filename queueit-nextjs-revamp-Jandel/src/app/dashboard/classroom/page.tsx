"use client"
import BaseComponent from '@/Components/BaseComponent'
import React, { useEffect, useState } from 'react'
import { UserType } from '@/Utils/Global_variables'
import ClassroomDetailStudentView from '@/Components/ClassroomDetailStudentView'
import ClassroomDetailFacultyView from '@/Components/ClassroomDetailFacultyView'
import { useUserContext } from '@/Contexts/AuthContext'
import { useClassroomContext } from '@/Contexts/ClassroomContext'
import NotFound from '@/Components/NotFound'
import { Typography } from '@mui/material'
import CatLoader from '@/Components/CatLoader'


const page = () => {
  const user = useUserContext().user
  const classroom = useClassroomContext().classroom
  const [loading, setLoading] = useState(true)
  useEffect(()=>{
    if(!classroom){return}
    setLoading(false)
  },[classroom])
  if(loading){
    return(
      <CatLoader loading={loading}/>
    )
  }else{
    return (
      <BaseComponent opacity={0.25}>
        {user?.role == UserType.STUDENT?
          <ClassroomDetailStudentView/>
          :
          <ClassroomDetailFacultyView/>
          }
      </BaseComponent>
    )
  }
}

export default page
