import { CircularProgress, Modal, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import RubricHeader from './RubricHeader'
import { useRubricContext } from '@/Contexts/RubricContext'
import { useRubricsContext } from '@/Contexts/RubricsContext'
import { useUserContext } from '@/Contexts/AuthContext'
import RubricCard from './RubricCard'
import { QUEUEIT_URL, Rubric as RubricType } from '@/Utils/Global_variables'

interface SelectRubricModalProps {
    open: boolean;
    setOpen: (open: boolean) => void;
}

const SelectRubricModal: React.FC<SelectRubricModalProps> = ({ open = true, setOpen }) => {
    const { Rubric: selectedRubric, setRubric } = useRubricContext(); // Avoid conflict with imported `Rubric`
    const { Rubrics, setRubrics } = useRubricsContext();
    const user = useUserContext().user;
    const [filter, setFilter] = useState("All Templates");

    useEffect(() => {
        if (!Rubrics) {
            const fetchRubrics = async () => {
                if(user){
                    try {
                        const response = await fetch(`${QUEUEIT_URL}/rubrics/user/${user?.uid}`);
                        if (!response.ok) {
                            throw new Error("Failed to fetch rubrics");
                        }
                        const data = await response.json();
                        console.log(data);
                        setRubrics(data);
                    } catch (error) {
                        console.error("Error fetching rubrics:", error);
                    }
                }
            };

            if(user){
                fetchRubrics();
            }
        }
    }, [Rubrics, user, setRubrics]); // Added dependencies

    const RubricCardAction = (rubric: RubricType) => {
        setRubric(rubric);
        setOpen(false);
    };

    const filteredRubrics = Rubrics?.filter((rubric) => {
        if (filter === "Public Templates") return rubric.isPrivate === false;
        if (filter === "Private Templates") return rubric.isPrivate === true;
        return true; // Show all if "All Templates" is selected
    });

    return (
        <Modal open={open} onClose={() => setOpen(false)}>
            <div 
                className='bg-white rounded-md absolute w-2/3 flex flex-col p-10 h-2/3 overflow-auto gap-3' 
                style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
            >
                <Typography textAlign="center" variant='h4' fontWeight="bold">
                    Choose a rubric that best fits the evaluation.
                </Typography>
                <RubricHeader onFilterChange={setFilter} />
                {Rubrics ? (
                    <div className='relative flex flex-wrap gap-8 '>
                        {filteredRubrics?.length > 0 ? (
                            filteredRubrics.map((rubric) => (
                                <RubricCard key={rubric.id} onClickAction={RubricCardAction} rubric={rubric} />
                            ))
                        ) : (
                            <p>No rubric found</p>
                        )}
                    </div>
                ) : (
                    <CircularProgress />
                )}
            </div>
        </Modal>
    );
};

export default SelectRubricModal;
