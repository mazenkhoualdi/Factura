package com.factura.repository;

import com.factura.model.BL;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface BlRepository extends JpaRepository<BL, UUID> {
    BL findByNumber(String number);
}