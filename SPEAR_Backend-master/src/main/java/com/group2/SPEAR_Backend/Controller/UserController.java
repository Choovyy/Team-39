package com.group2.SPEAR_Backend.Controller;

import com.group2.SPEAR_Backend.DTO.PasswordResetDTO;
import com.group2.SPEAR_Backend.DTO.PasswordResetRequestDTO;
import com.group2.SPEAR_Backend.DTO.PasswordUpdateDTO;
import com.group2.SPEAR_Backend.Model.User;
import com.group2.SPEAR_Backend.DTO.UserDTO;
import com.group2.SPEAR_Backend.Service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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
public class UserController {

    @Autowired
    private UserService uServ;

    @PostMapping("/register")
    public ResponseEntity<UserDTO> register(@RequestBody UserDTO reg){
        return ResponseEntity.ok(uServ.register(reg));
    }

    @PostMapping("/login")
    public ResponseEntity<UserDTO> login(@RequestBody UserDTO req){
        return ResponseEntity.ok(uServ.login(req));
    }

    @PostMapping("/auth/refresh")
    public ResponseEntity<UserDTO> refreshToken(@RequestBody UserDTO req){
        return ResponseEntity.ok(uServ.refreshToken(req));
    }

    @GetMapping("/admin/get-all-users")
    public ResponseEntity<UserDTO> getAllUsers() {
        return ResponseEntity.ok(uServ.getAllUsers());
    }


    @GetMapping("/admin/getUsers/{userId}")
    public ResponseEntity<UserDTO> getUSerByID(@PathVariable Integer userId){
        return ResponseEntity.ok(uServ.getUsersById(userId));

    }

    @PutMapping("/admin/update/{userId}")
    public ResponseEntity<UserDTO> updateAdmin(@PathVariable Integer userId, @RequestBody User reqBody) {
        return ResponseEntity.ok(uServ.updateAdmin(userId, reqBody));
    }

    @PutMapping("/teacher/update/{userId}")
    public ResponseEntity<UserDTO> updateTeacher(@PathVariable Integer userId, @RequestBody User reqBody) {
        return ResponseEntity.ok(uServ.updateTeacher(userId, reqBody));
    }

    @PutMapping("/student/update/{userId}")
    public ResponseEntity<UserDTO> updateStudent(@PathVariable Integer userId, @RequestBody User reqBody) {
        return ResponseEntity.ok(uServ.updateStudent(userId, reqBody));
    }

    @GetMapping("/user/profile/{userId}")
    public ResponseEntity<UserDTO> getUserProfileById(@PathVariable Integer userId) {
        UserDTO userProfile = uServ.getProfileById(userId);
        if (userProfile != null && userProfile.getStatusCode() == 200) {
            return ResponseEntity.ok(userProfile);
        } else {
            return ResponseEntity.status(userProfile.getStatusCode()).body(userProfile);
        }
    }


    @DeleteMapping("/admin/delete/{email}")
    public ResponseEntity<UserDTO> deleteUser(@PathVariable String email) {
        return ResponseEntity.ok(uServ.deleteUserByEmail(email));
    }

    @GetMapping("/admin/users/active")
    public ResponseEntity<List<UserDTO>> getAllActiveUsers() {
        return ResponseEntity.ok(uServ.getAllActiveUsers());
    }

    @GetMapping("/admin/users/active-students")
    public ResponseEntity<List<UserDTO>> getAllActiveStudents() {
        return ResponseEntity.ok(uServ.getAllActiveStudents());
    }

    @GetMapping("/admin/users/active-teachers")
    public ResponseEntity<List<UserDTO>> getAllActiveTeachers() {
        return ResponseEntity.ok(uServ.getAllActiveTeachers());
    }

    @GetMapping("/users/advisers")
    public ResponseEntity<List<UserDTO>> getAllAdvisers() {
        return ResponseEntity.ok(uServ.getAllActiveTeachers());
    }

    @GetMapping("/admin/users/deleted-teachers")
    public ResponseEntity<List<UserDTO>> getAllSoftDeletedTeachers() {
        return ResponseEntity.ok(uServ.getAllSoftDeletedTeachers());
    }

    @GetMapping("/admin/users/deleted-students")
    public ResponseEntity<List<UserDTO>> getAllSoftDeletedStudents() {
        return ResponseEntity.ok(uServ.getAllSoftDeletedStudents());
    }

    @GetMapping("/users/search-by-name")
    public ResponseEntity<List<UserDTO>> getActiveUsersByName(
            @RequestParam(required = false) String firstname,
            @RequestParam(required = false) String lastname) {
        List<UserDTO> users = uServ.getActiveUsersByName(firstname, lastname);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/get-teacher/{userId}")
    public ResponseEntity<UserDTO> getTeacherById(@PathVariable Integer userId) {
        UserDTO response = uServ.getTeacherById(userId);
        if (response.getStatusCode() == 200) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(response.getStatusCode()).body(response);
        }

}

    @GetMapping("/get-admin/{userId}")
    public ResponseEntity<UserDTO> getAdminById(@PathVariable Integer userId) {
        UserDTO response = uServ.getAdminById(userId);
        if (response.getStatusCode() == 200) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(response.getStatusCode()).body(response);
        }
    }

    @GetMapping("/get-student/{userId}")
    public ResponseEntity<UserDTO> getStudentById(@PathVariable Integer userId) {
        UserDTO response = uServ.getStudentById(userId);
        if (response.getStatusCode() == 200) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(response.getStatusCode()).body(response);
        }
    }
    @PutMapping("/user/update-password/{userId}")
    public ResponseEntity<UserDTO> updatePassword(
            @PathVariable Integer userId,
            @RequestBody PasswordUpdateDTO passwordUpdateDTO) {
        UserDTO response = uServ.updatePassword(userId, passwordUpdateDTO.getCurrentPassword(), passwordUpdateDTO.getNewPassword());

        if (response.getStatusCode() == 400) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        } else if (response.getStatusCode() == 500) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }

        return ResponseEntity.ok(response);
    }

    @GetMapping("/class/{classId}/available-students")
    public ResponseEntity<List<UserDTO>> getAvailableStudents(@PathVariable Long classId) {
        return ResponseEntity.ok(uServ.getAvailableStudentsForTeam(classId));
    }

    @GetMapping("/admin/users/deleted")
    public ResponseEntity<List<UserDTO>> getAllSoftDeletedUsers() {
        return ResponseEntity.ok(uServ.getAllSoftDeletedUsers());
    }

    @PostMapping("/user/forgot-password")
    public ResponseEntity<UserDTO> forgotPassword(@RequestBody PasswordResetRequestDTO req) {
        UserDTO result = uServ.sendResetCode(req);
        return new ResponseEntity<>(result,
                HttpStatus.valueOf(result.getStatusCode()));
    }

    @PostMapping("/user/reset-password")
    public ResponseEntity<UserDTO> resetPassword(@RequestBody PasswordResetDTO req) {
        UserDTO result = uServ.resetPassword(req);
        return new ResponseEntity<>(result,
                HttpStatus.valueOf(result.getStatusCode()));
    }

















}