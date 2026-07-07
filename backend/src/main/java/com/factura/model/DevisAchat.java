package com.factura.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.util.Date;
import java.util.UUID;

@Entity
@Table(name = "devis_achats")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DevisAchat {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false)
    private String number;

    @Column(name = "supplier_name")
    private String supplierName;

    @Temporal(TemporalType.DATE)
    private Date date;

    @Temporal(TemporalType.DATE)
    private Date expirationDate;

    private String description;
    private Double amount;

    @Enumerated(EnumType.STRING)
    private DevisAchatStatus status;

    private String comments;
    private String pdfUrl;
    private String fileName;

    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;

    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedAt;

    @JsonIgnore
    @OneToOne(mappedBy = "devisAchat", cascade = CascadeType.ALL)
    private FactureAchat factureAchat;

    @PrePersist
    protected void onCreate() {
        createdAt = new Date();
        updatedAt = new Date();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = new Date();
    }

    public enum DevisAchatStatus {
        pending, accepted, refused, validated
    }
}
