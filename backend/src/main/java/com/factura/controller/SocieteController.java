package com.factura.controller;

import com.factura.model.Societe;
import com.factura.repository.SocieteRepository;
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
@RequestMapping("/api/societes")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class SocieteController {
    private final SocieteRepository societeRepository;

    @GetMapping
    public List<Societe> getAllSocietes() {
        return societeRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Societe> getSocieteById(@PathVariable UUID id) {
        return societeRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Societe> createSociete(@RequestBody Societe societe) {
        Societe saved = societeRepository.save(societe);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Societe> updateSociete(@PathVariable UUID id, @RequestBody Societe societeDetails) {
        return societeRepository.findById(id)
                .map(societe -> {
                    societe.setName(societeDetails.getName());
                    societe.setContactName(societeDetails.getContactName());
                    societe.setEmail(societeDetails.getEmail());
                    societe.setPhone(societeDetails.getPhone());
                    societe.setAddress(societeDetails.getAddress());
                    societe.setFiscalId(societeDetails.getFiscalId());
                    societe.setRegistryNumber(societeDetails.getRegistryNumber());
                    societe.setNotes(societeDetails.getNotes());
                    return ResponseEntity.ok(societeRepository.save(societe));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSociete(@PathVariable UUID id) {
        societeRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // ============================================================
    // GESTION PDF
    // ============================================================
    @PostMapping("/{id}/pdf")
    public ResponseEntity<String> uploadPdf(@PathVariable UUID id, @RequestParam("file") MultipartFile file) {
        try {
            Societe societe = societeRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Societe not found"));

            String uploadDir = "uploads/societes/";
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String originalFileName = file.getOriginalFilename();
            String cleanFileName = System.currentTimeMillis() + "_" + originalFileName.replaceAll("[^a-zA-Z0-9.\\-]", "_");
            Path filePath = uploadPath.resolve(cleanFileName);
            Files.copy(file.getInputStream(), filePath);

            String relativePath = uploadDir + cleanFileName;
            societe.setPdfUrl(relativePath);
            societe.setFileName(originalFileName);
            societeRepository.save(societe);

            return ResponseEntity.ok(filePath.toString());
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Erreur lors de l'upload du PDF");
        }
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<Resource> downloadPdf(@PathVariable UUID id) {
        try {
            Societe societe = societeRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Societe non trouvée"));

            if (societe.getPdfUrl() == null || societe.getPdfUrl().isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Path filePath = Paths.get(societe.getPdfUrl());
            if (!Files.exists(filePath)) {
                String basePath = System.getProperty("user.dir");
                filePath = Paths.get(basePath, societe.getPdfUrl());
            }

            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists()) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + societe.getFileName() + "\"")
                    .body(resource);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{id}/pdf/view")
    public ResponseEntity<Resource> viewPdf(@PathVariable UUID id) {
        try {
            Societe societe = societeRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Societe non trouvée"));

            if (societe.getPdfUrl() == null || societe.getPdfUrl().isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Path filePath = Paths.get(societe.getPdfUrl());
            if (!Files.exists(filePath)) {
                String basePath = System.getProperty("user.dir");
                filePath = Paths.get(basePath, societe.getPdfUrl());
            }

            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists()) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "inline; filename=\"" + societe.getFileName() + "\"")
                    .body(resource);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}