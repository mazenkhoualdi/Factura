package com.factura.repository;

import com.factura.model.Facture;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface FactureRepository extends JpaRepository<Facture, UUID> {
    Facture findByNumber(String number);
}