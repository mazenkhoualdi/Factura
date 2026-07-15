package com.factura.repository;

import com.factura.model.DevisAchat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface DevisAchatRepository extends JpaRepository<DevisAchat, UUID> {
    DevisAchat findByNumber(String number);
}
