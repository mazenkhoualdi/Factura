package com.factura.service;

import com.factura.model.*;
import com.factura.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class TraceabilityService {
    private final DevisRepository devisRepository;
    private final BdcRepository bdcRepository;
    private final BlRepository blRepository;
    private final AttachementRepository attachementRepository;
    private final FactureRepository factureRepository;
    private final PaiementRepository paiementRepository;

    public Map<String, Object> search(String query) {
        Map<String, Object> result = new HashMap<>();

        // Rechercher un Devis
        Devis devis = devisRepository.findByNumber(query);
        if (devis != null) {
            result.put("type", "devis");
            result.put("document", devis);
            result.put("client", devis.getClient());

            BDC bdc = devis.getBdc();
            if (bdc != null) {
                result.put("bdc", bdc);
                BL bl = bdc.getBl();
                if (bl != null) {
                    result.put("bl", bl);
                    Attachement att = bl.getAttachement();
                    if (att != null) {
                        result.put("attachement", att);
                        Facture facture = att.getFacture();
                        if (facture != null) {
                            result.put("facture", facture);
                            result.put("paiements", facture.getPaiements());
                        }
                    }
                }
            }
            return result;
        }

        // Rechercher un BDC
        BDC bdc = bdcRepository.findByNumber(query);
        if (bdc != null) {
            result.put("type", "bdc");
            result.put("document", bdc);
            result.put("devis", bdc.getDevis());
            result.put("client", bdc.getDevis().getClient());
            BL bl = bdc.getBl();
            if (bl != null) {
                result.put("bl", bl);
                Attachement att = bl.getAttachement();
                if (att != null) {
                    result.put("attachement", att);
                    Facture facture = att.getFacture();
                    if (facture != null) {
                        result.put("facture", facture);
                        result.put("paiements", facture.getPaiements());
                    }
                }
            }
            return result;
        }

        // Rechercher un BL
        BL bl = blRepository.findByNumber(query);
        if (bl != null) {
            result.put("type", "bl");
            result.put("document", bl);
            result.put("bdc", bl.getBdc());
            result.put("devis", bl.getBdc().getDevis());
            result.put("client", bl.getBdc().getDevis().getClient());
            Attachement att = bl.getAttachement();
            if (att != null) {
                result.put("attachement", att);
                Facture facture = att.getFacture();
                if (facture != null) {
                    result.put("facture", facture);
                    result.put("paiements", facture.getPaiements());
                }
            }
            return result;
        }

        // Rechercher un Attachement
        Attachement att = attachementRepository.findByNumber(query);
        if (att != null) {
            result.put("type", "attachement");
            result.put("document", att);
            result.put("bl", att.getBl());
            result.put("bdc", att.getBl().getBdc());
            result.put("devis", att.getBl().getBdc().getDevis());
            result.put("client", att.getBl().getBdc().getDevis().getClient());
            Facture facture = att.getFacture();
            if (facture != null) {
                result.put("facture", facture);
                result.put("paiements", facture.getPaiements());
            }
            return result;
        }

        // Rechercher une Facture
        Facture facture = factureRepository.findByNumber(query);
        if (facture != null) {
            result.put("type", "facture");
            result.put("document", facture);
            result.put("attachement", facture.getAttachement());
            result.put("bl", facture.getAttachement().getBl());
            result.put("bdc", facture.getAttachement().getBl().getBdc());
            result.put("devis", facture.getAttachement().getBl().getBdc().getDevis());
            result.put("client", facture.getAttachement().getBl().getBdc().getDevis().getClient());
            result.put("paiements", facture.getPaiements());
            return result;
        }

        // Rechercher un Paiement
        Paiement paiement = paiementRepository.findByReference(query);
        if (paiement != null) {
            result.put("type", "paiement");
            result.put("document", paiement);
            result.put("facture", paiement.getFacture());
            result.put("attachement", paiement.getFacture().getAttachement());
            result.put("bl", paiement.getFacture().getAttachement().getBl());
            result.put("bdc", paiement.getFacture().getAttachement().getBl().getBdc());
            result.put("devis", paiement.getFacture().getAttachement().getBl().getBdc().getDevis());
            result.put("client", paiement.getFacture().getAttachement().getBl().getBdc().getDevis().getClient());
            return result;
        }

        return result;
    }
}