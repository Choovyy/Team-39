"use client"
import BaseComponent from '@/Components/BaseComponent'
import React from 'react' 
import ClassroomDetailMentorView from '@/Components/ClassroomDetailMentorView' 


const page = () => { 
  return (
    <BaseComponent opacity={0.25}> 
        <ClassroomDetailMentorView/> 
    </BaseComponent>
  )
}

export default page
