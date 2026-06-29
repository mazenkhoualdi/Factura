package com.factura.controller;

import com.factura.model.Paiement;
import com.factura.repository.PaiementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/paiements")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class PaiementController {
    private final PaiementRepository paiementRepository;

    @GetMapping
    public List<Paiement> getAllPaiements() {
        return paiementRepository.findAll();
    }

    @GetMapping("/{id}")
    public Paiement getPaiementById(@PathVariable UUID id) {
        return paiementRepository.findById(id).orElse(null);
    }

    @PostMapping
    public Paiement createPaiement(@RequestBody Paiement paiement) {
        return paiementRepository.save(paiement);
    }

    @PutMapping("/{id}")
    public Paiement updatePaiement(@PathVariable UUID id, @RequestBody Paiement paiementDetails) {
        return paiementRepository.findById(id)
                .map(paiement -> {
                    paiement.setReference(paiementDetails.getReference());
                    paiement.setFacture(paiementDetails.getFacture());
                    paiement.setDate(paiementDetails.getDate());
                    paiement.setAmount(paiementDetails.getAmount());
                    paiement.setMode(paiementDetails.getMode());
                    paiement.setBankReference(paiementDetails.getBankReference());
                    paiement.setComments(paiementDetails.getComments());
                    return paiementRepository.save(paiement);
                })
                .orElse(null);
    }

    @DeleteMapping("/{id}")
    public void deletePaiement(@PathVariable UUID id) {
        paiementRepository.deleteById(id);
    }
}