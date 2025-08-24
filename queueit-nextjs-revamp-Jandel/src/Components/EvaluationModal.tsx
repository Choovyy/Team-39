import { useQueueingManagerContext } from '@/Contexts/QueueingManagerContext';
import { useRubricContext } from '@/Contexts/RubricContext';
import { Chip, Modal, Slider, Typography } from '@mui/material';
import React from 'react';
import IndexEnumerator from './IndexEnumerator';
import { capitalizeFirstLetter } from '@/Utils/Utility_functions';
import { AttendanceStatus, Criterion, lgreen } from '@/Utils/Global_variables';
import rocket from '../../public/images/rocket-thumb.png';
import { useGradesContext } from '@/Contexts/GradesContext';

interface EvaluationModalProps {
    open: boolean;
    setOpen: Function;
}

const EvaluationModal: React.FC<EvaluationModalProps> = ({ open, setOpen }) => {
    const meeting = useQueueingManagerContext().QueueingManager?.meeting;
    const rubric = useRubricContext().Rubric;
    const { Grades, setGrades } = useGradesContext();

    // Function to handle slider change
    const handleSliderChange = (studentName: string, newValue: number, criterion: any) => {
    setGrades(prevGrades =>
        prevGrades.map(grade =>
            grade.studentName === studentName && grade.criterionID === criterion.criterionID
                ? {
                    ...grade,
                    grade: newValue, 
                    weightedGrade: (newValue * (criterion.weight / 100)) // Apply weight
                }
                : grade
        )
    );
};


    const marks = [
        { value: 0, label: '0' },
        { value: 1, label: '1' },
        { value: 2, label: '2' },
        { value: 3, label: '3' },
        { value: 4, label: '4' },
        { value: 5, label: 'Excellent' }
    ];

    return (
        <Modal open={open} onClose={() => { setOpen(false); }}>
            <div className='bg-white rounded-md absolute w-2/3 flex flex-col p-10 h-2/3 overflow-auto gap-3' style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                {rubric?.criteria.map((criterion, index) => (
                    <div key={index} className='flex flex-col gap-3'>
                        <div className='flex gap-6'>
                            <div className='h-fit'>
                                <IndexEnumerator index={index + 1} />
                            </div>
                            <div className='flex flex-col gap-3'>
                                <Typography variant='h4' fontWeight={"bold"}>{`${criterion.title} ${criterion.weight?`(${criterion.weight}%)`:''}`}</Typography>
                                <Typography variant='caption'>{criterion.description}</Typography>
                            </div>
                        </div>
                        <div className='px-20 py-2 gap-6 flex flex-col'>
                            {meeting?.queueingEntry.attendanceList.map((attendance, index) => {
                                const studentName = `${capitalizeFirstLetter(attendance.firstname)} ${capitalizeFirstLetter(attendance.lastname)}`;
                                const currentGrade = Grades?.find(grade => grade.criterionID === criterion.criterionID && grade.studentName === studentName)?.grade || 0;
                                // console.log(currentGrade)
                                return (
                                    <div key={index} className='flex flex-col gap-3'>
                                        <div className='flex gap-3 items-center'>
                                            <Typography fontWeight={"bold"} variant='h6'>{studentName}</Typography>
                                            {attendance.attendanceStatus === AttendanceStatus.ABSENT ?
                                                <Chip size='small' label="Absent" sx={{ backgroundColor: 'rgba(255,102,102,0.5)', color: 'white' }} />
                                                : <></>
                                            }
                                        </div>
                                        <div className='flex flex-col gap-3 rounded-md py-6 px-10' style={{ border: 'solid 0.1px gray', backgroundColor:'#F9F9F9' }}>
                                            <Slider
                                                marks={marks}
                                                disabled={attendance.attendanceStatus === AttendanceStatus.ABSENT}
                                                size="medium"
                                                value={currentGrade} // Use the grade from context
                                                min={0}
                                                max={5}
                                                step={0.1}
                                                aria-label="Small"
                                                valueLabelDisplay="auto"
                                                onChange={(event, newValue) => handleSliderChange(studentName, newValue, criterion)} // Update grade on change
                                                sx={{
                                                    color: lgreen,
                                                    '& .MuiSlider-thumb': {
                                                        width: '60px',
                                                        height: '60px',
                                                        backgroundColor: 'transparent',
                                                        '&:hover': {
                                                            backgroundColor: 'transparent',
                                                        },
                                                        '&::before': {
                                                            display: attendance.attendanceStatus === AttendanceStatus.ABSENT ? 'none' : '',
                                                            content: '""',
                                                            backgroundImage: `url(${rocket.src})`,
                                                            backgroundSize: 'contain',
                                                            backgroundRepeat: 'no-repeat',
                                                            width: '80px',
                                                            height: '80px',
                                                            position: 'absolute',
                                                            top: '50%',
                                                            left: '50%',
                                                            transform: 'translate(-50%, -37%)',
                                                            border:'none',
                                                            boxShadow:'none'
                                                        },
                                                    },
                                                    '& .MuiSlider-track': {
                                                        background: lgreen,
                                                    },
                                                    '& .MuiSlider-rail': {
                                                        background: `linear-gradient(to right, black, ${lgreen})`,
                                                    },
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </Modal>
    );
};

export default EvaluationModal;