package com.group2.SPEAR_Backend.Controller;

import com.group2.SPEAR_Backend.DTO.ScheduleDTO;
import com.group2.SPEAR_Backend.Service.ScheduleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://10.147.17.37:5173",
        "http://localhost:3000",
        "http://localhost",
        "http://localhost:8081",
        "http://172.16.103.209:3000",
        "http://172.16.103.209",
        "http://172.16.103.209:8081"
})
public class ScheduleController {

    @Autowired
    private ScheduleService scheduleService;

    @PostMapping("/teacher/create-schedule")
    public ResponseEntity<ScheduleDTO> createSchedule(@RequestBody ScheduleDTO scheduleDTO) {
        return ResponseEntity.ok(scheduleService.createSchedule(scheduleDTO));
    }

    @GetMapping("/getallschedules")
    public ResponseEntity<List<ScheduleDTO>> getAllSchedules() {
        return ResponseEntity.ok(scheduleService.getAllSchedules());
    }

    @GetMapping("/teacher/schedules-needing-advisers")
    public ResponseEntity<List<ScheduleDTO>> getSchedulesForClassesNeedingAdvisers() {
        return ResponseEntity.ok(scheduleService.getSchedulesForClassesNeedingAdvisers());
    }

    @GetMapping("/teacher/get-my-schedule/{teacherId}")
    public ResponseEntity<List<ScheduleDTO>> getSchedulesByTeacher(@PathVariable int teacherId) {
        return ResponseEntity.ok(scheduleService.getSchedulesByTeacher(teacherId));
    }

    @GetMapping("teacher/schedule/by-teacher-and-class")
    public ResponseEntity<List<ScheduleDTO>> getSchedulesByTeacherNameAndClassCode(
            @RequestParam String teacherName,
            @RequestParam String classCode) {
        return ResponseEntity.ok(scheduleService.getSchedulesByTeacherNameAndClassCode(teacherName, classCode));
    }

    @PutMapping("teacher/update-schedule/{schedid}")
    public ResponseEntity<ScheduleDTO> updateSchedule(
            @PathVariable int schedid,
            @RequestBody ScheduleDTO updatedScheduleDTO
    ) {
        return ResponseEntity.ok(scheduleService.updateSchedule(schedid, updatedScheduleDTO));
    }

    @DeleteMapping("teacher/delete-schedule/{schedid}")
    public ResponseEntity<Map<String, String>> deleteSchedule(@PathVariable int schedid) {
        scheduleService.deleteSchedule(schedid);
        return ResponseEntity.ok(Map.of("message", "Schedule deleted successfully"));
    }
}
