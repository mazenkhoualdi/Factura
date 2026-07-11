package com.factura.controller;

import com.factura.model.Attachement;
import com.factura.repository.AttachementRepository;
import com.factura.service.AttachementService;
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
@RequestMapping("/api/attachements")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class AttachementController {
    private final AttachementRepository attachementRepository;
    private final AttachementService attachementService;

    @GetMapping
    public List<Attachement> getAllAttachements() {
        return attachementRepository.findAll();
    }

    @GetMapping("/{id}")
    public Attachement getAttachementById(@PathVariable UUID id) {
        return attachementRepository.findById(id).orElse(null);
    }

    @PostMapping
    public Attachement createAttachement(@RequestBody Attachement attachement) {
        return attachementRepository.save(attachement);
    }

    @PutMapping("/{id}")
    public Attachement updateAttachement(@PathVariable UUID id, @RequestBody Attachement attachementDetails) {
        return attachementRepository.findById(id)
                .map(att -> {
                    att.setNumber(attachementDetails.getNumber());
                    att.setBl(attachementDetails.getBl());
                    att.setDate(attachementDetails.getDate());
                    att.setDescription(attachementDetails.getDescription());
                    att.setAmount(attachementDetails.getAmount());
                    att.setStatus(attachementDetails.getStatus());
                    att.setAgreementDate(attachementDetails.getAgreementDate());
                    att.setComments(attachementDetails.getComments());
                    return attachementRepository.save(att);
                })
                .orElse(null);
    }

    @DeleteMapping("/{id}")
    public void deleteAttachement(@PathVariable UUID id) {
        attachementRepository.deleteById(id);
    }

    @PostMapping("/{id}/pdf")
    public ResponseEntity<String> uploadPdf(@PathVariable UUID id, @RequestParam("file") MultipartFile file) {
        try {
            String path = attachementService.uploadPdf(id, file);
            return ResponseEntity.ok(path);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Erreur lors de l'upload du PDF");
        }
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<Resource> downloadPdf(@PathVariable UUID id) {
        try {
            Attachement att = attachementRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Attachement non trouvé"));

            if (att.getPdfUrl() == null || att.getPdfUrl().isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Path filePath = Paths.get(att.getPdfUrl());
            if (!Files.exists(filePath)) {
                String basePath = System.getProperty("user.dir");
                filePath = Paths.get(basePath, att.getPdfUrl());
            }

            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists()) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + att.getFileName() + "\"")
                    .body(resource);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{id}/pdf/view")
    public ResponseEntity<Resource> viewPdf(@PathVariable UUID id) {
        try {
            Attachement att = attachementRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Attachement non trouvé"));

            if (att.getPdfUrl() == null || att.getPdfUrl().isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Path filePath = Paths.get(att.getPdfUrl());
            if (!Files.exists(filePath)) {
                String basePath = System.getProperty("user.dir");
                filePath = Paths.get(basePath, att.getPdfUrl());
            }

            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists()) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "inline; filename=\"" + att.getFileName() + "\"")
                    .body(resource);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
