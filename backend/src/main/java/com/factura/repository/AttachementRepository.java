package com.factura.repository;

import com.factura.model.Attachement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface AttachementRepository extends JpaRepository<Attachement, UUID> {
    Attachement findByNumber(String number);
}