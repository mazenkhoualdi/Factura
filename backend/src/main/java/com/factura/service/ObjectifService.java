package com.factura.service;

import com.factura.model.Objectif;
import com.factura.repository.ObjectifRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * Gère les objectifs de gain sur les achats.
 * Un objectif distinct est stocké pour chaque mois (clé "GAIN_ACHATS_YYYY-MM"),
 * ce qui permet à l'utilisateur de définir un objectif différent chaque mois
 * plutôt qu'un objectif unique valable pour toute la période.
 */
@Service
@RequiredArgsConstructor
public class ObjectifService {

    private static final String PREFIX_GAIN_ACHATS = "GAIN_ACHATS_";

    private final ObjectifRepository objectifRepository;

    // Construit la clé de stockage pour un mois donné (format attendu : "YYYY-MM")
    private String buildCle(String month) {
        if (month == null || !month.matches("\\d{4}-\\d{2}")) {
            throw new IllegalArgumentException("Le mois doit être au format YYYY-MM");
        }
        return PREFIX_GAIN_ACHATS + month;
    }

    public Objectif getGainAchats(String month) {
        return objectifRepository.findById(buildCle(month)).orElse(null);
    }

    public Objectif setGainAchats(String month, Double montant) {
        String cle = buildCle(month);
        Objectif objectif = objectifRepository.findById(cle).orElseGet(Objectif::new);
        objectif.setCle(cle);
        objectif.setMontant(montant);
        return objectifRepository.save(objectif);
    }
}
