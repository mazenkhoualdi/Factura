package com.factura.controller;

import com.factura.model.BL;
import com.factura.service.BlService;
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
@RequestMapping("/api/bl")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class BlController {
    private final BlService blService;

    @GetMapping
    public List<BL> getAllBl() {
        return blService.getAllBl();
    }

    @GetMapping("/{id}")
    public ResponseEntity<BL> getBlById(@PathVariable UUID id) {
        return blService.getBlById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public BL createBl(@RequestBody BL bl) {
        return blService.createBl(bl);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BL> updateBl(@PathVariable UUID id, @RequestBody BL blDetails) {
        try {
            BL updated = blService.updateBl(id, blDetails);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBl(@PathVariable UUID id) {
        blService.deleteBl(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/pdf")
    public ResponseEntity<String> uploadPdf(@PathVariable UUID id, @RequestParam("file") MultipartFile file) {
        try {
            String path = blService.uploadPdf(id, file);
            return ResponseEntity.ok(path);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Erreur lors de l'upload du PDF");
        }
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<Resource> downloadPdf(@PathVariable UUID id) {
        try {
            BL bl = blService.getBlById(id)
                    .orElseThrow(() -> new RuntimeException("BL non trouvé"));

            if (bl.getPdfUrl() == null || bl.getPdfUrl().isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Path filePath = Paths.get(bl.getPdfUrl());
            if (!Files.exists(filePath)) {
                String basePath = System.getProperty("user.dir");
                filePath = Paths.get(basePath, bl.getPdfUrl());
            }

            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists()) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + bl.getFileName() + "\"")
                    .body(resource);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{id}/pdf/view")
    public ResponseEntity<Resource> viewPdf(@PathVariable UUID id) {
        try {
            BL bl = blService.getBlById(id)
                    .orElseThrow(() -> new RuntimeException("BL non trouvé"));

            if (bl.getPdfUrl() == null || bl.getPdfUrl().isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Path filePath = Paths.get(bl.getPdfUrl());
            if (!Files.exists(filePath)) {
                String basePath = System.getProperty("user.dir");
                filePath = Paths.get(basePath, bl.getPdfUrl());
            }

            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists()) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "inline; filename=\"" + bl.getFileName() + "\"")
                    .body(resource);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}