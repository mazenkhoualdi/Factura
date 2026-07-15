package com.factura.service;

import com.factura.model.DevisAchat;
import com.factura.model.FactureAchat;
import com.factura.repository.DevisAchatRepository;
import com.factura.repository.FactureAchatRepository;
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
public class FactureAchatService {
    private final FactureAchatRepository factureAchatRepository;
    private final DevisAchatRepository devisAchatRepository;
    private final String uploadDir = "uploads/factures-achats/";

    public List<FactureAchat> getAllFacturesAchats() {
        return factureAchatRepository.findAll();
    }

    public Optional<FactureAchat> getFactureAchatById(UUID id) {
        return factureAchatRepository.findById(id);
    }

    // Remplit automatiquement devisAchatNumber et supplierName depuis le devis d'achat lié
    private void applyDevisAchatInfo(FactureAchat factureAchat) {
        if (factureAchat.getDevisAchat() != null && factureAchat.getDevisAchat().getId() != null) {
            DevisAchat devisAchat = devisAchatRepository.findById(factureAchat.getDevisAchat().getId())
                    .orElseThrow(() -> new RuntimeException("Devis d'achat not found"));
            factureAchat.setDevisAchatNumber(devisAchat.getNumber());
            factureAchat.setSupplierName(devisAchat.getSupplierName());
        }
    }

    public FactureAchat createFactureAchat(FactureAchat factureAchat) {
        applyDevisAchatInfo(factureAchat);
        return factureAchatRepository.save(factureAchat);
    }

    public FactureAchat updateFactureAchat(UUID id, FactureAchat details) {
        return factureAchatRepository.findById(id)
                .map(factureAchat -> {
                    factureAchat.setNumber(details.getNumber());
                    factureAchat.setDevisAchat(details.getDevisAchat());
                    applyDevisAchatInfo(factureAchat);
                    factureAchat.setDate(details.getDate());
                    factureAchat.setDescription(details.getDescription());
                    factureAchat.setAmount(details.getAmount());
                    factureAchat.setStatus(details.getStatus());
                    factureAchat.setComments(details.getComments());
                    return factureAchatRepository.save(factureAchat);
                })
                .orElseThrow(() -> new RuntimeException("Facture d'achat non trouvée"));
    }

    public void deleteFactureAchat(UUID id) {
        factureAchatRepository.deleteById(id);
    }

    public String uploadPdf(UUID id, MultipartFile file) throws IOException {
        FactureAchat factureAchat = factureAchatRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Facture d'achat non trouvée"));

        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String originalFileName = file.getOriginalFilename();
        String cleanFileName = System.currentTimeMillis() + "_" + originalFileName.replaceAll("[^a-zA-Z0-9.\\-]", "_");
        Path filePath = uploadPath.resolve(cleanFileName);
        Files.copy(file.getInputStream(), filePath);

        String relativePath = uploadDir + cleanFileName;
        factureAchat.setPdfUrl(relativePath);
        factureAchat.setFileName(originalFileName);
        factureAchatRepository.save(factureAchat);

        return filePath.toString();
    }
}
