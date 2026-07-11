package com.factura.controller;

import com.factura.model.Paiement;
import com.factura.repository.PaiementRepository;
import com.factura.service.PaiementService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/paiements")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class PaiementController {
    private final PaiementRepository paiementRepository;
    private final PaiementService paiementService;

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

    @PostMapping("/{id}/pdf")
    public ResponseEntity<String> uploadPdf(@PathVariable UUID id, @RequestParam("file") MultipartFile file) {
        try {
            String path = paiementService.uploadPdf(id, file);
            return ResponseEntity.ok(path);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Erreur lors de l'upload du PDF");
        }
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<Resource> downloadPdf(@PathVariable UUID id) {
        try {
            Paiement paiement = paiementRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Paiement non trouvé"));

            if (paiement.getPdfUrl() == null || paiement.getPdfUrl().isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Path filePath = Paths.get(paiement.getPdfUrl());
            if (!Files.exists(filePath)) {
                String basePath = System.getProperty("user.dir");
                filePath = Paths.get(basePath, paiement.getPdfUrl());
            }

            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists()) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + paiement.getFileName() + "\"")
                    .body(resource);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{id}/pdf/view")
    public ResponseEntity<Resource> viewPdf(@PathVariable UUID id) {
        try {
            Paiement paiement = paiementRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Paiement non trouvé"));

            if (paiement.getPdfUrl() == null || paiement.getPdfUrl().isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Path filePath = Paths.get(paiement.getPdfUrl());
            if (!Files.exists(filePath)) {
                String basePath = System.getProperty("user.dir");
                filePath = Paths.get(basePath, paiement.getPdfUrl());
            }

            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists()) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "inline; filename=\"" + paiement.getFileName() + "\"")
                    .body(resource);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
