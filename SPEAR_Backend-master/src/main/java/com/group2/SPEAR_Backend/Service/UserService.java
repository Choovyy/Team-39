package com.group2.SPEAR_Backend.Service;
import com.group2.SPEAR_Backend.DTO.PasswordResetDTO;
import com.group2.SPEAR_Backend.DTO.PasswordResetRequestDTO;
import com.group2.SPEAR_Backend.Model.PasswordResetToken;
import com.group2.SPEAR_Backend.Repository.PasswordResetTokenRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import com.group2.SPEAR_Backend.Model.User;
import com.group2.SPEAR_Backend.Repository.UserRepository;
import com.group2.SPEAR_Backend.Security.JWTUtil;
import com.group2.SPEAR_Backend.DTO.UserDTO;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;


import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class UserService implements UserDetailsService {

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private JWTUtil jwtUtil;
    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JavaMailSender mailSender;
    @Autowired
    private PasswordResetTokenRepository tokenRepo;


    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return userRepo.findByEmail(email).orElseThrow();
    }


    public UserDTO register(UserDTO req) {
        UserDTO resp = new UserDTO();

        try {
            Optional<User> opt = userRepo.findByEmail(req.getEmail());
            if (opt.isPresent()) {
                User existing = opt.get();

                if (Boolean.TRUE.equals(existing.getIsDeleted())) {
                    // revive isDeleted acc
                    existing.setIsDeleted(false);
                    existing.setFirstname(req.getFirstname());
                    existing.setLastname(req.getLastname());
                    existing.setPassword(passwordEncoder.encode(req.getPassword()));

                    String role = Optional.ofNullable(req.getRole())
                            .filter(r -> !r.isBlank())
                            .map(String::toUpperCase)
                            .orElse("STUDENT");
                    existing.setRole(role);

                    if ("TEACHER".equalsIgnoreCase(role)) {
                        existing.setInterests(req.getInterests());
                        existing.setDepartment(req.getDepartment());
                    } else {
                        existing.setInterests("N/A");
                        existing.setDepartment("N/A");
                    }

                    User restored = userRepo.save(existing);
                    resp.setStatusCode(200);
                    resp.setMessage("Account restored successfully.");
                    resp.setUid(restored.getUid());
                    resp.setFirstname(restored.getFirstname());
                    resp.setLastname(restored.getLastname());
                    resp.setEmail(restored.getEmail());
                    resp.setRole(restored.getRole());
                    resp.setInterests(restored.getInterests());
                    resp.setDepartment(restored.getDepartment());
                    return resp;
                }
                // still here? you madame/sir is an active user
                resp.setStatusCode(400);
                resp.setMessage("This email is already registered.");
                return resp;
            }

            //none
            User newUser = new User();
            newUser.setEmail(req.getEmail());
            newUser.setFirstname(req.getFirstname());
            newUser.setLastname(req.getLastname());

            String role = Optional.ofNullable(req.getRole())
                    .filter(r -> !r.isBlank())
                    .map(String::toUpperCase)
                    .orElse("STUDENT");
            newUser.setRole(role);

            if ("TEACHER".equalsIgnoreCase(role)) {
                newUser.setInterests(req.getInterests());
                newUser.setDepartment(req.getDepartment());
            } else {
                newUser.setInterests("N/A");
                newUser.setDepartment("N/A");
            }

            newUser.setPassword(passwordEncoder.encode(req.getPassword()));
            User saved = userRepo.save(newUser);

            resp.setStatusCode(200);
            resp.setMessage("User registered successfully.");
            resp.setUid(saved.getUid());
            resp.setFirstname(saved.getFirstname());
            resp.setLastname(saved.getLastname());
            resp.setEmail(saved.getEmail());
            resp.setRole(saved.getRole());
            resp.setInterests(saved.getInterests());
            resp.setDepartment(saved.getDepartment());

        } catch (Exception e) {
            resp.setStatusCode(500);
            resp.setError("Error: " + e.getMessage());
        }

        return resp;
    }



    public UserDTO login(UserDTO loginRequest) {
        UserDTO response = new UserDTO();
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getEmail(),
                            loginRequest.getPassword()
                    )
            );
            User user = userRepo.findByEmail(loginRequest.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (Boolean.TRUE.equals(user.getIsDeleted())) {
                throw new RuntimeException("User not found");
            }

            String jwt = jwtUtil.generateToken(user);
            String refreshToken = jwtUtil.generateRefreshToken(new HashMap<>(), user);

            response.setStatusCode(200);
            response.setToken(jwt);
            response.setRole(user.getRole());
            response.setRefreshToken(refreshToken);
            response.setExpirationTime("24Hrs");
            response.setMessage("Successfully Logged In");
            response.setUid(user.getUid());

        } catch (RuntimeException e) {
            response.setStatusCode(404);
            response.setMessage(e.getMessage());
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("An error occurred: " + e.getMessage());
        }
        return response;
    }


    public UserDTO refreshToken(UserDTO refreshTokenRequest){
        UserDTO response = new UserDTO();
        try{
            String ourEmail = jwtUtil.extractUsername(refreshTokenRequest.getToken());
            User users = userRepo.findByEmail(ourEmail).orElseThrow();
            if (jwtUtil.isTokenValid(refreshTokenRequest.getToken(), users)) {
                var jwt = jwtUtil.generateToken(users);
                response.setStatusCode(200);
                response.setToken(jwt);
                response.setRefreshToken(refreshTokenRequest.getToken());
                response.setExpirationTime("24Hr");
                response.setMessage("Successfully Refreshed Token");
            }
            response.setStatusCode(200);
            return response;

        }catch (Exception e){
            response.setStatusCode(500);
            response.setMessage(e.getMessage());
            return response;
        }
    }


    public UserDTO getAllUsers() {
        UserDTO userDTO = new UserDTO();
        try {
            List<User> result = userRepo.findByIsDeletedFalse();
            if (!result.isEmpty()) {
                userDTO.setUserList(result);
                userDTO.setStatusCode(200);
                userDTO.setMessage("Successful");
            } else {
                userDTO.setStatusCode(404);
                userDTO.setMessage("No users found");
            }
            return userDTO;
        } catch (Exception e) {
            userDTO.setStatusCode(500);
            userDTO.setMessage("Error occurred: " + e.getMessage());
            return userDTO;
        }
    }

    public UserDTO getUsersById(Integer id) {
        UserDTO userDTO = new UserDTO();
        try {
            User usersById = userRepo.findById(id).orElseThrow(() -> new RuntimeException("User Not found"));
            userDTO.setUser(usersById);
            userDTO.setStatusCode(200);
            userDTO.setMessage("Users with id '" + id + "' found successfully");
            userDTO.setDeleted(usersById.isDeleted());
        } catch (Exception e) {
            userDTO.setStatusCode(500);
            userDTO.setMessage("Error occurred: " + e.getMessage());
        }
        return userDTO;
    }


    public UserDTO deleteUserByEmail(String email) {
        UserDTO userDTO = new UserDTO();
        try {
            Optional<User> userOptional = userRepo.findByEmail(email); // Use findByEmail instead of findById
            if (userOptional.isPresent()) {
                User existingUser = userOptional.get();
                existingUser.setIsDeleted(true);
                userRepo.save(existingUser);

                userDTO.setStatusCode(200);
                userDTO.setMessage("User deleted successfully");
            } else {
                userDTO.setStatusCode(404);
                userDTO.setMessage("User not found");
            }
        } catch (Exception e) {
            userDTO.setStatusCode(500);
            userDTO.setMessage("Error occurred: " + e.getMessage());
        }
        return userDTO;
    }


    public UserDTO updateAdmin(Integer userId, User updatedUser) {
        UserDTO userDTO = new UserDTO();
        try {
            User existingUser = userRepo.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (updatedUser.getEmail() != null) existingUser.setEmail(updatedUser.getEmail());
            if (updatedUser.getFirstname() != null) existingUser.setFirstname(updatedUser.getFirstname());
            if (updatedUser.getLastname() != null) existingUser.setLastname(updatedUser.getLastname());
            if (updatedUser.getRole() != null) existingUser.setRole(updatedUser.getRole());
            existingUser.setIsDeleted(updatedUser.isDeleted());

            User savedUser = userRepo.save(existingUser);
            userDTO.setUser(savedUser);
            userDTO.setStatusCode(200);
            userDTO.setMessage("User updated successfully by Admin");
        } catch (Exception e) {
            userDTO.setStatusCode(500);
            userDTO.setMessage("Error occurred: " + e.getMessage());
        }
        return userDTO;
    }

    public UserDTO updateTeacher(Integer userId, User updatedUser) {
        UserDTO userDTO = new UserDTO();
        try {
            if (updatedUser.getRole() == null || updatedUser.getRole().trim().isEmpty()) {
                updatedUser.setRole("TEACHER"); // Set default role
            }
            User existingUser = userRepo.findById(userId)
                    .filter(user -> "TEACHER".equalsIgnoreCase(user.getRole()))
                    .orElseThrow(() -> new RuntimeException("Teacher not found"));

            if (updatedUser.getEmail() != null && !updatedUser.getEmail().isEmpty()) {
                existingUser.setEmail(updatedUser.getEmail());
            }
            if (updatedUser.getFirstname() != null && !updatedUser.getFirstname().isEmpty()) {
                existingUser.setFirstname(updatedUser.getFirstname());
            }
            if (updatedUser.getLastname() != null && !updatedUser.getLastname().isEmpty()) {
                existingUser.setLastname(updatedUser.getLastname());
            }
            if (updatedUser.getInterests() != null && !updatedUser.getInterests().isEmpty()) {
                existingUser.setInterests(updatedUser.getInterests());
            } else {
                existingUser.setInterests("N/A");
            }
            if (updatedUser.getDepartment() != null && !updatedUser.getDepartment().isEmpty()) {
                existingUser.setDepartment(updatedUser.getDepartment());
            } else {
                existingUser.setDepartment("N/A");
            }

            User savedUser = userRepo.save(existingUser);

            userDTO.setUser(savedUser);
            userDTO.setUid(savedUser.getUid());
            userDTO.setFirstname(savedUser.getFirstname());
            userDTO.setLastname(savedUser.getLastname());
            userDTO.setEmail(savedUser.getEmail());
            userDTO.setRole(savedUser.getRole());
            userDTO.setInterests(savedUser.getInterests());
            userDTO.setDepartment(savedUser.getDepartment());

            userDTO.setStatusCode(200);
            userDTO.setMessage("Teacher profile updated successfully.");
        } catch (Exception e) {
            userDTO.setStatusCode(400);
            userDTO.setMessage("Bad Request: " + e.getMessage());
        }
        return userDTO;
    }



    public UserDTO updateStudent(Integer userId, User updatedUser) {
        UserDTO userDTO = new UserDTO();
        try {
            User existingUser = userRepo.findById(userId)
                    .filter(user -> "STUDENT".equalsIgnoreCase(user.getRole()))
                    .orElseThrow(() -> new RuntimeException("Student not found"));

            if (updatedUser.getEmail() != null && !updatedUser.getEmail().isEmpty()) {
                existingUser.setEmail(updatedUser.getEmail());
            }
            if (updatedUser.getFirstname() != null && !updatedUser.getFirstname().isEmpty()) {
                existingUser.setFirstname(updatedUser.getFirstname());
            }
            if (updatedUser.getLastname() != null && !updatedUser.getLastname().isEmpty()) {
                existingUser.setLastname(updatedUser.getLastname());
            }

            User savedUser = userRepo.save(existingUser);
            userDTO.setUser(savedUser);
            userDTO.setStatusCode(200);
            userDTO.setMessage("User updated successfully by Student");
        } catch (Exception e) {
            userDTO.setStatusCode(500);
            userDTO.setMessage("Error occurred: " + e.getMessage());
        }
        return userDTO;
    }





    public UserDTO getProfileById(Integer userId) {
        UserDTO userDTO = new UserDTO();
        try {
            User user = userRepo.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
            userDTO.setFirstname(user.getFirstname());
            userDTO.setLastname(user.getLastname());
            userDTO.setStatusCode(200);
            userDTO.setMessage("User found successfully");
        } catch (Exception e) {
            userDTO.setStatusCode(500);
            userDTO.setMessage("Error occurred: " + e.getMessage());
        }
        return userDTO;
    }



    public List<UserDTO> getAllActiveUsers() {
        return userRepo.fetchAllUsersNotDeleted();
    }

    public List<UserDTO> getAllActiveStudents() {
        return userRepo.fetchAllActiveStudents();
    }

    public List<UserDTO> getAllActiveTeachers() {
        return userRepo.fetchAllActiveTeachers();
    }

    public List<UserDTO> getAllSoftDeletedTeachers() {
        return userRepo.fetchAllSoftDeletedTeachers();
    }

    public List<UserDTO> getAllSoftDeletedStudents() {
        return userRepo.fetchAllSoftDeletedStudents();
    }

    public List<UserDTO> getAllSoftDeletedUsers() {
        return userRepo.fetchAllSoftDeletedUsers();
    }

    public List<UserDTO> getActiveUsersByName(String firstname, String lastname) {
        try {
            return userRepo.findActiveUsersByName(firstname, lastname);
        } catch (Exception e) {
            throw new RuntimeException("Error occurred while fetching users: " + e.getMessage());
        }
    }

    public UserDTO getTeacherById(Integer userId) {
        UserDTO response = new UserDTO();
        try {
            User teacher = userRepo.findById(userId)
                    .filter(user -> "TEACHER".equalsIgnoreCase(user.getRole()))
                    .orElseThrow(() -> new RuntimeException("Teacher not found with ID: " + userId));

            response.setUid(teacher.getUid());
            response.setEmail(teacher.getEmail());
            response.setFirstname(teacher.getFirstname());
            response.setLastname(teacher.getLastname());
            response.setRole(teacher.getRole());
            response.setInterests(teacher.getInterests());
            response.setDepartment(teacher.getDepartment());

            response.setStatusCode(200);
            response.setMessage("Teacher found successfully.");

        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error occurred: " + e.getMessage());
        }
        return response;
    }


    public UserDTO getAdminById(Integer userId) {
        UserDTO response = new UserDTO();
        try {
            User admin = userRepo.findById(userId)
                    .filter(user -> "ADMIN".equalsIgnoreCase(user.getRole()))
                    .orElseThrow(() -> new RuntimeException("Admin not found with ID: " + userId));

            response.setEmail(admin.getEmail());
            response.setFirstname(admin.getFirstname());
            response.setLastname(admin.getLastname());
            response.setPassword(admin.getPassword());
            response.setStatusCode(200);
            response.setMessage("Admin found successfully");

        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error occurred: " + e.getMessage());
        }
        return response;
    }


    public UserDTO getStudentById(Integer userId) {
        UserDTO response = new UserDTO();
        try {
            User student = userRepo.findById(userId)
                    .filter(user -> "STUDENT".equalsIgnoreCase(user.getRole()))
                    .orElseThrow(() -> new RuntimeException("Student not found with ID: " + userId));

            response.setEmail(student.getEmail());
            response.setFirstname(student.getFirstname());
            response.setLastname(student.getLastname());
            response.setPassword(student.getPassword());
            response.setStatusCode(200);
            response.setMessage("Student found successfully");

        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error occurred: " + e.getMessage());
        }
        return response;
    }

    public UserDTO updatePassword(Integer userId, String currentPassword, String newPassword) {
        UserDTO userDTO = new UserDTO();
        try {
            User existingUser = userRepo.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (!passwordEncoder.matches(currentPassword, existingUser.getPassword())) {
                userDTO.setStatusCode(400);
                userDTO.setMessage("Current password is incorrect.");
                return userDTO;
            }

            existingUser.setPassword(passwordEncoder.encode(newPassword));
            userRepo.save(existingUser);

            userDTO.setStatusCode(200);
            userDTO.setMessage("Password updated successfully.");
        } catch (Exception e) {
            userDTO.setStatusCode(500);
            userDTO.setMessage("Error updating password: " + e.getMessage());
        }
        return userDTO;
    }

    public List<UserDTO> getAvailableStudentsForTeam(Long classId) {
        List<User> availableStudents = userRepo.findAvailableStudentsForTeam(classId);
        return availableStudents.stream()
                .map(student -> new UserDTO(student.getFirstname(), student.getLastname(), student.getEmail(), student.getUid()))
                .collect(Collectors.toList());
    }

    @Transactional
    public UserDTO sendResetCode(PasswordResetRequestDTO req) {
        UserDTO resp = new UserDTO();

        // 1) lookup & guard
        User user = userRepo.findByEmail(req.email())
                .filter(u -> !u.getIsDeleted())
                .orElse(null);
        if (user == null) {
            resp.setStatusCode(404);
            resp.setMessage("User not found");
            return resp;
        }

        // 2) find existing token, if any
        Optional<PasswordResetToken> tokOpt = tokenRepo.findByUser(user);
        String code = String.valueOf(new Random().nextInt(900_000) + 100_000);
        Instant newExpiry = Instant.now().plus(3, ChronoUnit.MINUTES);

        if (tokOpt.isPresent()) {
            PasswordResetToken tok = tokOpt.get();
            if (tok.getExpiresAt().isAfter(Instant.now())) {
                // still valid → bail
                resp.setStatusCode(429);
                resp.setMessage("A reset code was already sent. Please wait until it expires.");
                return resp;
            }
            // expired → just overwrite it
            tok.setToken(code);
            tok.setExpiresAt(newExpiry);
            tokenRepo.save(tok);
        } else {
            // no existing row → create one
            PasswordResetToken tok = new PasswordResetToken();
            tok.setUser(user);
            tok.setToken(code);
            tok.setExpiresAt(newExpiry);
            tokenRepo.save(tok);
        }

        // 3) email out
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setTo(user.getEmail());
        msg.setSubject("Your SPEAR Password Reset Code");
        msg.setText(String.join("\n",
                "Hi " + user.getFirstname() + ",",
                "",
                "Use this code to reset your SPEAR password: " + code,
                "It expires in 3 minutes.",
                "",
                "– The SPEAR Team"
        ));
        mailSender.send(msg);

        resp.setStatusCode(200);
        resp.setMessage("Reset code sent to email");
        return resp;
    }

    @Transactional
    // 2) Verify code & reset password
    public UserDTO resetPassword(PasswordResetDTO req) {
        UserDTO resp = new UserDTO();
        Optional<User> userOpt = userRepo.findByEmail(req.email());
        if (userOpt.isEmpty() || userOpt.get().getIsDeleted()) {
            resp.setStatusCode(404);
            resp.setMessage("User not found");
            return resp;
        }
        User user = userOpt.get();

        Optional<PasswordResetToken> tokenOpt = tokenRepo.findByToken(req.token());
        if (tokenOpt.isEmpty() || tokenOpt.get().getExpiresAt().isBefore(Instant.now())) {
            resp.setStatusCode(400);
            resp.setMessage("Invalid or expired reset code");
            return resp;
        }

        // all good → update password
        user.setPassword(passwordEncoder.encode(req.newPassword()));
        userRepo.save(user);

        // clean up token
        tokenRepo.delete(tokenOpt.get());

        resp.setStatusCode(200);
        resp.setMessage("Password has been reset");
        return resp;
    }








}