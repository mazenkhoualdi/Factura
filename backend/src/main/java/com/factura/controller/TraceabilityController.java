package com.factura.controller;

import com.factura.service.TraceabilityService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/traceability")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class TraceabilityController {
    private final TraceabilityService traceabilityService;

    @GetMapping("/search")
    public Map<String, Object> search(@RequestParam String query) {
        return traceabilityService.search(query);
    }
}