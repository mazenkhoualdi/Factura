package com.factura.repository;

import com.factura.model.Facture;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FactureRepository extends JpaRepository<Facture, UUID> {
    Facture findByNumber(String number);
    Facture findByAttachmentNumber(String attachmentNumber);
    
    // Méthode pour trouver une facture par attachementId
    // Le nom du champ dans l'entité Facture est "attachement" (sans le 't' de plus)
    Optional<Facture> findByAttachementId(UUID attachementId);
}