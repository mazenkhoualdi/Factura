package com.factura.service;

import com.factura.model.BL;
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
public class BlService {
    private final BlRepository blRepository;
    private final String uploadDir = "uploads/bl/";

    public List<BL> getAllBl() {
        return blRepository.findAll();
    }

    public Optional<BL> getBlById(UUID id) {
        return blRepository.findById(id);
    }

    public BL createBl(BL bl) {
        // Vérifier que le BDC lié a le statut "validated"
        if (bl.getBdc() != null && !"validated".equals(bl.getBdc().getStatus().toString())) {
            throw new RuntimeException("Le BDC doit avoir le statut 'Validé' pour créer un BL");
        }
        return blRepository.save(bl);
    }

    public BL updateBl(UUID id, BL blDetails) {
        return blRepository.findById(id)
                .map(bl -> {
                    bl.setNumber(blDetails.getNumber());
                    bl.setBdc(blDetails.getBdc());
                    bl.setDate(blDetails.getDate());
                    bl.setDescription(blDetails.getDescription());
                    bl.setAmount(blDetails.getAmount());
                    bl.setStatus(blDetails.getStatus());
                    bl.setComments(blDetails.getComments());
                    return blRepository.save(bl);
                })
                .orElseThrow(() -> new RuntimeException("BL not found"));
    }

    public void deleteBl(UUID id) {
        blRepository.deleteById(id);
    }

    public String uploadPdf(UUID id, MultipartFile file) throws IOException {
        BL bl = blRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("BL not found"));

        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath);

        bl.setPdfUrl(filePath.toString());
        bl.setFileName(file.getOriginalFilename());
        blRepository.save(bl);

        return filePath.toString();
    }
}