package com.factura.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.Date;
import java.util.UUID;

@Entity
@Table(name = "attachements")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Attachement {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false)
    private String number;

    @OneToOne
    @JoinColumn(name = "bl_id", unique = true)
    private BL bl;

    @Temporal(TemporalType.DATE)
    private Date date;

    private String description;
    private Double amount;

    @Enumerated(EnumType.STRING)
    private AttachementStatus status;

    @Temporal(TemporalType.DATE)
    private Date agreementDate;

    private String comments;
    private String pdfUrl;
    private String fileName;

    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;

    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedAt;

    @OneToOne(mappedBy = "attachement", cascade = CascadeType.ALL)
    private Facture facture;

    @PrePersist
    protected void onCreate() {
        createdAt = new Date();
        updatedAt = new Date();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = new Date();
    }

    public enum AttachementStatus {
        agreement, validated, contested, refused
    }
}