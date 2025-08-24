"use client";
import { useState, useEffect } from "react"; 
import { useRouter, useSearchParams } from "next/navigation";
import BaseComponent from "@/Components/BaseComponent"; 
import {
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormControlLabel,
  Typography, 
  IconButton, 
  Tooltip,
  Switch,
} from "@mui/material";
import AddCircleIcon from '@mui/icons-material/AddCircle'; 
import WestIcon from '@mui/icons-material/West';
import CancelIcon from '@mui/icons-material/Cancel'; 
import { dpurple, QUEUEIT_URL, RubricDTO, SPEAR_URL } from "@/Utils/Global_variables";
import { toast } from "react-toastify";
import IndexEnumerator from "@/Components/IndexEnumerator";
import { useUserContext } from "@/Contexts/AuthContext"; 

export default function Page() {
  const user = useUserContext().user;
  const router = useRouter();
  const [searchParams, setSearchParams] = useState<URLSearchParams | null>(null);
  const [facultyName, setFacultyName] = useState("Unknown User");
  const [rubric, setRubric] = useState<RubricDTO | null>({
    title: "",
    description: "",
    criteria: [],
    isPrivate: true,
    isWeighted: false,
  });

  const [isPrivate, setIsPrivate] = useState(true);
  const [saveTemplateOpen, setSaveTemplateOpen] = useState(false);

  // Extract merged rubric data from query param
  useEffect(() => {
    const mergedRubric = typeof window !== "undefined" ? searchParams?.get("mergedRubric") : null;

    if (mergedRubric) {
      const parsedRubric = JSON.parse(decodeURIComponent(mergedRubric));
      setRubric(parsedRubric);
    }
  }, [searchParams]);

  const handleChange = (field, value) => {
    setRubric((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search); // Access searchParams in the client
      setSearchParams(params);
    }
  }, []);

  const handleCriteriaChange = (index, field, value) => {
    const updatedCriteria = [...rubric.criteria];
  
    // Update the weight first
    if (field === "weight" && rubric?.isWeighted) {
      updatedCriteria[index][field] = value;
  
      // Calculate the sum of weights after updating
      let sum = updatedCriteria.reduce((acc, criterion) => {
        return acc + (criterion.weight || 0); // Ensure to handle undefined weights
      }, 0);
  
      // Check the sum and show toast if necessary
      if (sum < 0 || sum > 100) {
        toast.error("Sum of weights must not exceed 100%", { autoClose: 1000 });
      } else {
        // Only update the rubric if the sum is valid
        setRubric((prev) => ({ ...prev, criteria: updatedCriteria }));
      }
    } else {
      // For other fields, just update the criteria
      updatedCriteria[index][field] = value;
      setRubric((prev) => ({ ...prev, criteria: updatedCriteria }));
    }
  };

  const handleRemoveCriterion = (index: number) => {
    setRubric((prev: RubricDTO) => {
      const updatedCriteria = prev.criteria.filter((_, i) => i !== index);
      return { ...prev, criteria: updatedCriteria };
    });
  };

  const handleAddCriterion = () => {
    if (rubric?.criteria.length !== 0 && rubric?.criteria[rubric.criteria.length - 1].title === "") {
      toast.error("Criterion title must not be empty.");
    } else {
      setRubric((prev) => ({
        ...prev,
        criteria: [...prev.criteria, { title: "", description: "", weight: undefined }],
      }));
    }
  };

  const handleSaveTemplateOpen = () => setSaveTemplateOpen(true);
  const handleSaveTemplateClose = () => setSaveTemplateOpen(false);

  useEffect(() => { 
    if (!user?.uid) return; // Ensure user ID exists before fetching

    fetch(`${SPEAR_URL}/get-teacher/${user.uid}`) 
      .then(response => response.json())
      .then(data => {
        const firstName = data.firstname || "";
        const lastName = data.lastname || "";
        setFacultyName(firstName && lastName ? `${firstName} ${lastName}` : "Unknown User");
      })
      .catch(error => {
        console.error("Error fetching user data:", error);
        setFacultyName("Unknown User");
      }); 
  }, [user]);  

  const handleSaveRubric = () => {
    if (rubric?.title === "" || rubric?.title == null || rubric?.title === undefined) {
      toast.error("Rubric title must not be empty.");
    } else if (rubric.criteria.length === 0) {
      toast.error("Criteria must at least contain one criterion.");
    } else if (rubric?.criteria[rubric.criteria.length - 1].title === "") {
      toast.error("Please remove the empty criterion.");
    } else {
      console.log("Rubric Saved:", rubric);
      fetch(`${QUEUEIT_URL}/rubrics/create`, {
        method: 'POST',
        body: JSON.stringify({
          "title": rubric.title,
          "description": rubric.description,
          "criteria": rubric.criteria,
          "isPrivate": isPrivate,
          "userID": user?.uid,
          "facultyName": facultyName,
          "isWeighted": rubric.isWeighted
        }),
        headers: {
          'Content-Type': 'application/json'
        },
      })
      .then(async (res) => {
        if (res.ok) {
          setSaveTemplateOpen(false);
          router.push("/rubrics");
          toast.success("Rubric created successfully.");
        } else {
          const err_text = await res.text();
          toast.error(err_text);
        }
      })
      .catch((err) => {
        toast.error("Caught an error");
        console.log(err);
      });
    }
  };

  return (
    <BaseComponent>
      <div className="bg-white w-full min-h-screen flex flex-col relative rounded-md px-10 py-6 border-2 border-black overflow-auto">
        <div className="flex items-center gap-x-10">
          <div className="flex items-start h-full">
            <IconButton onClick={() => { router.back(); }} sx={{ backgroundColor: 'black', '&:hover': { backgroundColor: '#333' } }}>
              <WestIcon sx={{ color: 'white' }} />
            </IconButton>
          </div>
          <div className="flex flex-col h-full gap-3 items-start justify-start w-full">
            <input
              value={rubric?.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Rubric Title"
              style={{ fontSize: '2.5em', fontWeight: 'bold', color: 'black', width: '100%', border: 'none', outline: 'none', }}
            />
            <TextField
              value={rubric?.description}
              onChange={(e) => handleChange("description", e.target.value)}
              fullWidth
              variant="standard"
              multiline
              placeholder="Description"
              InputProps={{ disableUnderline: true }}
              className="text-gray-500 ml-1"
            />
          </div>
          <Tooltip title="Mark this as check if this rubric has weights on each criterion.">
            <div className='p-3 flex gap-3 items-center text-xs rounded-md'>
              <FormControlLabel control={<Switch onChange={(e) => { setRubric((prev) => ({ ...prev, isWeighted: e.target.checked })); }} />} label="Weighted" />
            </div>
          </Tooltip>
        </div>

        <div className="p-6 rounded-lg mt-10">
          <Typography variant="h5" fontWeight={"bold"}>Criteria</Typography>
          {rubric?.criteria.map((criterion, index) => (
            <div key={index} className="border-b p-4 mb-2 flex gap-5 w-full items-start">
              <IndexEnumerator index={index + 1} />
              <div className="flex flex-1 flex-col gap-2">
                <TextField
                  value={criterion.title}
                  onChange={(e) => handleCriteriaChange(index, "title", e.target.value)}
                  variant="standard"
                  placeholder="Insert Criterion"
                  InputProps={{ disableUnderline: true, sx: { fontSize: '1.5em' } }}
                  className="font-semibold"
                />
                <TextField
                  value={criterion.description}
                  onChange={(e) => handleCriteriaChange(index, "description", e.target.value)}
                  multiline
                  variant="standard"
                  placeholder="Insert criterion description"
                  InputProps={{ disableUnderline: true }}
                  className="text-gray-600"
                />
                {
                  rubric.isWeighted ?
                    <span className="flex gap-3 items-center">
                      <Typography variant="caption" color="gray">{`Weight (%)`}</Typography>
                      <input min={1} max={100} onChange={(e) => handleCriteriaChange(index, "weight", parseFloat(e.target.value) || 0)} hidden={!rubric?.isWeighted} defaultValue={undefined} className="border-b-2 border-gray-300 p-1 w-fit " type="number" name="weight" id="weight" />
                    </span>
                    :
                    <></>
                }
              </div>
              <Tooltip title="Remove Criterion" arrow>
                <IconButton onClick={() => handleRemoveCriterion(index)}>
                  <CancelIcon color="error" />
                </IconButton>
              </Tooltip>
            </div>
          ))}

          <button
            onClick={handleAddCriterion}
            className="mt-4 px-4 py-2 bg-[black] text-white rounded-md hover:bg-[#353535] transition flex gap-3"
          >
            <AddCircleIcon /> Add Criterion
          </button>
        </div>

        <div className="flex justify-center w-full gap-5 mt-6">
          <Button sx={{ textTransform: 'none' }} onClick={() => router.push("/rubrics")} style={{ color: "#000" }}>
            Cancel
          </Button>
          <Button sx={{ textTransform: 'none' }}
            onClick={handleSaveTemplateOpen}
            style={{ background: dpurple, color: "#fff", padding: '0.5em 2.5em' }}
          >
            Save
          </Button>
        </div>

        <Dialog open={saveTemplateOpen} onClose={handleSaveTemplateClose} fullWidth maxWidth="sm">
          <DialogTitle className="text-[#7D57FC] font-bold">Save New Rubric</DialogTitle>
          <DialogContent>
            <p className="text-gray-600">Would you like to make this rubric template public?</p>
            <FormControlLabel
              control={<Checkbox checked={!isPrivate} onChange={(e) => setIsPrivate(false)} />}
              label="Make this template public"
            />
          </DialogContent>
          <DialogActions className="flex justify-center w-full">
            <Button onClick={handleSaveTemplateClose} style={{ color: "#000", fontWeight: "bold" }}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveRubric}
              style={{ background: "rgba(125,87,252,0.9)", color: "#fff", fontWeight: "bold" }}
            >
              Save Rubric
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </BaseComponent>
  );
}