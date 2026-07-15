package com.factura.controller;

import com.factura.model.FactureAchat;
import com.factura.service.FactureAchatService;
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
@RequestMapping("/api/factures-achats")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class FactureAchatController {
    private final FactureAchatService factureAchatService;

    @GetMapping
    public List<FactureAchat> getAllFacturesAchats() {
        return factureAchatService.getAllFacturesAchats();
    }

    @GetMapping("/{id}")
    public ResponseEntity<FactureAchat> getFactureAchatById(@PathVariable UUID id) {
        return factureAchatService.getFactureAchatById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public FactureAchat createFactureAchat(@RequestBody FactureAchat factureAchat) {
        return factureAchatService.createFactureAchat(factureAchat);
    }

    @PutMapping("/{id}")
    public ResponseEntity<FactureAchat> updateFactureAchat(@PathVariable UUID id, @RequestBody FactureAchat details) {
        try {
            FactureAchat updated = factureAchatService.updateFactureAchat(id, details);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFactureAchat(@PathVariable UUID id) {
        factureAchatService.deleteFactureAchat(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/pdf")
    public ResponseEntity<String> uploadPdf(@PathVariable UUID id, @RequestParam("file") MultipartFile file) {
        try {
            String path = factureAchatService.uploadPdf(id, file);
            return ResponseEntity.ok(path);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Erreur lors de l'upload du PDF");
        }
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<Resource> downloadPdf(@PathVariable UUID id) {
        try {
            FactureAchat factureAchat = factureAchatService.getFactureAchatById(id)
                    .orElseThrow(() -> new RuntimeException("Facture d'achat non trouvée"));

            if (factureAchat.getPdfUrl() == null || factureAchat.getPdfUrl().isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Path filePath = Paths.get(factureAchat.getPdfUrl());
            if (!Files.exists(filePath)) {
                String basePath = System.getProperty("user.dir");
                filePath = Paths.get(basePath, factureAchat.getPdfUrl());
            }

            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists()) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + factureAchat.getFileName() + "\"")
                    .body(resource);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{id}/pdf/view")
    public ResponseEntity<Resource> viewPdf(@PathVariable UUID id) {
        try {
            FactureAchat factureAchat = factureAchatService.getFactureAchatById(id)
                    .orElseThrow(() -> new RuntimeException("Facture d'achat non trouvée"));

            if (factureAchat.getPdfUrl() == null || factureAchat.getPdfUrl().isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Path filePath = Paths.get(factureAchat.getPdfUrl());
            if (!Files.exists(filePath)) {
                String basePath = System.getProperty("user.dir");
                filePath = Paths.get(basePath, factureAchat.getPdfUrl());
            }

            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists()) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "inline; filename=\"" + factureAchat.getFileName() + "\"")
                    .body(resource);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
