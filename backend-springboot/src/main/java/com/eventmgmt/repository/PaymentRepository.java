package com.eventmgmt.repository;

import com.eventmgmt.model.Payment;
import com.eventmgmt.model.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, String> {
    List<Payment> findByRegistrationUserId(String userId);

    @Query("SELECT p FROM Payment p WHERE p.registration.event.id = :eventId")
    List<Payment> findByEventId(String eventId);

    Optional<Payment> findByStripePaymentId(String stripePaymentId);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.registration.event.id = :eventId AND p.status = 'COMPLETED'")
    Double getTotalRevenueByEventId(String eventId);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.status = 'COMPLETED'")
    Double getTotalRevenue();

    long countByStatus(PaymentStatus status);
}
