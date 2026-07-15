package com.factura.service;

import com.factura.model.BDC;
import com.factura.model.BL;
import com.factura.repository.BdcRepository;
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
    private final BdcRepository bdcRepository;
    private final String uploadDir = "uploads/bl/";

    public List<BL> getAllBl() {
        return blRepository.findAll();
    }

    public Optional<BL> getBlById(UUID id) {
        return blRepository.findById(id);
    }

    public BL createBl(BL bl) {
        // Remplir automatiquement bdcNumber, clientName et clientType depuis le BDC lié
        if (bl.getBdc() != null && bl.getBdc().getId() != null) {
            BDC bdc = bdcRepository.findById(bl.getBdc().getId())
                    .orElseThrow(() -> new RuntimeException("BDC not found"));
            bl.setBdcNumber(bdc.getNumber());
            bl.setClientName(bdc.getClientName());
            bl.setClientType(bdc.getClientType());
            if (bl.getAmount() == null || bl.getAmount() == 0) {
                bl.setAmount(bdc.getAmount());
            }
        }
        return blRepository.save(bl);
    }

    public BL updateBl(UUID id, BL blDetails) {
        return blRepository.findById(id)
                .map(bl -> {
                    bl.setNumber(blDetails.getNumber());
                    bl.setBdc(blDetails.getBdc());
                    if (blDetails.getBdc() != null && blDetails.getBdc().getId() != null) {
                        BDC bdc = bdcRepository.findById(blDetails.getBdc().getId())
                                .orElseThrow(() -> new RuntimeException("BDC not found"));
                        bl.setBdcNumber(bdc.getNumber());
                        bl.setClientName(bdc.getClientName());
                        bl.setClientType(bdc.getClientType());
                    }
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

        String originalFileName = file.getOriginalFilename();
        String cleanFileName = System.currentTimeMillis() + "_" + originalFileName.replaceAll("[^a-zA-Z0-9.\\-]", "_");
        Path filePath = uploadPath.resolve(cleanFileName);
        Files.copy(file.getInputStream(), filePath);

        String relativePath = uploadDir + cleanFileName;
        bl.setPdfUrl(relativePath);
        bl.setFileName(originalFileName);
        blRepository.save(bl);

        return filePath.toString();
    }
}