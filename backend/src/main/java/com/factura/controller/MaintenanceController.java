package com.factura.controller;

import com.factura.service.MaintenanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/maintenance")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    /**
     * Recalcule et propage clientName / clientType / supplierName sur tous les
     * enregistrements existants (BDC, BL, Attachement, Facture, FactureAchat)
     * à partir de leur Devis / DevisAchat d'origine.
     * A appeler une seule fois après la mise à jour, ou chaque fois qu'on veut
     * "rattraper" des anciens enregistrements.
     */
    @PostMapping("/resync-client-info")
    public Map<String, Integer> resyncClientInfo() {
        return maintenanceService.resyncClientInfo();
    }
}
