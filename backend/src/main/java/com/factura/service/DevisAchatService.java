package com.factura.service;

import com.factura.model.DevisAchat;
import com.factura.repository.DevisAchatRepository;
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
public class DevisAchatService {
    private final DevisAchatRepository devisAchatRepository;
    private final String uploadDir = "uploads/devis-achats/";

    public List<DevisAchat> getAllDevisAchats() {
        return devisAchatRepository.findAll();
    }

    public Optional<DevisAchat> getDevisAchatById(UUID id) {
        return devisAchatRepository.findById(id);
    }

    public DevisAchat createDevisAchat(DevisAchat devisAchat) {
        return devisAchatRepository.save(devisAchat);
    }

    public DevisAchat updateDevisAchat(UUID id, DevisAchat details) {
        return devisAchatRepository.findById(id)
                .map(devisAchat -> {
                    devisAchat.setNumber(details.getNumber());
                    devisAchat.setSupplierName(details.getSupplierName());
                    devisAchat.setDate(details.getDate());
                    devisAchat.setExpirationDate(details.getExpirationDate());
                    devisAchat.setDescription(details.getDescription());
                    devisAchat.setAmount(details.getAmount());
                    devisAchat.setStatus(details.getStatus());
                    devisAchat.setComments(details.getComments());
                    return devisAchatRepository.save(devisAchat);
                })
                .orElseThrow(() -> new RuntimeException("Devis d'achat non trouvé"));
    }

    public void deleteDevisAchat(UUID id) {
        devisAchatRepository.deleteById(id);
    }

    public String uploadPdf(UUID id, MultipartFile file) throws IOException {
        DevisAchat devisAchat = devisAchatRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Devis d'achat non trouvé"));

        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String originalFileName = file.getOriginalFilename();
        String cleanFileName = System.currentTimeMillis() + "_" + originalFileName.replaceAll("[^a-zA-Z0-9.\\-]", "_");
        Path filePath = uploadPath.resolve(cleanFileName);
        Files.copy(file.getInputStream(), filePath);

        String relativePath = uploadDir + cleanFileName;
        devisAchat.setPdfUrl(relativePath);
        devisAchat.setFileName(originalFileName);
        devisAchatRepository.save(devisAchat);

        return filePath.toString();
    }
}
