package com.factura.service;

import com.factura.model.Objectif;
import com.factura.repository.ObjectifRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ObjectifService {

    public static final String CLE_GAIN_ACHATS = "GAIN_ACHATS";

    private final ObjectifRepository objectifRepository;

    public Objectif getGainAchats() {
        return objectifRepository.findById(CLE_GAIN_ACHATS).orElse(null);
    }

    public Objectif setGainAchats(Double montant) {
        Objectif objectif = objectifRepository.findById(CLE_GAIN_ACHATS)
                .orElseGet(Objectif::new);
        objectif.setCle(CLE_GAIN_ACHATS);
        objectif.setMontant(montant);
        return objectifRepository.save(objectif);
    }
}
