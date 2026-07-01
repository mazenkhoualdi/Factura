package com.factura.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.Date;
import java.util.UUID;

@Entity
@Table(name = "devis")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Devis {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false)
    private String number;

    @ManyToOne
    @JoinColumn(name = "client_id")
    private Client client;

    @Column(name = "client_name")
    private String clientName;

    @Column(name = "client_type")
    private String clientType;

    @Temporal(TemporalType.DATE)
    private Date date;

    @Temporal(TemporalType.DATE)
    private Date expirationDate;

    private String description;
    private Double amount;

    @Enumerated(EnumType.STRING)
    private DevisStatus status;

    private String comments;
    private String pdfUrl;
    private String fileName;

    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;

    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedAt;

    @OneToOne(mappedBy = "devis", cascade = CascadeType.ALL)
    private BDC bdc;

    @PrePersist
    protected void onCreate() {
        createdAt = new Date();
        updatedAt = new Date();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = new Date();
    }

    // ============================================================
    // MÉTHODE GETTER POUR clientId (AJOUTÉE)
    // ============================================================
    public UUID getClientId() {
        return client != null ? client.getId() : null;
    }

    public enum DevisStatus {
        pending, accepted, refused, validated
    }
}