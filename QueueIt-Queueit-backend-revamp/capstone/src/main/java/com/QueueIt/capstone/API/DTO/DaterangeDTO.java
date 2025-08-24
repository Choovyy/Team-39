package com.QueueIt.capstone.API.DTO;

import java.time.LocalDateTime;

public class DaterangeDTO {
    private LocalDateTime start;
    private LocalDateTime end;

    public DaterangeDTO(LocalDateTime start, LocalDateTime end) {
        this.start = start;
        this.end = end;
    }

    public LocalDateTime getStart() {
        return start;
    }

    public LocalDateTime getEnd() {
        return end;
    }
}
