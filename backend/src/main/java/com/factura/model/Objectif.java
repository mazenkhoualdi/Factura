package com.factura.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.Date;

/**
 * Représente un objectif chiffré configurable par l'utilisateur (ex : objectif
 * de gain total sur les achats). Une seule ligne par "cle" est conservée
 * (upsert), ce qui permet d'ajouter facilement d'autres objectifs à l'avenir
 * (ex: objectif de chiffre d'affaires, objectif d'encaissement, etc.).
 */
@Entity
@Table(name = "objectifs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Objectif {

    @Id
    private String cle;

    private Double montant;

    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedAt;

    @PrePersist
    @PreUpdate
    protected void onSave() {
        updatedAt = new Date();
    }
}
