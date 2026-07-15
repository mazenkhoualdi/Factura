package com.factura.repository;

import com.factura.model.Societe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface SocieteRepository extends JpaRepository<Societe, UUID> {
}