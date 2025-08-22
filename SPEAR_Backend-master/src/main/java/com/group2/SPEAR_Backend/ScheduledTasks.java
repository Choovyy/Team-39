package com.group2.SPEAR_Backend;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

public class ScheduledTasks {

    @Scheduled(fixedRate = 5000) // Runs every 5 seconds
    public void runTask() {
        System.out.println("Task executed at: " + System.currentTimeMillis());
    }

    @Scheduled(cron = "0 0 * * * *") // Runs at the start of every hour
    public void runCronTask() {
        System.out.println("Cron task executed at: " + System.currentTimeMillis());
    }

}
