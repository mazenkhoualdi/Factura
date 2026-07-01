package com.factura.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.Date;
import java.util.UUID;

@Entity
@Table(name = "societes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Societe {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    private String contactName;

    @Column(unique = true)
    private String email;

    private String phone;
    private String address;

    @Column(unique = true)
    private String fiscalId;

    @Column(unique = true)
    private String registryNumber;

    private String notes;
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
}