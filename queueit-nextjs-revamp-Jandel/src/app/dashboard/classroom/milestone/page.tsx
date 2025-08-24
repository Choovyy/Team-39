"use client"
import BackButton from '@/Components/BackButton'
import BaseComponent from '@/Components/BaseComponent'
import IndexEnumerator from '@/Components/IndexEnumerator'
import { useUserContext } from '@/Contexts/AuthContext'
import { useTeamContext } from '@/Contexts/TeamContext'
import { dpurple, Milestone, MilestoneSet, Module, QUEUEIT_URL, Task } from '@/Utils/Global_variables'
import { Button, Divider, IconButton, Tooltip, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useClassroomContext } from '@/Contexts/ClassroomContext'
import { toast } from 'react-toastify'
import StarsIcon from '@mui/icons-material/Stars';
import { useMilestoneSetContext } from '@/Contexts/MilestoneSetContext'

const page = () => {
  const user = useUserContext().user
  const team = useTeamContext().Team
  const classroom = useClassroomContext().classroom
  const {MilestoneSet, setMilestoneSet} = useMilestoneSetContext()
  

  const milestoneTemplate:Milestone = {
        "title":"",
        "modules":[
          {
            "moduleName":"",
            "tasks":[
              {
                "taskName":"",
                "description":""
              }
            ]
          }
        ]
  }

  const moduleTemplate:Module = {
    "moduleName":"",
    "tasks":[
      {
        "taskName":"",
        "description":""
      }
    ]
  }

  const taskTemplate:Task = {
    "taskName":"",
    "description":""
  }

  const handleAddMilestoneClick = () => {
    // Check if the last milestone is named
    if (MilestoneSet?.milestones.length > 0) {
      const lastMilestone = MilestoneSet.milestones[MilestoneSet.milestones.length - 1];
      
      // Check if the milestone title is empty
      if (lastMilestone.title === "") {
        toast.error("Preceding Milestone must be named");
        return;
      }
  
      // Check if any module in the last milestone has an empty name
      for (const module of lastMilestone.modules) {
        if (module.moduleName === "") {
          toast.error("Module name cannot be empty");
          return;
        }
  
        // Check if any task in the module has an empty name or description
        for (const task of module.tasks) {
          if (task.taskName === "") {
            toast.error("Task name cannot be empty");
            return;
          }
        }
      }
    }
  
    // If all checks pass, add a new milestone
    setMilestoneSet((prev) => ({
      ...prev,
      milestones: [...prev.milestones, milestoneTemplate]
    }));
  };
  

  const handleAddModuleClick = (milestoneIndex: number) => {
    const selectedMilestone = MilestoneSet?.milestones[milestoneIndex];
    
    if (selectedMilestone) {
      // Check if any module has an empty name
      for (const module of selectedMilestone.modules) {
        if (module.moduleName === "") {
          toast.error("Module name cannot be empty");
          return;
        }
  
        // Check if any task in the module has an empty name or description
        for (const task of module.tasks) {
          if (task.taskName === "") {
            toast.error("Task name cannot be empty");
            return;
          }
        }
      }
  
      // If no empty names were found, proceed with adding the new module
      setMilestoneSet((prev: MilestoneSet) => ({
        ...prev,
        milestones: prev.milestones.map((milestone, index) =>
          index === milestoneIndex
            ? { ...milestone, modules: [...milestone.modules, moduleTemplate] }
            : milestone
        )
      }));
    }
  };
  

  const handleRemoveMilestone = (milestoneIndex: number) => {
    console.log(`Attempting to remove milestone at index: ${milestoneIndex}`);
    
    // Make sure that the correct milestone is being removed.
    setMilestoneSet((prev: MilestoneSet) => {
      const updatedMilestones = prev.milestones.filter((_, index) => index !== milestoneIndex);
      console.log(`Updated milestones after removal: `, updatedMilestones);
      
      return {
        ...prev,
        milestones: updatedMilestones,
      };
    });
  };
  

  const handleRemoveModule = (milestoneIndex: number, moduleIndex: number) => {
    setMilestoneSet((prev: MilestoneSet) => ({
      ...prev,
      milestones: prev.milestones.map((milestone, mIndex) =>
        mIndex === milestoneIndex
          ? {
              ...milestone,
              modules: milestone.modules.filter((_, modIndex) => modIndex !== moduleIndex)
            }
          : milestone
      )
    }));
  };

  const handleRemoveTask = (milestoneIndex: number, moduleIndex: number, taskIndex: number) => {
    setMilestoneSet((prev: MilestoneSet) => ({
      ...prev,
      milestones: prev.milestones.map((milestone, mIndex) =>
        mIndex === milestoneIndex
          ? {
              ...milestone,
              modules: milestone.modules.map((module, modIndex) =>
                modIndex === moduleIndex
                  ? {
                      ...module,
                      tasks: module.tasks.filter((_, tIndex) => tIndex !== taskIndex)
                    }
                  : module
              )
            }
          : milestone
      )
    }));
  };

  const handleAddTaskClick = (milestoneIndex: number, moduleIndex: number) => {
    const selectedMilestone = MilestoneSet?.milestones[milestoneIndex];
    const selectedModule = selectedMilestone?.modules[moduleIndex];
  
    if (selectedModule) {
      // Check if any task in the module has an empty name or description
      for (const task of selectedModule.tasks) {
        if (task.taskName === "") {
          toast.error("Task name cannot be empty");
          return;
        }
      }
  
      // If no empty task fields are found, proceed with adding the new task
      setMilestoneSet((prev: MilestoneSet) => ({
        ...prev,
        milestones: prev.milestones.map((milestone, mIndex) =>
          mIndex === milestoneIndex
            ? {
                ...milestone,
                modules: milestone.modules.map((module, modIndex) =>
                  modIndex === moduleIndex
                    ? {
                        ...module,
                        tasks: [...module.tasks, taskTemplate] // Add a new task to the module's tasks
                      }
                    : module
                )
              }
            : milestone
        )
      }));
    }
  };
  
  

  const handleMilestoneNameChange = (milestoneIndex: number, newTitle: string) => {
    setMilestoneSet((prev: MilestoneSet) => ({
      ...prev,
      milestones: prev.milestones.map((milestone, index) => {
        // Ensure to return the modified milestone if the index matches
        if (index === milestoneIndex) {
          return {
            ...milestone,
            title: newTitle, // Update the title
          };
        }
        // Return the original milestone if index doesn't match
        return milestone;
      }),
    }));
  };

  const handleModuleNameChange = (milestoneIndex: number, moduleIndex: number, newTitle: string) => {
    setMilestoneSet((prev: MilestoneSet) => ({
      ...prev,
      milestones: prev.milestones.map((milestone, mIndex) =>
        mIndex === milestoneIndex
          ? {
              ...milestone,
              modules: milestone.modules.map((module, modIndex) =>
                modIndex === moduleIndex
                  ? { ...module, moduleName: newTitle } // Update the module name
                  : module
              )
            }
          : milestone
      )
    }));
  };
  
  
  const handleTaskNameChange = (milestoneIndex: number, moduleIndex: number, taskIndex: number, newTaskName: string) => {
    setMilestoneSet((prev: MilestoneSet) => ({
      ...prev,
      milestones: prev.milestones.map((milestone, mIndex) =>
        mIndex === milestoneIndex
          ? {
              ...milestone,
              modules: milestone.modules.map((module, modIndex) =>
                modIndex === moduleIndex
                  ? {
                      ...module,
                      tasks: module.tasks.map((task, tIndex) =>
                        tIndex === taskIndex ? { ...task, taskName: newTaskName } : task
                      )
                    }
                  : module
              )
            }
          : milestone
      )
    }));
  };
  
  const handleTaskDescriptionChange = (milestoneIndex: number, moduleIndex: number, taskIndex: number, newDescription: string) => {
    setMilestoneSet((prev: MilestoneSet) => ({
      ...prev,
      milestones: prev.milestones.map((milestone, mIndex) =>
        mIndex === milestoneIndex
          ? {
              ...milestone,
              modules: milestone.modules.map((module, modIndex) =>
                modIndex === moduleIndex
                  ? {
                      ...module,
                      tasks: module.tasks.map((task, tIndex) =>
                        tIndex === taskIndex ? { ...task, description: newDescription } : task
                      )
                    }
                  : module
              )
            }
          : milestone
      )
    }));
  };


  const checkForEmptyListInMilestoneSet = () => {
    if (MilestoneSet?.milestones.length <= 0) {
      toast.error("No milestone found.");
      return false;
    }
  
    // Loop through milestones
    for (const milestoneIndex in MilestoneSet.milestones) {
      const milestone: Milestone = MilestoneSet.milestones[milestoneIndex];
  
      // Check if milestone title is empty
      if (!milestone.title.trim()) {
        toast.error(`Milestone at index ${parseInt(milestoneIndex) + 1} has no name.`);
        return false;
      }
  
      if (milestone.modules.length <= 0) {
        toast.error(`${milestone.title} at index ${parseInt(milestoneIndex) + 1} has an empty module list.`);
        return false;
      }
  
      // Loop through modules in the milestone
      for (const moduleIndex in milestone.modules) {
        const module: Module = milestone.modules[moduleIndex];
        
        // Check if module name is empty
        if (!module.moduleName.trim()) {
          toast.error(`Module at ${milestone.title} index ${parseInt(milestoneIndex) + 1} has no name.`);
          return false;
        }
  
        if (module.tasks.length <= 0) {
          toast.error(`${module.moduleName} module at ${milestone.title} at index ${parseInt(milestoneIndex) + 1} has an empty task list.`);
          return false;
        }
        
        // Loop through tasks in the module and check if task name or description is empty
        for (const taskIndex in module.tasks) {
          const task = module.tasks[taskIndex];
          
          if (!task.taskName.trim()) {
            toast.error(`Task at ${module.moduleName} in ${milestone.title} at index ${parseInt(milestoneIndex) + 1} has no name.`);
            return false;
          }
        }
      }
    }
  
    return true;
  };
  
  const handleLockIn = () => {
    if (checkForEmptyListInMilestoneSet()) {
      console.log(MilestoneSet)
      fetch(`${QUEUEIT_URL}/milestone/createSet`,{
        body:JSON.stringify(MilestoneSet),
        method:'POST',
        headers:{
          'Content-Type':'Application/json'
        }
      })
      .then(async(res)=>{
        if(res.ok){
          const success_msg = await res.text()
          toast.success(success_msg)
        }else{
          // const err_msg = await res.text()
          // console.log(err_msg)
          toast.error("Milestone or module or task name might be too long.")
        }
      })
      .catch((err)=>{
        console.log(err)
      })
    }
  };
  
  
  


  return (
    <BaseComponent>
        <div className=' w-full bg-white p-3 relative border border-black rounded-md flex flex-col gap-3'>
          <div className='flex items-center w-full'>
            <BackButton/>
            <Typography fontWeight={"bold"} textAlign={"center"} className='flex-grow' variant='h5'>Milestones</Typography>
            {MilestoneSet?.approved?
            <></>
            :
            <IconButton 
              sx={{
                  height: '40px',
                  width: 'fit-content', 
                  padding: '8px 16px', 
                  backgroundColor: dpurple, 
                  color: 'white', 
                  borderRadius: '4px',
                  display:'flex',
                  gap:1,
                  marginLeft:8,
                  '&:hover':{backgroundColor:'#5A3EC8'},
                  alignItems:'center'
              }}
              onClick={()=>{handleLockIn()}}
            >
              <StarsIcon fontSize='small'/> <p className='text-base'>Lock In</p>
            </IconButton>
            }
          </div>
          <Divider/>
          <div className='w-full flex flex-col gap-12'>
            {
              MilestoneSet?.milestones.map((milestone,milestoneIndex)=>(
                <div className='flex w-full gap-3' key={milestoneIndex}>
                  <div className='h-fit'>
                    <IndexEnumerator index={milestoneIndex+1}/>
                  </div>
                  <div className='border w-full border-black rounded-md'>
                    <div className='w-full bg-dpurple p-3 border-b border-black flex'>
                      <input readOnly={MilestoneSet?.approved} onChange={(e)=>{handleMilestoneNameChange(milestoneIndex,e.target.value)}} placeholder='Milestone Name' type="text" name={`milestone${milestoneIndex}`} id={`milestone${milestoneIndex}`} value={milestone.title} className='flex-1 bg-transparent text-white text-2xl font-bold focus:outline-none focus:border-none w-full'/>
                      {MilestoneSet?.approved?
                      <></>
                      :
                      <>
                        <Tooltip title="Add Module">
                          <IconButton onClick={() => handleAddModuleClick(milestoneIndex)}>
                            <AddCircleIcon fontSize='small' sx={{ color: 'white' }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip onClick={()=>{handleRemoveMilestone(milestoneIndex)}} title={`Remove Milestone - ${milestoneIndex}`} ><IconButton><CancelIcon fontSize='small' color='error'/></IconButton></Tooltip>
                      </>}
                    </div>
                    <div className='p-3 flex flex-col w-full gap-6'>
                      {milestone.modules.map((module,moduleIndex)=>(
                        <div key={moduleIndex} className='border border-black bg-white rounded-md'>
                          <div className='bg-lgreen p-3 border-b border-black rounded-t-md flex'>
                            <input
                              readOnly={MilestoneSet?.approved}
                              onChange={(e) => handleModuleNameChange(milestoneIndex, moduleIndex, e.target.value)} // onChange handler to update module name
                              placeholder='Module Name'
                              type="text"
                              name={`task${moduleIndex}`}
                              id={`task${moduleIndex}`}
                              value={module.moduleName} // Use value to bind to state
                              className='flex-1 bg-transparent text-black text-lg font-bold focus:outline-none focus:border-none w-full'
                            />
                            {MilestoneSet?.approved?
                              <></>
                              :
                              <>
                                <Tooltip title="Add Task">
                                  <IconButton onClick={() => handleAddTaskClick(milestoneIndex, moduleIndex)}>
                                    <AddCircleIcon fontSize='small' sx={{ color: 'black' }} />
                                  </IconButton>
                                </Tooltip>

                                <Tooltip onClick={()=>{handleRemoveModule(milestoneIndex,moduleIndex)}} title="Remove Module"><IconButton><CancelIcon fontSize='small' color='error'/></IconButton></Tooltip>
                              </>
                            }
                          </div>
                          <div className='p-3 w-full gap-6'>
                            {module.tasks.map((task,taskIndex)=>(
                              <div key={taskIndex} className='flex gap-3 items-start'>
                                {MilestoneSet?.approved?
                                  <></>
                                  :
                                  <Tooltip onClick={()=>{handleRemoveTask(milestoneIndex,moduleIndex,taskIndex)}} className='h-fit' title="Remove Task"><IconButton><CancelIcon fontSize='small' color='error'/></IconButton></Tooltip>
                                }
                                <div className='flex flex-col w-full'>
                                  <input
                                    readOnly={MilestoneSet?.approved}
                                    onChange={(e) => handleTaskNameChange(milestoneIndex, moduleIndex, taskIndex, e.target.value)} // onChange handler to update task name
                                    placeholder='Task Name'
                                    type="text"
                                    name={`task${taskIndex}`}
                                    id={`task${taskIndex}`}
                                    value={task.taskName} // Bind task name to state
                                    className='bg-transparent text-base font-bold focus:outline-none focus:border-none w-full'
                                  />

                                  <textarea
                                    readOnly={MilestoneSet?.approved}
                                    onChange={(e) => handleTaskDescriptionChange(milestoneIndex, moduleIndex, taskIndex, e.target.value)} // onChange handler to update task description
                                    placeholder='Task Description'
                                    rows={3}
                                    name={`taskdesc${taskIndex}`}
                                    id={`taskdesc${taskIndex}`}
                                    value={task.description} // Bind task description to state
                                    className='bg-transparent text-xs focus:outline-none focus:border-none w-full'
                                  />

                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
          {MilestoneSet?.approved?
            <></>
            :
            <IconButton 
              sx={{
                  height: '40px',
                  width: 'fit-content', 
                  padding: '8px 16px', 
                  backgroundColor: dpurple, 
                  color: 'white', 
                  borderRadius: '4px',
                  display:'flex',
                  gap:1,
                  marginLeft:8,
                  '&:hover':{backgroundColor:'#5A3EC8'}
              }}
              onClick={()=>{handleAddMilestoneClick()}}
            >
                <AddCircleIcon fontSize='small'/> <p className='text-base'>Add Milestone</p>
            </IconButton>
          }
        </div>
    </BaseComponent>
  )
}

export default page
