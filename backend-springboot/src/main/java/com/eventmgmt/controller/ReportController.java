package com.eventmgmt.controller;

import com.eventmgmt.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Tag(name = "Reports", description = "PDF report generation")
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/event/{eventId}/attendance")
    @Operation(summary = "Generate event attendance report PDF")
    public ResponseEntity<byte[]> getEventAttendanceReport(@PathVariable String eventId) {
        byte[] pdf = reportService.generateEventAttendanceReport(eventId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=attendance_report_" + eventId + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping("/monthly")
    @Operation(summary = "Generate monthly statistics report PDF")
    public ResponseEntity<byte[]> getMonthlyReport() {
        byte[] pdf = reportService.generateMonthlyReport();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=monthly_report.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}
