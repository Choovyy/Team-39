import React, { useState, useEffect } from "react";
import { Typography, Button, Dialog, DialogActions, DialogContent, DialogTitle, Tooltip } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";  
import { useUserContext } from "@/Contexts/AuthContext";
import { QUEUEIT_URL, Rubric } from "@/Utils/Global_variables";
import { toast } from "react-toastify";
import { useRubricsContext } from "@/Contexts/RubricsContext";

interface RubricCardProps{
  rubric:Rubric
  onClickAction:Function
}

const RubricCard:React.FC<RubricCardProps> = ({ rubric,onClickAction }) => { 
  const [open, setOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const user = useUserContext().user

  const setRubrics = useRubricsContext().setRubrics

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  
  const handleDelete = () => {
    setOpen(false);  
   
    fetch(`${QUEUEIT_URL}/rubrics/delete/${rubric.id}`,{
      method:'DELETE'
    })
    .then((res)=>{
      setSuccessOpen(true);  
      toast.success("Rubric deleted successfully.")
      setRubrics((prevRubrics) => 
          prevRubrics.filter((r) => r.id !== rubric.id)
      );
    })
    .catch((err)=>{
      toast.error("Caught an error")
      console.log(err)
    })
  };

  const handleSuccessClose = () => setSuccessOpen(false);

  return (
    <>
      <div
        onClick={() => {onClickAction(rubric);}}  
        className="relative bg-white rounded-lg border-2 border-black hover:border-2 hover:bg-lgreen cursor-pointer px-5 py-3 flex flex-col  justify-between h-full  "
        style={{ width: "270px", boxShadow: "5px 5px 0px 1px rgba(0, 0, 0,1)", height: "220px" }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Close Button (X) - Only visible on hover */}
        {isHovered && rubric.userID == user?.uid && (
          <button
            onClick={(event) => {
              event.stopPropagation(); 
              handleOpen();
            }}
            className="absolute top-2 right-2 bg-gray-200 text-black px-2 py-1 rounded-full text-sm font-bold hover:bg-red-500 hover:text-white transition"
          >
            ✖
          </button>
        )}

        <Tooltip title={rubric.title}><Typography variant="h5" fontWeight="bold" className="text-center pt-5 overflow-hidden">
          {rubric.title}
        </Typography></Tooltip>

        <Typography className="w-full overflow-hidden" style={{ fontSize: "10px", textAlign:'center' }}>
          {rubric.description}
        </Typography>

        <Typography className=" text-center" style={{ fontSize: "10px", color: "gray" }}>
          Created by {rubric.facultyName}
        </Typography>
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={open} onClose={handleClose} PaperProps={{ style: { width: "450px", height: "190px", padding:"10px"} }}>
        <DialogTitle className="text-center" variant="h5" style={{ color: "rgba(125,87,252,0.9)", fontWeight: "bold"}}>
          Delete Rubric
        </DialogTitle>
        <DialogContent className="text-center">
          Are you sure you want to delete this rubric template?
        </DialogContent>
        <DialogActions style={{ display: "flex", justifyContent: "center", fontWeight: "bold" }}>
          <Button onClick={handleClose} style={{ color: "#000", fontWeight: "bold" }}>
            Cancel
          </Button>
          <Button
            style={{ background: "rgba(125,87,252,0.9)", color: "#fff", fontWeight: "bold" }}
            onClick={handleDelete}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Message Dialog */}
      <Dialog open={successOpen} onClose={handleSuccessClose} PaperProps={{ style: { width: "450px", height: "200px" } }}>
        <DialogTitle className="flex justify-center">
          <div className="w-16 h-16 flex items-center justify-center rounded-full bg-white">
            <CheckCircleIcon style={{ fontSize: "60px", color: "rgba(125,87,252,0.9)" }} />
          </div>
        </DialogTitle>
        <DialogContent className="text-center">
          Deleted Successfully
        </DialogContent>
        <DialogActions style={{ display: "flex", justifyContent: "center", fontWeight: "bold" }}>
          <Button
            style={{ background: "rgba(125,87,252,0.9)", color: "#fff", fontWeight: "bold" }}
            onClick={handleSuccessClose}
          >
            Okay
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}


export default RubricCard