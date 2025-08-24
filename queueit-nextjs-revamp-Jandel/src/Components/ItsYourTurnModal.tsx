import React, { useEffect } from "react";
import { Modal, Box, Typography, Button  } from "@mui/material";
import Run from "../../public/images/Run.png"
import { dpurple } from '@/Utils/Global_variables'

const ItsYourTurnModal = ({ open, setOpen }) => {
    useEffect(() => {
        if (open) {
            const timer = setTimeout(() => {
                setOpen(false);
            }, 8000);
            return () => clearTimeout(timer);
        }
    }, [open]);

    return (
        <Modal open={open} onClose={() => setOpen(false)}>
            <Box
                sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "28%",
                    bgcolor: "white",
                    boxShadow: 24,
                    px: 5, py: 7,
                    borderRadius: 8,
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center", 
                }}
            >
                <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
                    <img src={Run.src} alt="Run Icon" width={100} height={100} />
                </Box>
                <Typography variant="h3">It's your turn!</Typography>
                <Typography variant="body1">Head to your adviser/mentor now.</Typography>

                <Button variant="contained" sx={{ mt: 3, backgroundColor: dpurple, "&:hover": { backgroundColor: dpurple } }} onClick={() => setOpen(false)}>
                    Close
                </Button>
            </Box>
        </Modal>
    );
};

export default ItsYourTurnModal;
