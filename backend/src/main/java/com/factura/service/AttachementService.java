package com.factura.service;

import com.factura.model.Attachement;
import com.factura.model.BL;
import com.factura.repository.AttachementRepository;
import com.factura.repository.BlRepository;
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
public class AttachementService {
    private final AttachementRepository attachementRepository;
    private final BlRepository blRepository;
    private final String uploadDir = "uploads/attachements/";

    public List<Attachement> getAllAttachements() {
        return attachementRepository.findAll();
    }

    public Optional<Attachement> getAttachementById(UUID id) {
        return attachementRepository.findById(id);
    }

    public Attachement createAttachement(Attachement attachement) {
        // Vérifier que le BL lié a le statut "delivered"
        if (attachement.getBl() != null && !"delivered".equals(attachement.getBl().getStatus().toString())) {
            throw new RuntimeException("Le BL doit avoir le statut 'Livré' pour créer un attachement");
        }
        // Remplir automatiquement blNumber, clientName et clientType depuis le BL lié
        if (attachement.getBl() != null && attachement.getBl().getId() != null) {
            BL bl = blRepository.findById(attachement.getBl().getId())
                    .orElseThrow(() -> new RuntimeException("BL not found"));
            attachement.setBlNumber(bl.getNumber());
            attachement.setClientName(bl.getClientName());
            attachement.setClientType(bl.getClientType());
            if (attachement.getAmount() == null || attachement.getAmount() == 0) {
                attachement.setAmount(bl.getAmount());
            }
        }
        return attachementRepository.save(attachement);
    }

    public Attachement updateAttachement(UUID id, Attachement attachementDetails) {
        return attachementRepository.findById(id)
                .map(att -> {
                    att.setNumber(attachementDetails.getNumber());
                    att.setBl(attachementDetails.getBl());
                    if (attachementDetails.getBl() != null && attachementDetails.getBl().getId() != null) {
                        BL bl = blRepository.findById(attachementDetails.getBl().getId())
                                .orElseThrow(() -> new RuntimeException("BL not found"));
                        att.setBlNumber(bl.getNumber());
                        att.setClientName(bl.getClientName());
                        att.setClientType(bl.getClientType());
                    }
                    att.setDate(attachementDetails.getDate());
                    att.setDescription(attachementDetails.getDescription());
                    att.setAmount(attachementDetails.getAmount());
                    att.setStatus(attachementDetails.getStatus());
                    att.setAgreementDate(attachementDetails.getAgreementDate());
                    att.setComments(attachementDetails.getComments());
                    return attachementRepository.save(att);
                })
                .orElseThrow(() -> new RuntimeException("Attachement not found"));
    }

    public void deleteAttachement(UUID id) {
        attachementRepository.deleteById(id);
    }

    public String uploadPdf(UUID id, MultipartFile file) throws IOException {
        Attachement att = attachementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Attachement not found"));

        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath);

        att.setPdfUrl(filePath.toString());
        att.setFileName(file.getOriginalFilename());
        attachementRepository.save(att);

        return filePath.toString();
    }
}