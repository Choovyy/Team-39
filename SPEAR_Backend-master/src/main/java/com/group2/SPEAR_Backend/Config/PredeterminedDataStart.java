package com.group2.SPEAR_Backend.Config;

import java.util.logging.Logger;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;
import jakarta.annotation.PostConstruct;

import com.group2.SPEAR_Backend.Model.User;
import com.group2.SPEAR_Backend.Repository.UserRepository;


@Component
public class PredeterminedDataStart {

    @Autowired
    private UserRepository urepo;
    static Logger logger = Logger.getLogger(PredeterminedDataStart.class.getName());

    @PostConstruct
    public void init() {
        if(urepo.count() == 0) {

            User admin = new User();
            admin.setFirstname("Application");
            admin.setLastname("Admin");
            admin.setEmail("admin123@cit.edu");

            BCryptPasswordEncoder bcrypt = new BCryptPasswordEncoder();
            String encryptedPwd = bcrypt.encode("admin123");
            admin.setPassword(encryptedPwd);

            admin.setRole("ADMIN");
            admin.setDeleted(false);
            admin.setInterests("N/A");
            admin.setDepartment("N/A");

            urepo.save(admin);
            logger.info("Admin Created!");
        }
    }
}
