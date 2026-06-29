package com.factura.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "factures")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Facture {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false)
    private String number;

    @OneToOne
    @JoinColumn(name = "attachement_id", unique = true)
    private Attachement attachement;

    @Temporal(TemporalType.DATE)
    private Date date;

    private String description;
    private Double amount;

    @Enumerated(EnumType.STRING)
    private FactureStatus status;

    private String comments;
    private String pdfUrl;
    private String fileName;

    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;

    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedAt;

    @OneToMany(mappedBy = "facture", cascade = CascadeType.ALL)
    private List<Paiement> paiements;

    @PrePersist
    protected void onCreate() {
        createdAt = new Date();
        updatedAt = new Date();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = new Date();
    }

    public enum FactureStatus {
        unpaid, partial, paid, late
    }
}