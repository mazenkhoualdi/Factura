package com.factura.controller;

import com.factura.model.BL;
import com.factura.repository.BlRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/bl")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class BlController {
    private final BlRepository blRepository;

    @GetMapping
    public List<BL> getAllBl() {
        return blRepository.findAll();
    }

    @GetMapping("/{id}")
    public BL getBlById(@PathVariable UUID id) {
        return blRepository.findById(id).orElse(null);
    }

    @PostMapping
    public BL createBl(@RequestBody BL bl) {
        return blRepository.save(bl);
    }

    @PutMapping("/{id}")
    public BL updateBl(@PathVariable UUID id, @RequestBody BL blDetails) {
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
                .orElse(null);
    }

    @DeleteMapping("/{id}")
    public void deleteBl(@PathVariable UUID id) {
        blRepository.deleteById(id);
    }
}