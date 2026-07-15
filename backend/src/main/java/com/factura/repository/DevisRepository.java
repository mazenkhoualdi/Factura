package com.factura.repository;

import com.factura.model.Devis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DevisRepository extends JpaRepository<Devis, UUID> {
    Devis findByNumber(String number);
    
    // Nouvelle méthode pour trouver les devis par client
    List<Devis> findByClientId(UUID clientId);
}