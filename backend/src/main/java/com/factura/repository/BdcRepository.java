package com.factura.repository;

import com.factura.model.BDC;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BdcRepository extends JpaRepository<BDC, UUID> {
    BDC findByNumber(String number);
    BDC findByDevisNumber(String devisNumber);
    Optional<BDC> findByDevisId(UUID devisId);  // <-- AJOUTER CETTE MÉTHODE
}