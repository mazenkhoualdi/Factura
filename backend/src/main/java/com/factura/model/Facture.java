package com.factura.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
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

    @JsonBackReference  // ← AJOUTER
    @OneToOne
    @JoinColumn(name = "attachement_id", unique = true)
    private Attachement attachement;

    @Column(name = "attachment_number")
    private String attachmentNumber;

    // Référence à la facture d'achat liée
    // permettant de calculer le gain = montant facture vente - montant facture achat
    @ManyToOne
    @JoinColumn(name = "facture_achat_id")
    private FactureAchat factureAchat;

    @Column(name = "facture_achat_number")
    private String factureAchatNumber;

    @Temporal(TemporalType.DATE)
    private Date date;

    private String description;
    private Double amount;

    // Gain = montant de cette facture de vente - montant de la facture d'achat liée
    private Double gain;

    @Enumerated(EnumType.STRING)
    private FactureStatus status;

    private String comments;
    private String pdfUrl;
    private String fileName;

    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;

    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedAt;

    @JsonManagedReference  // ← AJOUTER
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