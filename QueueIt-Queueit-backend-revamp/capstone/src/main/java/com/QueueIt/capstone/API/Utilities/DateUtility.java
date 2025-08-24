package com.QueueIt.capstone.API.Utilities;

import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Component
public class DateUtility {

    public static String formatLocalDateTimeToReadable(LocalDateTime localDateTime){
        DateTimeFormatter dateTimeFormatter = DateTimeFormatter.ofPattern("EEEE, MMMM dd, yyyy hh:mm a");

        return localDateTime.format(dateTimeFormatter);
    }
}
