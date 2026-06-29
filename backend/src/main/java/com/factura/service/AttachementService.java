package com.factura.service;

import com.factura.model.Attachement;
import com.factura.repository.AttachementRepository;
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
        return attachementRepository.save(attachement);
    }

    public Attachement updateAttachement(UUID id, Attachement attachementDetails) {
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