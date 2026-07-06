package com.factura.service;

import com.factura.model.*;
import com.factura.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Reconstitue le parcours complet d'un document (Devis -> BDC -> BL -> Attachement -> Facture -> Paiements).
 *
 * IMPORTANT: dans cette application, les documents ne sont PAS reliés entre eux par de vraies relations
 * JPA persistées (les champs @OneToOne comme BDC.devis, BL.bdc, etc. ne sont jamais renseignés à la
 * création). Le seul lien fiable entre deux documents est le numéro dénormalisé stocké sur l'enfant
 * (ex: BL.bdcNumber contient le "number" du BDC source). Toute la logique ci-dessous navigue donc
 * exclusivement par ces numéros, jamais par les relations Java, afin de refléter la réalité des données.
 */
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
        if (query == null || query.isBlank()) {
            return result;
        }
        String q = query.trim();

        Devis devis = devisRepository.findByNumber(q);
        if (devis != null) {
            result.put("type", "devis");
            result.put("document", devis);
            buildChainFromDevis(result, devis);
            return result;
        }

        BDC bdc = bdcRepository.findByNumber(q);
        if (bdc != null) {
            result.put("type", "bdc");
            result.put("document", bdc);
            buildChainFromDevis(result, devisRepository.findByNumber(bdc.getDevisNumber()));
            return result;
        }

        BL bl = blRepository.findByNumber(q);
        if (bl != null) {
            result.put("type", "bl");
            result.put("document", bl);
            buildChainFromDevis(result, resolveDevisFromBdcNumber(bl.getBdcNumber()));
            return result;
        }

        Attachement attachement = attachementRepository.findByNumber(q);
        if (attachement != null) {
            result.put("type", "attachement");
            result.put("document", attachement);
            buildChainFromDevis(result, resolveDevisFromBlNumber(attachement.getBlNumber()));
            return result;
        }

        Facture facture = factureRepository.findByNumber(q);
        if (facture != null) {
            result.put("type", "facture");
            result.put("document", facture);
            buildChainFromDevis(result, resolveDevisFromAttachmentNumber(facture.getAttachmentNumber()));
            return result;
        }

        Paiement paiement = paiementRepository.findByReference(q);
        if (paiement != null) {
            result.put("type", "paiement");
            result.put("document", paiement);
            buildChainFromDevis(result, resolveDevisFromFactureNumber(paiement.getFactureNumber()));
            return result;
        }

        return result;
    }

    // ------------------------------------------------------------------
    // Remontée de la chaîne (à partir d'un maillon intermédiaire vers le Devis)
    // ------------------------------------------------------------------

    private Devis resolveDevisFromBdcNumber(String bdcNumber) {
        if (bdcNumber == null) return null;
        BDC bdc = bdcRepository.findByNumber(bdcNumber);
        return bdc != null ? devisRepository.findByNumber(bdc.getDevisNumber()) : null;
    }

    private Devis resolveDevisFromBlNumber(String blNumber) {
        if (blNumber == null) return null;
        BL bl = blRepository.findByNumber(blNumber);
        return bl != null ? resolveDevisFromBdcNumber(bl.getBdcNumber()) : null;
    }

    private Devis resolveDevisFromAttachmentNumber(String attachmentNumber) {
        if (attachmentNumber == null) return null;
        Attachement attachement = attachementRepository.findByNumber(attachmentNumber);
        return attachement != null ? resolveDevisFromBlNumber(attachement.getBlNumber()) : null;
    }

    private Devis resolveDevisFromFactureNumber(String factureNumber) {
        if (factureNumber == null) return null;
        Facture facture = factureRepository.findByNumber(factureNumber);
        return facture != null ? resolveDevisFromAttachmentNumber(facture.getAttachmentNumber()) : null;
    }

    // ------------------------------------------------------------------
    // Descente de la chaîne (à partir du Devis vers les Paiements)
    // S'arrête dès qu'un maillon est manquant, sans jamais lever de NullPointerException.
    // ------------------------------------------------------------------

    private void buildChainFromDevis(Map<String, Object> result, Devis devis) {
        if (devis == null) {
            return;
        }
        result.put("devis", devis);
        result.put("client", buildClientInfo(devis));

        BDC bdc = bdcRepository.findByDevisNumber(devis.getNumber());
        if (bdc == null) {
            return;
        }
        result.put("bdc", bdc);

        BL bl = blRepository.findByBdcNumber(bdc.getNumber());
        if (bl == null) {
            return;
        }
        result.put("bl", bl);

        Attachement attachement = attachementRepository.findByBlNumber(bl.getNumber());
        if (attachement == null) {
            return;
        }
        result.put("attachement", attachement);

        Facture facture = factureRepository.findByAttachmentNumber(attachement.getNumber());
        if (facture == null) {
            return;
        }
        result.put("facture", facture);

        List<Paiement> paiements = paiementRepository.findByFactureNumber(facture.getNumber());
        result.put("paiements", paiements);
    }

    /**
     * Le Devis ne porte pas de vraie relation Client exploitable (client_id n'est jamais renseigné) :
     * seules les colonnes dénormalisées clientName/clientType le sont. On construit donc un petit
     * objet d'affichage à partir de ces colonnes plutôt que de renvoyer un Client (toujours null).
     */
    private Map<String, Object> buildClientInfo(Devis devis) {
        Map<String, Object> client = new HashMap<>();
        client.put("number", devis.getClientName());
        client.put("description", "society".equals(devis.getClientType()) ? "Société" : "Client");
        return client;
    }
}
