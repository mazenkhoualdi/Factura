package com.factura.controller;

import com.factura.model.DevisAchat;
import com.factura.service.DevisAchatService;
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
@RequestMapping("/api/devis-achats")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class DevisAchatController {
    private final DevisAchatService devisAchatService;

    @GetMapping
    public List<DevisAchat> getAllDevisAchats() {
        return devisAchatService.getAllDevisAchats();
    }

    @GetMapping("/{id}")
    public ResponseEntity<DevisAchat> getDevisAchatById(@PathVariable UUID id) {
        return devisAchatService.getDevisAchatById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public DevisAchat createDevisAchat(@RequestBody DevisAchat devisAchat) {
        return devisAchatService.createDevisAchat(devisAchat);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DevisAchat> updateDevisAchat(@PathVariable UUID id, @RequestBody DevisAchat details) {
        try {
            DevisAchat updated = devisAchatService.updateDevisAchat(id, details);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDevisAchat(@PathVariable UUID id) {
        devisAchatService.deleteDevisAchat(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/pdf")
    public ResponseEntity<String> uploadPdf(@PathVariable UUID id, @RequestParam("file") MultipartFile file) {
        try {
            String path = devisAchatService.uploadPdf(id, file);
            return ResponseEntity.ok(path);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Erreur lors de l'upload du PDF");
        }
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<Resource> downloadPdf(@PathVariable UUID id) {
        try {
            DevisAchat devisAchat = devisAchatService.getDevisAchatById(id)
                    .orElseThrow(() -> new RuntimeException("Devis d'achat non trouvé"));

            if (devisAchat.getPdfUrl() == null || devisAchat.getPdfUrl().isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Path filePath = Paths.get(devisAchat.getPdfUrl());
            if (!Files.exists(filePath)) {
                String basePath = System.getProperty("user.dir");
                filePath = Paths.get(basePath, devisAchat.getPdfUrl());
            }

            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists()) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + devisAchat.getFileName() + "\"")
                    .body(resource);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{id}/pdf/view")
    public ResponseEntity<Resource> viewPdf(@PathVariable UUID id) {
        try {
            DevisAchat devisAchat = devisAchatService.getDevisAchatById(id)
                    .orElseThrow(() -> new RuntimeException("Devis d'achat non trouvé"));

            if (devisAchat.getPdfUrl() == null || devisAchat.getPdfUrl().isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Path filePath = Paths.get(devisAchat.getPdfUrl());
            if (!Files.exists(filePath)) {
                String basePath = System.getProperty("user.dir");
                filePath = Paths.get(basePath, devisAchat.getPdfUrl());
            }

            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists()) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "inline; filename=\"" + devisAchat.getFileName() + "\"")
                    .body(resource);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
