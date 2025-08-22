package com.group2.SPEAR_Backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.logging.Logger;

@SpringBootApplication
public class SpearBackendApplication {

	static Logger logger = Logger.getLogger(SpearBackendApplication.class.getName());

	public static void main(String[] args) {
		SpringApplication.run(SpearBackendApplication.class, args);
		logger.info("payrr");
	}
}