package com.factura.service;

import com.factura.model.BDC;
import com.factura.repository.BdcRepository;
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
public class BdcService {
    private final BdcRepository bdcRepository;
    private final String uploadDir = "uploads/bdc/";

    public List<BDC> getAllBdc() {
        return bdcRepository.findAll();
    }

    public Optional<BDC> getBdcById(UUID id) {
        return bdcRepository.findById(id);
    }

    public BDC createBdc(BDC bdc) {
        return bdcRepository.save(bdc);
    }

    public BDC updateBdc(UUID id, BDC bdcDetails) {
        return bdcRepository.findById(id)
                .map(bdc -> {
                    bdc.setNumber(bdcDetails.getNumber());
                    bdc.setDevis(bdcDetails.getDevis());
                    bdc.setDate(bdcDetails.getDate());
                    bdc.setDescription(bdcDetails.getDescription());
                    bdc.setAmount(bdcDetails.getAmount());
                    bdc.setStatus(bdcDetails.getStatus());
                    bdc.setComments(bdcDetails.getComments());
                    return bdcRepository.save(bdc);
                })
                .orElseThrow(() -> new RuntimeException("BDC not found"));
    }

    public void deleteBdc(UUID id) {
        bdcRepository.deleteById(id);
    }

    public String uploadPdf(UUID id, MultipartFile file) throws IOException {
        BDC bdc = bdcRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("BDC not found"));

        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String originalFileName = file.getOriginalFilename();
        String cleanFileName = System.currentTimeMillis() + "_" + originalFileName.replaceAll("[^a-zA-Z0-9.\\-]", "_");
        Path filePath = uploadPath.resolve(cleanFileName);
        Files.copy(file.getInputStream(), filePath);

        String relativePath = uploadDir + cleanFileName;
        bdc.setPdfUrl(relativePath);
        bdc.setFileName(originalFileName);
        bdcRepository.save(bdc);

        return filePath.toString();
    }
}