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

    // Récupère l'objectif de gain total achats (204 si non défini)
    @GetMapping("/gain-achats")
    public ResponseEntity<Objectif> getGainAchats() {
        Objectif objectif = objectifService.getGainAchats();
        if (objectif == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(objectif);
    }

    // Définit / met à jour l'objectif de gain total achats
    @PutMapping("/gain-achats")
    public ResponseEntity<?> setGainAchats(@RequestBody Map<String, Object> body) {
        Object rawMontant = body.get("montant");
        Double montant = rawMontant != null ? Double.valueOf(rawMontant.toString()) : null;

        if (montant == null || montant <= 0) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Le montant doit être un nombre strictement positif"));
        }

        return ResponseEntity.ok(objectifService.setGainAchats(montant));
    }
}
