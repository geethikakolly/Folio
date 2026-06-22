package com.folio;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

/**
 * Main entry point for the Folio API application.
 * 
 * Folio is an enterprise Notes & Knowledge Management Platform
 * demonstrating enterprise architecture patterns.
 */
@SpringBootApplication
@EnableCaching
public class FolioApplication {

    public static void main(String[] args) {
        SpringApplication.run(FolioApplication.class, args);
    }
}
