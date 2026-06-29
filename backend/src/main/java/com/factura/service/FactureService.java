package com.factura.service;

import com.factura.model.Facture;
import com.factura.repository.FactureRepository;
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
public class FactureService {
    private final FactureRepository factureRepository;
    private final String uploadDir = "uploads/factures/";

    public List<Facture> getAllFactures() {
        return factureRepository.findAll();
    }

    public Optional<Facture> getFactureById(UUID id) {
        return factureRepository.findById(id);
    }

    public Facture createFacture(Facture facture) {
        // Vérifier que l'attachement lié a le statut "validated"
        if (facture.getAttachement() != null && !"validated".equals(facture.getAttachement().getStatus().toString())) {
            throw new RuntimeException("L'attachement doit avoir le statut 'Validé' pour créer une facture");
        }
        return factureRepository.save(facture);
    }

    public Facture updateFacture(UUID id, Facture factureDetails) {
        return factureRepository.findById(id)
                .map(facture -> {
                    facture.setNumber(factureDetails.getNumber());
                    facture.setAttachement(factureDetails.getAttachement());
                    facture.setDate(factureDetails.getDate());
                    facture.setDescription(factureDetails.getDescription());
                    facture.setAmount(factureDetails.getAmount());
                    facture.setStatus(factureDetails.getStatus());
                    facture.setComments(factureDetails.getComments());
                    return factureRepository.save(facture);
                })
                .orElseThrow(() -> new RuntimeException("Facture not found"));
    }

    public void deleteFacture(UUID id) {
        factureRepository.deleteById(id);
    }

    public String uploadPdf(UUID id, MultipartFile file) throws IOException {
        Facture facture = factureRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Facture not found"));

        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath);

        facture.setPdfUrl(filePath.toString());
        facture.setFileName(file.getOriginalFilename());
        factureRepository.save(facture);

        return filePath.toString();
    }
}