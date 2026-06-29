package com.factura.service;

import com.factura.model.Paiement;
import com.factura.repository.PaiementRepository;
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
public class PaiementService {
    private final PaiementRepository paiementRepository;
    private final String uploadDir = "uploads/paiements/";

    public List<Paiement> getAllPaiements() {
        return paiementRepository.findAll();
    }

    public Optional<Paiement> getPaiementById(UUID id) {
        return paiementRepository.findById(id);
    }

    public Paiement createPaiement(Paiement paiement) {
        return paiementRepository.save(paiement);
    }

    public Paiement updatePaiement(UUID id, Paiement paiementDetails) {
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
                .orElseThrow(() -> new RuntimeException("Paiement not found"));
    }

    public void deletePaiement(UUID id) {
        paiementRepository.deleteById(id);
    }

    public String uploadPdf(UUID id, MultipartFile file) throws IOException {
        Paiement paiement = paiementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Paiement not found"));

        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath);

        paiement.setPdfUrl(filePath.toString());
        paiement.setFileName(file.getOriginalFilename());
        paiementRepository.save(paiement);

        return filePath.toString();
    }
}