"use client";
import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';
import { lgreen, dpurple } from "@/Utils/Global_variables"; 

const RubricDetailModal = ({ open, onClose, rubric }) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      {rubric ? (
        <>
          <DialogTitle>
            <strong>{rubric.title}</strong>
            <Typography variant="body1" >
              {rubric.description}
            </Typography>
          </DialogTitle>
          <hr />
          <DialogContent>
            {rubric.criteria.map((criterion, index) => (
              <div key={index} 
                style={{ 
                    marginBottom: 10, 
                    backgroundColor: index % 2 === 0 ? '#f5f5f5' : 'transparent', 
                    padding: '5px', borderRadius: '4px'  
                    }}>
                <Typography variant="body2">
                  <span style={{ backgroundColor: lgreen, padding: '2px 5px', borderRadius: '3px' }}>
                    {index + 1}.
                  </span> 
                  <strong>{criterion.title}</strong>
                </Typography>
                <Typography variant="body2" style={{ lineHeight: '1.2' }}>
                  {criterion.description}
                </Typography>
                {rubric.isWeighted && criterion.weight !== undefined && (
                  <Typography variant="body2" sx={{ opacity: 0.5 }}>Weight: {criterion.weight}%</Typography>
                )}
              </div>
            ))}
          </DialogContent>
        </>
      ) : (
        <DialogContent>
          <Typography variant="body1">No rubric selected.</Typography>
        </DialogContent>
      )}
      <DialogActions>
        <Button onClick={onClose} sx={{ color: dpurple }}>Ok</Button>
      </DialogActions>
    </Dialog>
  );
};

export default RubricDetailModal;