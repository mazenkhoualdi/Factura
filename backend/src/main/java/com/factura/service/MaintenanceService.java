package com.factura.service;

import com.factura.model.*;
import com.factura.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Service de maintenance ponctuelle : recalcule les champs dénormalisés
 * clientName / clientType (et supplierName côté achats) pour tous les
 * enregistrements existants, en les propageant depuis le Devis (ou
 * DevisAchat) d'origine à travers toute la chaîne BDC -> BL -> Attachement -> Facture.
 *
 * Utile car ces champs sont désormais renseignés automatiquement pour les
 * NOUVEAUX enregistrements, mais les enregistrements créés avant cette mise
 * à jour ne les avaient jamais reçus.
 *
 * On recolle la chaîne via les champs texte "*Number" (devisNumber, bdcNumber,
 * blNumber, attachmentNumber, devisAchatNumber) plutôt que via les relations
 * JPA, car ces dernières ne sont pas toujours renseignées par le frontend.
 */
@Service
@RequiredArgsConstructor
public class MaintenanceService {

    private final DevisRepository devisRepository;
    private final BdcRepository bdcRepository;
    private final BlRepository blRepository;
    private final AttachementRepository attachementRepository;
    private final FactureRepository factureRepository;
    private final DevisAchatRepository devisAchatRepository;
    private final FactureAchatRepository factureAchatRepository;

    public Map<String, Integer> resyncClientInfo() {
        Map<String, Integer> report = new LinkedHashMap<>();

        // 1) Devis -> BDC
        Map<String, Devis> devisByNumber = new HashMap<>();
        devisRepository.findAll().forEach(dv -> {
            if (dv.getNumber() != null) devisByNumber.put(dv.getNumber(), dv);
        });

        int bdcUpdated = 0;
        for (BDC bdc : bdcRepository.findAll()) {
            Devis devis = null;
            if (bdc.getDevis() != null) {
                devis = devisRepository.findById(bdc.getDevis().getId()).orElse(null);
            }
            if (devis == null && bdc.getDevisNumber() != null) {
                devis = devisByNumber.get(bdc.getDevisNumber());
            }
            if (devis != null) {
                boolean changed = !safeEquals(bdc.getClientName(), devis.getClientName())
                        || !safeEquals(bdc.getClientType(), devis.getClientType());
                bdc.setClientName(devis.getClientName());
                bdc.setClientType(devis.getClientType());
                if (bdc.getDevisNumber() == null) bdc.setDevisNumber(devis.getNumber());
                if (changed) bdcUpdated++;
                bdcRepository.save(bdc);
            }
        }
        report.put("bdcUpdated", bdcUpdated);

        // 2) BDC -> BL
        Map<String, BDC> bdcByNumber = new HashMap<>();
        bdcRepository.findAll().forEach(b -> {
            if (b.getNumber() != null) bdcByNumber.put(b.getNumber(), b);
        });

        int blUpdated = 0;
        for (BL bl : blRepository.findAll()) {
            BDC bdc = null;
            if (bl.getBdc() != null) {
                bdc = bdcRepository.findById(bl.getBdc().getId()).orElse(null);
            }
            if (bdc == null && bl.getBdcNumber() != null) {
                bdc = bdcByNumber.get(bl.getBdcNumber());
            }
            if (bdc != null) {
                boolean changed = !safeEquals(bl.getClientName(), bdc.getClientName())
                        || !safeEquals(bl.getClientType(), bdc.getClientType());
                bl.setClientName(bdc.getClientName());
                bl.setClientType(bdc.getClientType());
                if (bl.getBdcNumber() == null) bl.setBdcNumber(bdc.getNumber());
                if (changed) blUpdated++;
                blRepository.save(bl);
            }
        }
        report.put("blUpdated", blUpdated);

        // 3) BL -> Attachement
        Map<String, BL> blByNumber = new HashMap<>();
        blRepository.findAll().forEach(b -> {
            if (b.getNumber() != null) blByNumber.put(b.getNumber(), b);
        });

        int attUpdated = 0;
        for (Attachement att : attachementRepository.findAll()) {
            BL bl = null;
            if (att.getBl() != null) {
                bl = blRepository.findById(att.getBl().getId()).orElse(null);
            }
            if (bl == null && att.getBlNumber() != null) {
                bl = blByNumber.get(att.getBlNumber());
            }
            if (bl != null) {
                boolean changed = !safeEquals(att.getClientName(), bl.getClientName())
                        || !safeEquals(att.getClientType(), bl.getClientType());
                att.setClientName(bl.getClientName());
                att.setClientType(bl.getClientType());
                if (att.getBlNumber() == null) att.setBlNumber(bl.getNumber());
                if (changed) attUpdated++;
                attachementRepository.save(att);
            }
        }
        report.put("attachementUpdated", attUpdated);

        // 4) Attachement -> Facture
        Map<String, Attachement> attByNumber = new HashMap<>();
        attachementRepository.findAll().forEach(a -> {
            if (a.getNumber() != null) attByNumber.put(a.getNumber(), a);
        });

        int factureUpdated = 0;
        for (Facture facture : factureRepository.findAll()) {
            Attachement att = null;
            if (facture.getAttachement() != null) {
                att = attachementRepository.findById(facture.getAttachement().getId()).orElse(null);
            }
            if (att == null && facture.getAttachmentNumber() != null) {
                att = attByNumber.get(facture.getAttachmentNumber());
            }
            if (att != null) {
                boolean changed = !safeEquals(facture.getClientName(), att.getClientName())
                        || !safeEquals(facture.getClientType(), att.getClientType());
                facture.setClientName(att.getClientName());
                facture.setClientType(att.getClientType());
                if (facture.getAttachmentNumber() == null) facture.setAttachmentNumber(att.getNumber());
                if (changed) factureUpdated++;
                factureRepository.save(facture);
            }
        }
        report.put("factureUpdated", factureUpdated);

        // 5) DevisAchat -> FactureAchat (fournisseur)
        Map<String, DevisAchat> devisAchatByNumber = new HashMap<>();
        devisAchatRepository.findAll().forEach(da -> {
            if (da.getNumber() != null) devisAchatByNumber.put(da.getNumber(), da);
        });

        int factureAchatUpdated = 0;
        for (FactureAchat fa : factureAchatRepository.findAll()) {
            DevisAchat da = null;
            if (fa.getDevisAchat() != null) {
                da = devisAchatRepository.findById(fa.getDevisAchat().getId()).orElse(null);
            }
            if (da == null && fa.getDevisAchatNumber() != null) {
                da = devisAchatByNumber.get(fa.getDevisAchatNumber());
            }
            if (da != null) {
                boolean changed = !safeEquals(fa.getSupplierName(), da.getSupplierName());
                fa.setSupplierName(da.getSupplierName());
                if (fa.getDevisAchatNumber() == null) fa.setDevisAchatNumber(da.getNumber());
                if (changed) factureAchatUpdated++;
                factureAchatRepository.save(fa);
            }
        }
        report.put("factureAchatUpdated", factureAchatUpdated);

        return report;
    }

    private boolean safeEquals(String a, String b) {
        return a == null ? b == null : a.equals(b);
    }
}
