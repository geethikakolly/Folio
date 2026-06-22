package com.folio.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.HashMap;
import java.util.Map;
import java.time.LocalDateTime;

/**
 * Health check controller for the API.
 * 
 * Provides endpoints to check if the application is running and ready to serve requests.
 */
@RestController
@RequestMapping("/health")
public class HealthController {

    @GetMapping
    public Map<String, Object> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("timestamp", LocalDateTime.now());
        response.put("service", "Folio API");
        response.put("version", "0.1.0");
        return response;
    }

    @GetMapping("/live")
    public Map<String, String> liveness() {
        return Map.of("status", "UP");
    }

    @GetMapping("/ready")
    public Map<String, String> readiness() {
        return Map.of("status", "READY");
    }
}
