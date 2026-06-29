package com.factura.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.Date;
import java.util.UUID;

@Entity
@Table(name = "bl")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BL {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false)
    private String number;

    @OneToOne
    @JoinColumn(name = "bdc_id", unique = true)
    private BDC bdc;

    @Temporal(TemporalType.DATE)
    private Date date;

    private String description;
    private Double amount;

    @Enumerated(EnumType.STRING)
    private BlStatus status;

    private String comments;
    private String pdfUrl;
    private String fileName;

    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;

    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedAt;

    @OneToOne(mappedBy = "bl", cascade = CascadeType.ALL)
    private Attachement attachement;

    @PrePersist
    protected void onCreate() {
        createdAt = new Date();
        updatedAt = new Date();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = new Date();
    }

    public enum BlStatus {
        preparing, delivered, partial, cancelled
    }
}