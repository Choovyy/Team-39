package com.group2.SPEAR_Backend.Controller;

import
        com.group2.SPEAR_Backend.DTO.ClassesDTO;
import com.group2.SPEAR_Backend.DTO.UserDTO;
import com.group2.SPEAR_Backend.Model.Classes;
import com.group2.SPEAR_Backend.Model.User;
import com.group2.SPEAR_Backend.Repository.ClassesRepository;
import com.group2.SPEAR_Backend.Repository.UserRepository;
import com.group2.SPEAR_Backend.Service.ClassesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.*;

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
public class ClassesController {

    @Autowired
    private ClassesService cServ;

    @Autowired
    private UserRepository uRepo;

    @Autowired
    private ClassesRepository cRepo;


    //all teacher services
    @PostMapping("/teacher/create-class")
    public ResponseEntity<ClassesDTO> createClass(@RequestBody ClassesDTO classRequest) {
        ClassesDTO response = cServ.createClass(classRequest);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @GetMapping("/getallclasses")
    public ResponseEntity<List<ClassesDTO>> getAllClasses() {
        List<ClassesDTO> response = cServ.getAllClasses();
        return ResponseEntity.ok(response);
    }


    @GetMapping("/teacher/classes-created/{userId}")
    public ResponseEntity<?> getClassesCreatedByUser(@PathVariable int userId) {
        try {
            List<ClassesDTO> classes = cServ.getClassesCreatedByUser(userId);
            return ResponseEntity.ok(classes);
        } catch (RuntimeException e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }



    @PutMapping("/teacher/updateClass/{classId}")
    public ResponseEntity<ClassesDTO> updateClass(@PathVariable Long classId, @RequestBody ClassesDTO classRequest) {
        ClassesDTO response = cServ.updateClass(classId, classRequest);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @DeleteMapping("/teacher/deleteClass/{id}")
    public ResponseEntity<ClassesDTO> deleteClass(@PathVariable Long id) {
        ClassesDTO response = cServ.deleteClass(id);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @GetMapping("/teacher/class/{courseCode}/{section}")
    public ResponseEntity<ClassesDTO> getClassByCourseCodeAndSection(
            @PathVariable String courseCode,
            @PathVariable String section) {
        ClassesDTO response = cServ.getClassByCourseCode(courseCode, section);
        if (response == null) {
            return ResponseEntity.status(404).body(null);
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/class/{courseCode}/{section}")
    public ResponseEntity<ClassesDTO> getClassByCourseCodeAndSectionStudent(
            @PathVariable String courseCode,
            @PathVariable String section) {
        ClassesDTO response = cServ.getClassByCourseCodeStudent(courseCode, section);
        if (response == null) {
            return ResponseEntity.status(404).body(null);
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/teacher/getclassKey/{courseCode}/{section}")
    public ResponseEntity<ClassesDTO> getClassKeyByCourseCodeAndSection(
            @PathVariable String courseCode,
            @PathVariable String section) {
        ClassesDTO response = cServ.getClassKeyByCourseCodeAndSection(courseCode, section);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }



    @PostMapping("/student/enroll")
    public ResponseEntity<ClassesDTO> enrollStudentByClassKey(
            @RequestBody Map<String, String> requestBody,
            Principal principal) {
        String classKey = requestBody.get("classKey");
        String email = principal.getName();
        ClassesDTO response = cServ.enrollStudentByClassKey(classKey, email);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @GetMapping("/class/{classId}/total-users")
    public ResponseEntity<Long> getTotalUsersInClass(@PathVariable Long classId) {
        Long totalUsers = cServ.getTotalUsersInClass(classId);
        if (totalUsers == null) {
            return ResponseEntity.ok(0L);
        }
        return ResponseEntity.ok(totalUsers);
    }

    @GetMapping("/class/{classKey}/students")
    public ResponseEntity<List<UserDTO>> getStudentsInClass(@PathVariable String classKey) {
        List<UserDTO> response = cServ.getStudentsInClass(classKey);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/student/{studentId}/enrolled-classes")
    public ResponseEntity<List<ClassesDTO>> getClassesForStudent(@PathVariable int studentId) {
        List<ClassesDTO> response = cServ.getClassesForStudent(studentId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/teacher/remove-student")
    public ResponseEntity<ClassesDTO> removeStudentFromClass(@RequestBody Map<String, String> requestBody) {
        String classKey = requestBody.get("classKey");
        String email = requestBody.get("email");
        ClassesDTO response = cServ.removeStudentFromClass(classKey, email);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @GetMapping("/class/{classId}")
    public ResponseEntity<ClassesDTO> getClassById(@PathVariable Long classId) {
        try {
            ClassesDTO response = cServ.getClassById(classId);
            return ResponseEntity.ok(response);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(404).body(new ClassesDTO(404, e.getMessage(), (List<Classes>) null));
        }
    }

    //this is for selecting advisers
    //need fixing
    @GetMapping("/teacher/see-teachers/{department}")
    public ResponseEntity<List<UserDTO>> getTeachersByDepartment(@PathVariable String department) {
        return ResponseEntity.ok(cServ.getTeachersByDepartment(department));
    }


    //this bitch is for checking duplicate in creating a class
    @GetMapping("/teacher/classes/check-duplicate")
    public ResponseEntity<Map<String, Boolean>> checkDuplicateClass(
            @RequestParam String courseCode,
            @RequestParam String section,
            @RequestParam String schoolYear) {

        Optional<Classes> existingClass = cRepo.findByCourseCodeAndSectionAndSchoolYear(courseCode, section, schoolYear);

        Map<String, Boolean> response = new HashMap<>();
        response.put("exists", existingClass.isPresent());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/class/{classId}/advisers")
    public ResponseEntity<List<UserDTO>> getAllAdvisersForClass(@PathVariable Long classId) {
        List<UserDTO> advisers = cServ.getQualifiedAdvisersForClass(classId);
        return ResponseEntity.ok(advisers);
    }

    @GetMapping("/admin/classes/deleted")
    public ResponseEntity<List<ClassesDTO>> getAllDeletedClasses() {
        return ResponseEntity.ok(cServ.getAllDeletedClasses());
    }

    @GetMapping("/class/advisory-needed")
    public ResponseEntity<List<ClassesDTO>> getClassesThatNeedAdvisory() {
        List<ClassesDTO> advisoryClasses = cServ.getClassesThatNeedAdvisory();
        return ResponseEntity.ok(advisoryClasses);
    }









}
