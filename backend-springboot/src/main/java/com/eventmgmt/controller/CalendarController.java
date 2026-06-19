package com.eventmgmt.controller;

import com.eventmgmt.service.CalendarService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/calendar")
@RequiredArgsConstructor
@Tag(name = "Calendar", description = "Calendar export (Google Calendar & iCal)")
public class CalendarController {

    private final CalendarService calendarService;

    @GetMapping("/google/{eventId}")
    @Operation(summary = "Get Google Calendar link for event")
    public ResponseEntity<Map<String, String>> getGoogleCalendarLink(@PathVariable String eventId) {
        String link = calendarService.generateGoogleCalendarLink(eventId);
        return ResponseEntity.ok(Map.of("url", link));
    }

    @GetMapping("/ical/{eventId}")
    @Operation(summary = "Download iCal file for event")
    public ResponseEntity<byte[]> downloadICal(@PathVariable String eventId) {
        String ical = calendarService.generateICalContent(eventId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=event_" + eventId + ".ics")
                .header(HttpHeaders.CONTENT_TYPE, "text/calendar")
                .body(ical.getBytes());
    }
}
