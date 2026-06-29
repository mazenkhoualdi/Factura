package com.factura.controller;

import com.factura.model.BDC;
import com.factura.repository.BdcRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/bdc")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class BdcController {
    private final BdcRepository bdcRepository;

    @GetMapping
    public List<BDC> getAllBdc() {
        return bdcRepository.findAll();
    }

    @GetMapping("/{id}")
    public BDC getBdcById(@PathVariable UUID id) {
        return bdcRepository.findById(id).orElse(null);
    }

    @PostMapping
    public BDC createBdc(@RequestBody BDC bdc) {
        return bdcRepository.save(bdc);
    }

    @PutMapping("/{id}")
    public BDC updateBdc(@PathVariable UUID id, @RequestBody BDC bdcDetails) {
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
                .orElse(null);
    }

    @DeleteMapping("/{id}")
    public void deleteBdc(@PathVariable UUID id) {
        bdcRepository.deleteById(id);
    }
}