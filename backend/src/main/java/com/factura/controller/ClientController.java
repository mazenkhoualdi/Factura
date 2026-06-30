package com.factura.controller;

import com.factura.model.Client;
import com.factura.service.ClientService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/clients")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class ClientController {
    private final ClientService clientService;

    @GetMapping
    public List<Client> getAllClients() {
        return clientService.getAllClients();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Client> getClientById(@PathVariable UUID id) {
        return clientService.getClientById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Client createClient(@RequestBody Client client) {
        return clientService.createClient(client);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Client> updateClient(@PathVariable UUID id, @RequestBody Client clientDetails) {
        try {
            Client updated = clientService.updateClient(id, clientDetails);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteClient(@PathVariable UUID id) {
        clientService.deleteClient(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/pdf")
    public ResponseEntity<String> uploadPdf(@PathVariable UUID id, @RequestParam("file") MultipartFile file) {
        try {
            String path = clientService.uploadPdf(id, file);
            return ResponseEntity.ok(path);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Erreur lors de l'upload du PDF");
        }
    }

    // Télécharger le PDF (attachment)
    @GetMapping("/{id}/pdf")
    public ResponseEntity<Resource> downloadPdf(@PathVariable UUID id) {
        try {
            Client client = clientService.getClientById(id)
                    .orElseThrow(() -> new RuntimeException("Client non trouvé"));

            if (client.getPdfUrl() == null || client.getPdfUrl().isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            // Essayer avec le chemin relatif d'abord
            Path filePath = Paths.get(client.getPdfUrl());
            
            // Si le fichier n'existe pas, essayer avec le chemin absolu
            if (!Files.exists(filePath)) {
                String basePath = System.getProperty("user.dir");
                filePath = Paths.get(basePath, client.getPdfUrl());
            }
            
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists()) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION, 
                            "attachment; filename=\"" + client.getFileName() + "\"")
                    .body(resource);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    // Visualiser le PDF (inline)
    @GetMapping("/{id}/pdf/view")
    public ResponseEntity<Resource> viewPdf(@PathVariable UUID id) {
        try {
            Client client = clientService.getClientById(id)
                    .orElseThrow(() -> new RuntimeException("Client non trouvé"));

            if (client.getPdfUrl() == null || client.getPdfUrl().isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            // Essayer avec le chemin relatif d'abord
            Path filePath = Paths.get(client.getPdfUrl());
            
            // Si le fichier n'existe pas, essayer avec le chemin absolu
            if (!Files.exists(filePath)) {
                String basePath = System.getProperty("user.dir");
                filePath = Paths.get(basePath, client.getPdfUrl());
            }
            
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists()) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION, 
                            "inline; filename=\"" + client.getFileName() + "\"")
                    .body(resource);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}