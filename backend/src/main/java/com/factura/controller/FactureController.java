package com.factura.controller;

import com.factura.model.Facture;
import com.factura.service.FactureService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/factures")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class FactureController {
    private final FactureService factureService;

    @GetMapping
    public List<Facture> getAllFactures() {
        return factureService.getAllFactures();
    }

    @GetMapping("/gain-total")
    public Map<String, Double> getGainTotal() {
        return Map.of("gainTotal", factureService.getGainTotal());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Facture> getFactureById(@PathVariable UUID id) {
        return factureService.getFactureById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Facture createFacture(@RequestBody Facture facture) {
        return factureService.createFacture(facture);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Facture> updateFacture(@PathVariable UUID id, @RequestBody Facture factureDetails) {
        try {
            Facture updated = factureService.updateFacture(id, factureDetails);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFacture(@PathVariable UUID id) {
        factureService.deleteFacture(id);
        return ResponseEntity.noContent().build();
    }
}
