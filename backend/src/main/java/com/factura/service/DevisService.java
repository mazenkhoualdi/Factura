package com.factura.service;

import com.factura.model.Devis;
import com.factura.repository.DevisRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DevisService {
    private final DevisRepository devisRepository;
    private final String uploadDir = "uploads/devis/";

    public List<Devis> getAllDevis() {
        return devisRepository.findAll();
    }

    public Optional<Devis> getDevisById(UUID id) {
        return devisRepository.findById(id);
    }

    public Devis createDevis(Devis devis) {
        return devisRepository.save(devis);
    }

    public Devis updateDevis(UUID id, Devis devisDetails) {
        return devisRepository.findById(id)
                .map(devis -> {
                    devis.setNumber(devisDetails.getNumber());
                    // Récupérer le client depuis les détails
                    if (devisDetails.getClient() != null) {
                        devis.setClient(devisDetails.getClient());
                    }
                    devis.setDate(devisDetails.getDate());
                    devis.setExpirationDate(devisDetails.getExpirationDate());
                    devis.setDescription(devisDetails.getDescription());
                    devis.setAmount(devisDetails.getAmount());
                    devis.setStatus(devisDetails.getStatus());
                    devis.setComments(devisDetails.getComments());
                    return devisRepository.save(devis);
                })
                .orElseThrow(() -> new RuntimeException("Devis not found"));
    }

    public void deleteDevis(UUID id) {
        devisRepository.deleteById(id);
    }

    public String uploadPdf(UUID id, MultipartFile file) throws IOException {
        Devis devis = devisRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Devis not found"));

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

        return filePath.toString();
    }

    // Nouvelle méthode pour récupérer les devis par client
    public List<Devis> getDevisByClientId(UUID clientId) {
        return devisRepository.findByClientId(clientId);
    }
}