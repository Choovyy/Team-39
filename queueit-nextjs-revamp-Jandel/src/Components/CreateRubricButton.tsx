"use client";
import * as React from 'react';
import { useRouter } from "next/navigation";
import { styled, alpha } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

const StyledMenu = styled((props) => (
  <Menu
    elevation={0}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'right',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'right',
    }}
    {...props}
  />
))(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 6,
    marginTop: theme.spacing(1),
    minWidth: 180,
    color: 'rgb(55, 65, 81)',
    boxShadow:
      'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
    '& .MuiMenu-list': {
      padding: '4px 0',
    },
    '& .MuiMenuItem-root': {
      '&:hover': {
        backgroundColor: alpha('#C2C6C8', 0.5),
      },
      '&:active': {
        backgroundColor: alpha(
          theme.palette.primary.main,
          theme.palette.action.selectedOpacity,
        ),
      },
    },
  },
}));

export default function CreateRubricButton({ onSelectAndMerge }) {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleCreateNewRubric = () => {
    handleClose();
    router.push("/rubrics/create");
  };

  return (
    <div>
      <Button
        aria-controls={open ? 'create-rubric-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        variant="contained"
        disableElevation
        onClick={handleClick}
        endIcon={<KeyboardArrowDownIcon />}
        className="relative inline-block px-4 py-2 bg-[#7D57FC] text-white font-semibold rounded-lg shadow-md hover:bg-[#6A45E0] transition"
        style={{ textTransform: 'none' }}
      >
        Create Rubric
      </Button>
      <StyledMenu
        id="create-rubric-menu"
        MenuListProps={{
          'aria-labelledby': 'create-rubric-button',
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        <MenuItem onClick={handleCreateNewRubric} disableRipple>
          Create a new rubric from scratch </MenuItem>
        <MenuItem onClick={() => { handleClose(); onSelectAndMerge(); }} disableRipple>
          Select and merge rubrics
        </MenuItem>
      </StyledMenu>
    </div>
  );
}