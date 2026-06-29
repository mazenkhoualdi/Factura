package com.factura.controller;

import com.factura.model.Notification;
import com.factura.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationRepository notificationRepository;

    @GetMapping
    public List<Notification> getAllNotifications() {
        return notificationRepository.findAll();
    }

    @PutMapping("/{id}/read")
    public Notification markAsRead(@PathVariable UUID id) {
        return notificationRepository.findById(id)
                .map(notification -> {
                    notification.setRead(true);
                    return notificationRepository.save(notification);
                })
                .orElse(null);
    }

    @PutMapping("/read-all")
    public List<Notification> markAllAsRead() {
        List<Notification> notifications = notificationRepository.findAll();
        notifications.forEach(n -> n.setRead(true));
        return notificationRepository.saveAll(notifications);
    }
}