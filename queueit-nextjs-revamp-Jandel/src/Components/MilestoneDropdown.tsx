import { useUserContext } from '@/Contexts/AuthContext';
import { useMilestoneSetContext } from '@/Contexts/MilestoneSetContext';
import { Milestone, MilestoneSet, QUEUEIT_URL, UserType } from '@/Utils/Global_variables';
import { Menu, MenuItem, Tooltip, Typography } from '@mui/material';
import React from 'react';
import { toast } from 'react-toastify';

interface MilestoneDropdownProps {
    milestone: Milestone;
    index: number;
    milestoneLength: number;
}

const MilestoneDropdown: React.FC<MilestoneDropdownProps> = ({ milestone, index, milestoneLength }) => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const user = useUserContext().user
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    // Calculate the width based on completePercentage
    const backgroundWidth = `${milestone.completionPercentage}%`;

    const milestoneSet = useMilestoneSetContext().MilestoneSet
    const setMilestoneSet = useMilestoneSetContext().setMilestoneSet

    const handleCheckBoxClick = (taskID:number, checked:boolean)=>{
        if(user?.role === UserType.FACULTY && milestoneSet?.approverID === user?.uid){
            if(checked){
                fetch(`${QUEUEIT_URL}/milestone/markTaskComplete/${taskID}/${user?.uid}`)
                .then(async(res)=>{
                    if(res.ok){
                        const response:MilestoneSet = await res.json()
                        setMilestoneSet(response)
                    }else{
                        const err_text = await res.text()
                        toast.error(err_text)
                    }
                })
                .catch((err)=>{
                    console.log(err)
                })
            }else{
                fetch(`${QUEUEIT_URL}/milestone/markTaskIncomplete/${taskID}/${user?.uid}`)
                .then(async(res)=>{
                    if(res.ok){
                        const response:MilestoneSet = await res.json()
                        setMilestoneSet(response)
                    }else{
                        const err_text = await res.text()
                        toast.error(err_text)
                    }
                })
                .catch((err)=>{
                    console.log(err)
                })
            }
        }
    }

    return (
        <>
            <div className={`relative bg-white flex-1 z-10`}>
                <div
                    className="absolute top-0 left-0 h-full bg-lgreen"
                    style={{ width: backgroundWidth }}
                >
                </div>
                <button
                    onClick={handleClick}
                    className={`h-10 border-2 w-full min-w-40 flex-shrink-0 overflow-hidden flex items-center justify-center cursor-pointer relative z-10`}
                >
                    <Typography variant='subtitle1' fontWeight={"bold"}>{milestone.title}</Typography>
                </button>
            </div>
            <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                    'aria-labelledby': 'basic-button',
                    'disablePadding':true,
                }}
            >
                {milestone.modules.map((module,modIndex)=>(
                    <div key={modIndex} className='w-40 overflow-hidden border-b border-2-black flex flex-col border border-2-black'>
                        <Typography className='bg-lgreen' fontWeight={"bold"} padding={1} textAlign={"start"}>{module.moduleName}</Typography>
                        {
                            module.tasks.map((task,taskIndex)=>(
                                <div key={taskIndex} className='flex justify-between items-center p-3'>
                                    <Tooltip title={task.description?task.description:'No description given.'}><Typography>{task.taskName}</Typography></Tooltip>
                                    <input defaultChecked={task.completed} onChange={(e)=>{handleCheckBoxClick(task.taskID, e.target.checked)}} disabled={user?.role === UserType.STUDENT || !milestoneSet?.approved} type="checkbox" name={`task${task.taskID}`} id={`task${task.taskID}`} />
                                </div>
                            ))
                        }
                    </div>
                ))}
                
            </Menu>
        </>
    );
}

export default MilestoneDropdown;