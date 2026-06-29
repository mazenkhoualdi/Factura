package com.factura.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.Date;
import java.util.UUID;

@Entity
@Table(name = "bdc")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BDC {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false)
    private String number;

    @OneToOne
    @JoinColumn(name = "devis_id", unique = true)
    private Devis devis;

    @Temporal(TemporalType.DATE)
    private Date date;

    private String description;
    private Double amount;

    @Enumerated(EnumType.STRING)
    private BdcStatus status;

    private String comments;
    private String pdfUrl;
    private String fileName;

    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;

    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedAt;

    @OneToOne(mappedBy = "bdc", cascade = CascadeType.ALL)
    private BL bl;

    @PrePersist
    protected void onCreate() {
        createdAt = new Date();
        updatedAt = new Date();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = new Date();
    }

    public enum BdcStatus {
        preparing, validated, cancelled
    }
}