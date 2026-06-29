package com.factura.controller;

import com.factura.model.Devis;
import com.factura.repository.DevisRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/devis")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class DevisController {
    private final DevisRepository devisRepository;

    @GetMapping
    public List<Devis> getAllDevis() {
        return devisRepository.findAll();
    }

    @GetMapping("/{id}")
    public Devis getDevisById(@PathVariable UUID id) {
        return devisRepository.findById(id).orElse(null);
    }

    @PostMapping
    public Devis createDevis(@RequestBody Devis devis) {
        return devisRepository.save(devis);
    }

    @PutMapping("/{id}")
    public Devis updateDevis(@PathVariable UUID id, @RequestBody Devis devisDetails) {
        return devisRepository.findById(id)
                .map(devis -> {
                    devis.setNumber(devisDetails.getNumber());
                    devis.setClient(devisDetails.getClient());
                    devis.setDate(devisDetails.getDate());
                    devis.setExpirationDate(devisDetails.getExpirationDate());
                    devis.setDescription(devisDetails.getDescription());
                    devis.setAmount(devisDetails.getAmount());
                    devis.setStatus(devisDetails.getStatus());
                    devis.setComments(devisDetails.getComments());
                    return devisRepository.save(devis);
                })
                .orElse(null);
    }

    @DeleteMapping("/{id}")
    public void deleteDevis(@PathVariable UUID id) {
        devisRepository.deleteById(id);
    }
}