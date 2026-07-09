package com.factura.controller;

import com.factura.model.Objectif;
import com.factura.service.ObjectifService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/objectifs")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class ObjectifController {

    private final ObjectifService objectifService;

    // Récupère l'objectif de gain achats pour un mois donné (format "YYYY-MM").
    // Renvoie 204 si aucun objectif n'a encore été défini pour ce mois.
    @GetMapping("/gain-achats/{month}")
    public ResponseEntity<?> getGainAchats(@PathVariable String month) {
        try {
            Objectif objectif = objectifService.getGainAchats(month);
            if (objectif == null) {
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.ok(objectif);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Définit / met à jour l'objectif de gain achats pour un mois donné (format "YYYY-MM").
    @PutMapping("/gain-achats/{month}")
    public ResponseEntity<?> setGainAchats(@PathVariable String month, @RequestBody Map<String, Object> body) {
        Object rawMontant = body.get("montant");
        Double montant = rawMontant != null ? Double.valueOf(rawMontant.toString()) : null;

        if (montant == null || montant <= 0) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Le montant doit être un nombre strictement positif"));
        }

        try {
            return ResponseEntity.ok(objectifService.setGainAchats(month, montant));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
