package com.factura.service;

import com.factura.model.*;
import com.factura.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class TimelineService {
    private final DevisRepository devisRepository;
    private final BdcRepository bdcRepository;
    private final BlRepository blRepository;
    private final AttachementRepository attachementRepository;
    private final FactureRepository factureRepository;
    private final PaiementRepository paiementRepository;
    private final ClientRepository clientRepository;

    public List<Map<String, Object>> getTimeline() {
        List<Map<String, Object>> timeline = new ArrayList<>();
        List<Client> clients = clientRepository.findAll();

        for (Client client : clients) {
            Map<String, Object> transaction = new LinkedHashMap<>();
            transaction.put("clientId", client.getId());
            transaction.put("clientName", client.getFirstName() + " " + client.getLastName());

            List<Devis> devisList = client.getDevis();
            if (devisList != null && !devisList.isEmpty()) {
                Devis devis = devisList.get(0);
                transaction.put("devis", devis);

                BDC bdc = bdcRepository.findByDevisId(devis.getId()).orElse(null);
                if (bdc != null) {
                    transaction.put("bdc", bdc);
                    BL bl = blRepository.findByBdcId(bdc.getId()).orElse(null);
                    if (bl != null) {
                        transaction.put("bl", bl);
                        Attachement att = attachementRepository.findByBlId(bl.getId()).orElse(null);
                        if (att != null) {
                            transaction.put("attachement", att);
                            Facture facture = factureRepository.findByAttachementId(att.getId()).orElse(null);
                            if (facture != null) {
                                transaction.put("facture", facture);
                                List<Paiement> paiements = paiementRepository.findByFactureId(facture.getId());
                                transaction.put("paiements", paiements);
                            }
                        }
                    }
                }
            }

            // Déterminer le statut global
            String status = "blocked";
            Facture facture = (Facture) transaction.get("facture");
            List<Paiement> paiements = (List<Paiement>) transaction.get("paiements");

            // Montant total encaissé vs montant de la facture. L'étape
            // paiement (et donc la transaction) n'est "completed" que si le
            // total des encaissements correspond réellement au montant de
            // la facture. Sinon, même avec des paiements déjà enregistrés
            // (conservés pour la traçabilité), le statut reste "in_progress".
            boolean isFullyPaid = false;
            if (facture != null && paiements != null && !paiements.isEmpty()) {
                double totalPaid = paiements.stream()
                        .mapToDouble(p -> p.getAmount() != null ? p.getAmount() : 0.0)
                        .sum();
                double factureAmount = facture.getAmount() != null ? facture.getAmount() : 0.0;
                isFullyPaid = Math.abs(totalPaid - factureAmount) < 0.01;
                transaction.put("totalPaid", totalPaid);
                transaction.put("isFullyPaid", isFullyPaid);
            }

            if (isFullyPaid) {
                status = "completed";
            } else if (facture != null) {
                status = "in_progress";
            } else if (transaction.get("attachement") != null) {
                status = "in_progress";
            } else if (transaction.get("bl") != null) {
                status = "in_progress";
            }
            transaction.put("status", status);

            if (transaction.containsKey("devis")) {
                timeline.add(transaction);
            }
        }

        return timeline;
    }
}