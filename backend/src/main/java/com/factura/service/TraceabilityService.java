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
 *
 * Quel que soit le type de document trouvé par la recherche, on résout le chemin dans les deux sens
 * (remontée vers le Devis ET descente vers les Paiements) à partir de CE document, en ajoutant chaque
 * maillon résolu au résultat au fur et à mesure. Un maillon manquant ou introuvable n'empêche plus
 * l'affichage des maillons déjà connus (notamment le document recherché lui-même), contrairement à
 * l'ancienne implémentation qui abandonnait tout l'affichage dès qu'un seul chaînon en amont manquait.
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
            buildChain(result, devis, null, null, null, null);
            return result;
        }

        BDC bdc = bdcRepository.findByNumber(q);
        if (bdc != null) {
            result.put("type", "bdc");
            result.put("document", bdc);
            Devis d = devisRepository.findByNumber(bdc.getDevisNumber());
            buildChain(result, d, bdc, null, null, null);
            return result;
        }

        BL bl = blRepository.findByNumber(q);
        if (bl != null) {
            result.put("type", "bl");
            result.put("document", bl);
            BDC b = bdcRepository.findByNumber(bl.getBdcNumber());
            Devis d = b != null ? devisRepository.findByNumber(b.getDevisNumber()) : null;
            buildChain(result, d, b, bl, null, null);
            return result;
        }

        Attachement attachement = attachementRepository.findByNumber(q);
        if (attachement != null) {
            result.put("type", "attachement");
            result.put("document", attachement);
            BL b = blRepository.findByNumber(attachement.getBlNumber());
            BDC bd = b != null ? bdcRepository.findByNumber(b.getBdcNumber()) : null;
            Devis d = bd != null ? devisRepository.findByNumber(bd.getDevisNumber()) : null;
            buildChain(result, d, bd, b, attachement, null);
            return result;
        }

        Facture facture = factureRepository.findByNumber(q);
        if (facture != null) {
            result.put("type", "facture");
            result.put("document", facture);
            Attachement a = attachementRepository.findByNumber(facture.getAttachmentNumber());
            BL b = a != null ? blRepository.findByNumber(a.getBlNumber()) : null;
            BDC bd = b != null ? bdcRepository.findByNumber(b.getBdcNumber()) : null;
            Devis d = bd != null ? devisRepository.findByNumber(bd.getDevisNumber()) : null;
            buildChain(result, d, bd, b, a, facture);
            return result;
        }

        Paiement paiement = paiementRepository.findByReference(q);
        if (paiement != null) {
            result.put("type", "paiement");
            result.put("document", paiement);
            Facture f = factureRepository.findByNumber(paiement.getFactureNumber());
            Attachement a = f != null ? attachementRepository.findByNumber(f.getAttachmentNumber()) : null;
            BL b = a != null ? blRepository.findByNumber(a.getBlNumber()) : null;
            BDC bd = b != null ? bdcRepository.findByNumber(b.getBdcNumber()) : null;
            Devis d = bd != null ? devisRepository.findByNumber(bd.getDevisNumber()) : null;
            buildChain(result, d, bd, b, a, f);
            // Le(s) paiement(s) doivent apparaître même si la facture elle-même est introuvable.
            if (f != null) {
                result.put("paiements", paiementRepository.findByFactureNumber(f.getNumber()));
            } else {
                result.put("paiements", List.of(paiement));
            }
            return result;
        }

        return result;
    }

    // ------------------------------------------------------------------
    // Construction du résultat à partir de tout ce qui a pu être résolu,
    // dans un sens (remontée) comme dans l'autre (descente), sans jamais
    // s'arrêter prématurément si un maillon intermédiaire est manquant.
    // ------------------------------------------------------------------
    private void buildChain(Map<String, Object> result, Devis devis, BDC bdc, BL bl,
                             Attachement attachement, Facture facture) {
        if (devis != null) {
            result.put("devis", devis);
            result.put("client", buildClientInfo(devis));
            if (bdc == null) {
                bdc = bdcRepository.findByDevisNumber(devis.getNumber());
            }
        }

        if (bdc != null) {
            result.put("bdc", bdc);
            if (bl == null) {
                bl = blRepository.findByBdcNumber(bdc.getNumber());
            }
        }

        if (bl != null) {
            result.put("bl", bl);
            if (attachement == null) {
                attachement = attachementRepository.findByBlNumber(bl.getNumber());
            }
        }

        if (attachement != null) {
            result.put("attachement", attachement);
            if (facture == null) {
                facture = factureRepository.findByAttachmentNumber(attachement.getNumber());
            }
        }

        if (facture != null) {
            result.put("facture", facture);
            List<Paiement> paiements = paiementRepository.findByFactureNumber(facture.getNumber());
            result.put("paiements", paiements);
        }
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
