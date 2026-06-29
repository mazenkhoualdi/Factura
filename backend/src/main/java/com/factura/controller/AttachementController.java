package com.factura.controller;

import com.factura.model.Attachement;
import com.factura.repository.AttachementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/attachements")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class AttachementController {
    private final AttachementRepository attachementRepository;

    @GetMapping
    public List<Attachement> getAllAttachements() {
        return attachementRepository.findAll();
    }

    @GetMapping("/{id}")
    public Attachement getAttachementById(@PathVariable UUID id) {
        return attachementRepository.findById(id).orElse(null);
    }

    @PostMapping
    public Attachement createAttachement(@RequestBody Attachement attachement) {
        return attachementRepository.save(attachement);
    }

    @PutMapping("/{id}")
    public Attachement updateAttachement(@PathVariable UUID id, @RequestBody Attachement attachementDetails) {
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
                .orElse(null);
    }

    @DeleteMapping("/{id}")
    public void deleteAttachement(@PathVariable UUID id) {
        attachementRepository.deleteById(id);
    }
}