package com.factura.controller;

import com.factura.model.Facture;
import com.factura.repository.FactureRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/factures")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class FactureController {
    private final FactureRepository factureRepository;

    @GetMapping
    public List<Facture> getAllFactures() {
        return factureRepository.findAll();
    }

    @GetMapping("/{id}")
    public Facture getFactureById(@PathVariable UUID id) {
        return factureRepository.findById(id).orElse(null);
    }

    @PostMapping
    public Facture createFacture(@RequestBody Facture facture) {
        return factureRepository.save(facture);
    }

    @PutMapping("/{id}")
    public Facture updateFacture(@PathVariable UUID id, @RequestBody Facture factureDetails) {
        return factureRepository.findById(id)
                .map(facture -> {
                    facture.setNumber(factureDetails.getNumber());
                    facture.setAttachement(factureDetails.getAttachement());
                    facture.setDate(factureDetails.getDate());
                    facture.setDescription(factureDetails.getDescription());
                    facture.setAmount(factureDetails.getAmount());
                    facture.setStatus(factureDetails.getStatus());
                    facture.setComments(factureDetails.getComments());
                    return factureRepository.save(facture);
                })
                .orElse(null);
    }

    @DeleteMapping("/{id}")
    public void deleteFacture(@PathVariable UUID id) {
        factureRepository.deleteById(id);
    }
}