package com.factura.repository;

import com.factura.model.Objectif;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ObjectifRepository extends JpaRepository<Objectif, String> {
}
