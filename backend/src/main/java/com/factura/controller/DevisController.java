package com.factura.controller;

import com.factura.model.Client;
import com.factura.model.Devis;
import com.factura.repository.ClientRepository;
import com.factura.repository.DevisRepository;
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
@RequestMapping("/api/devis")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class DevisController {
    private final DevisRepository devisRepository;
    private final ClientRepository clientRepository;

    @GetMapping
    public List<Devis> getAllDevis() {
        return devisRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Devis> getDevisById(@PathVariable UUID id) {
        return devisRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Devis> createDevis(@RequestBody Devis devis) {
        // Récupérer le client pour mettre à jour le clientName
        if (devis.getClientId() != null) {
            Client client = clientRepository.findById(devis.getClientId()).orElse(null);
            if (client != null) {
                devis.setClient(client);
                devis.setClientName(client.getFirstName() + " " + client.getLastName());
            }
        }
        Devis saved = devisRepository.save(devis);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Devis> updateDevis(@PathVariable UUID id, @RequestBody Devis devisDetails) {
        return devisRepository.findById(id)
                .map(devis -> {
                    devis.setNumber(devisDetails.getNumber());
                    
                    // Mettre à jour le client si présent
                    if (devisDetails.getClientId() != null) {
                        Client client = clientRepository.findById(devisDetails.getClientId()).orElse(null);
                        if (client != null) {
                            devis.setClient(client);
                            devis.setClientName(client.getFirstName() + " " + client.getLastName());
                        }
                    }
                    
                    devis.setDate(devisDetails.getDate());
                    devis.setExpirationDate(devisDetails.getExpirationDate());
                    devis.setDescription(devisDetails.getDescription());
                    devis.setAmount(devisDetails.getAmount());
                    devis.setStatus(devisDetails.getStatus());
                    devis.setComments(devisDetails.getComments());
                    return ResponseEntity.ok(devisRepository.save(devis));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDevis(@PathVariable UUID id) {
        devisRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // ============================================================
    // GESTION PDF
    // ============================================================
    @PostMapping("/{id}/pdf")
    public ResponseEntity<String> uploadPdf(@PathVariable UUID id, @RequestParam("file") MultipartFile file) {
        try {
            Devis devis = devisRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Devis not found"));

            String uploadDir = "uploads/devis/";
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String originalFileName = file.getOriginalFilename();
            String cleanFileName = System.currentTimeMillis() + "_" + originalFileName.replaceAll("[^a-zA-Z0-9.\\-]", "_");
            Path filePath = uploadPath.resolve(cleanFileName);
            Files.copy(file.getInputStream(), filePath);

            String relativePath = uploadDir + cleanFileName;
            devis.setPdfUrl(relativePath);
            devis.setFileName(originalFileName);
            devisRepository.save(devis);

            return ResponseEntity.ok(filePath.toString());
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Erreur lors de l'upload du PDF");
        }
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<Resource> downloadPdf(@PathVariable UUID id) {
        try {
            Devis devis = devisRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Devis non trouvé"));

            if (devis.getPdfUrl() == null || devis.getPdfUrl().isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Path filePath = Paths.get(devis.getPdfUrl());
            if (!Files.exists(filePath)) {
                String basePath = System.getProperty("user.dir");
                filePath = Paths.get(basePath, devis.getPdfUrl());
            }

            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists()) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + devis.getFileName() + "\"")
                    .body(resource);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{id}/pdf/view")
    public ResponseEntity<Resource> viewPdf(@PathVariable UUID id) {
        try {
            Devis devis = devisRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Devis non trouvé"));

            if (devis.getPdfUrl() == null || devis.getPdfUrl().isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Path filePath = Paths.get(devis.getPdfUrl());
            if (!Files.exists(filePath)) {
                String basePath = System.getProperty("user.dir");
                filePath = Paths.get(basePath, devis.getPdfUrl());
            }

            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists()) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "inline; filename=\"" + devis.getFileName() + "\"")
                    .body(resource);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}