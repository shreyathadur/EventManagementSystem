package com.eventmgmt.service;

import com.eventmgmt.model.Event;
import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.eventmgmt.model.Registration;
import com.eventmgmt.repository.EventRepository;
import com.eventmgmt.repository.RegistrationRepository;
import com.eventmgmt.repository.PaymentRepository;
import com.eventmgmt.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.awt.*;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final EventRepository eventRepository;
    private final RegistrationRepository registrationRepository;
    private final PaymentRepository paymentRepository;

    public byte[] generateEventAttendanceReport(String eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));
        List<Registration> registrations = registrationRepository.findByEventIdWithDetails(eventId);

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4);
        PdfWriter.getInstance(document, out);
        document.open();

        Font titleFont = new Font(Font.HELVETICA, 20, Font.BOLD, new Color(26, 86, 219));
        Font headerFont = new Font(Font.HELVETICA, 12, Font.BOLD, Color.WHITE);
        Font bodyFont = new Font(Font.HELVETICA, 10, Font.NORMAL);

        // Title
        Paragraph title = new Paragraph("Event Attendance Report", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(20);
        document.add(title);

        // Event details
        document.add(new Paragraph("Event: " + event.getTitle(), new Font(Font.HELVETICA, 14, Font.BOLD)));
        document.add(new Paragraph("Date: " + event.getDate().format(DateTimeFormatter.ISO_LOCAL_DATE), bodyFont));
        document.add(new Paragraph("Venue: " + event.getVenue(), bodyFont));
        document.add(new Paragraph("Total Registrations: " + registrations.size(), bodyFont));
        document.add(new Paragraph("Max Attendees: " + event.getMaxAttendees(), bodyFont));
        document.add(new Paragraph(" "));

        // Revenue
        Double revenue = paymentRepository.getTotalRevenueByEventId(eventId);
        document.add(new Paragraph("Total Revenue: $" + String.format("%.2f", revenue), bodyFont));
        document.add(new Paragraph(" "));

        // Attendee table
        PdfPTable table = new PdfPTable(4);
        table.setWidthPercentage(100);

        String[] headers = {"Name", "Email", "Status", "Checked In"};
        for (String h : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(h, headerFont));
            cell.setBackgroundColor(new Color(26, 86, 219));
            cell.setPadding(8);
            table.addCell(cell);
        }

        for (Registration reg : registrations) {
            table.addCell(new PdfPCell(new Phrase(reg.getUser().getName(), bodyFont)));
            table.addCell(new PdfPCell(new Phrase(reg.getUser().getEmail(), bodyFont)));
            table.addCell(new PdfPCell(new Phrase(reg.getStatus().name(), bodyFont)));
            table.addCell(new PdfPCell(new Phrase(reg.isCheckedIn() ? "Yes" : "No", bodyFont)));
        }

        document.add(table);
        document.close();
        return out.toByteArray();
    }

    public byte[] generateMonthlyReport() {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4);
        PdfWriter.getInstance(document, out);
        document.open();

        Font titleFont = new Font(Font.HELVETICA, 20, Font.BOLD, new Color(26, 86, 219));
        Font bodyFont = new Font(Font.HELVETICA, 11, Font.NORMAL);

        Paragraph title = new Paragraph("Monthly Statistics Report", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(20);
        document.add(title);

        long totalEvents = eventRepository.count();
        Double totalRevenue = paymentRepository.getTotalRevenue();

        document.add(new Paragraph("Total Events: " + totalEvents, bodyFont));
        document.add(new Paragraph("Total Revenue: $" + String.format("%.2f", totalRevenue), bodyFont));
        document.add(new Paragraph("Report generated: " + java.time.LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME), bodyFont));

        document.close();
        return out.toByteArray();
    }
}
