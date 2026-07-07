package com.factura.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.util.Date;
import java.util.UUID;

@Entity
@Table(name = "factures_achats")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FactureAchat {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false)
    private String number;

    // Devis source (remplace l'attachement source des factures de vente)
    @JsonIgnoreProperties({"factureAchat"})
    @OneToOne
    @JoinColumn(name = "devis_achat_id", unique = true)
    private DevisAchat devisAchat;

    @Column(name = "devis_achat_number")
    private String devisAchatNumber;

    @Temporal(TemporalType.DATE)
    private Date date;

    private String description;
    private Double amount;

    @Enumerated(EnumType.STRING)
    private FactureAchatStatus status;

    private String comments;
    private String pdfUrl;
    private String fileName;

    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;

    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = new Date();
        updatedAt = new Date();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = new Date();
    }

    public enum FactureAchatStatus {
        unpaid, partial, paid, late
    }
}
