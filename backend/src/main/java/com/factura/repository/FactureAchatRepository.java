package com.factura.repository;

import com.factura.model.FactureAchat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface FactureAchatRepository extends JpaRepository<FactureAchat, UUID> {
    FactureAchat findByNumber(String number);
}
