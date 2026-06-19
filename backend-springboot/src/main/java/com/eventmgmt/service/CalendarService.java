package com.eventmgmt.service;

import com.eventmgmt.model.Event;
import com.eventmgmt.exception.ResourceNotFoundException;
import com.eventmgmt.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Service
@RequiredArgsConstructor
public class CalendarService {

    private final EventRepository eventRepository;

    public String generateGoogleCalendarLink(String eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));

        String dateStr = event.getDate().format(DateTimeFormatter.BASIC_ISO_DATE);
        String timeStr = event.getTime().format(DateTimeFormatter.ofPattern("HHmmss"));
        String start = dateStr + "T" + timeStr;
        String end = dateStr + "T" + event.getTime().plusHours(2).format(DateTimeFormatter.ofPattern("HHmmss"));

        return "https://calendar.google.com/calendar/event?action=TEMPLATE"
                + "&text=" + encode(event.getTitle())
                + "&dates=" + start + "/" + end
                + "&details=" + encode(event.getDescription())
                + "&location=" + encode(event.getVenue());
    }

    public String generateICalContent(String eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));

        String dateStr = event.getDate().format(DateTimeFormatter.BASIC_ISO_DATE);
        String timeStr = event.getTime().format(DateTimeFormatter.ofPattern("HHmmss"));
        String endTimeStr = event.getTime().plusHours(2).format(DateTimeFormatter.ofPattern("HHmmss"));

        return "BEGIN:VCALENDAR\r\n"
                + "VERSION:2.0\r\n"
                + "PRODID:-//UniEvents//EN\r\n"
                + "BEGIN:VEVENT\r\n"
                + "DTSTART:" + dateStr + "T" + timeStr + "\r\n"
                + "DTEND:" + dateStr + "T" + endTimeStr + "\r\n"
                + "SUMMARY:" + event.getTitle() + "\r\n"
                + "DESCRIPTION:" + event.getDescription().replace("\n", "\\n") + "\r\n"
                + "LOCATION:" + event.getVenue() + "\r\n"
                + "END:VEVENT\r\n"
                + "END:VCALENDAR\r\n";
    }

    private String encode(String s) {
        return URLEncoder.encode(s, StandardCharsets.UTF_8);
    }
}
