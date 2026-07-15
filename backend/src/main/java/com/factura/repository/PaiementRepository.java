package com.factura.repository;

import com.factura.model.Paiement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface PaiementRepository extends JpaRepository<Paiement, UUID> {
    Paiement findByReference(String reference);
    List<Paiement> findByFactureNumber(String factureNumber);
    List<Paiement> findByFactureId(UUID factureId);  // <-- AJOUTER CETTE MÉTHODE
}