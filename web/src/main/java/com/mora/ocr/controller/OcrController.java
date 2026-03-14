package com.mora.ocr.controller;

import com.mora.ocr.service.OcrService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

@RestController
@RequestMapping("/api/ocr")
public class OcrController {

    private final OcrService ocrService;
    private final Path uploadDir;

    public OcrController(OcrService ocrService) {
        this.ocrService = ocrService;
        this.uploadDir = Paths.get(System.getProperty("user.dir")).getParent().resolve("uploads");
        try {
            Files.createDirectories(uploadDir);
        } catch (IOException e) {
            throw new RuntimeException("Cannot create uploads directory", e);
        }
    }

    @PostMapping(value = "/upload", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> upload(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("{\"error\": \"파일이 비어있습니다.\"}");
        }

        try {
            // Save uploaded file
            String filename = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path dest = uploadDir.resolve(filename);
            Files.copy(file.getInputStream(), dest, StandardCopyOption.REPLACE_EXISTING);

            // Forward to Python OCR API
            String result = ocrService.processOcr(file);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("{\"error\": \"OCR 처리 중 오류가 발생했습니다: " + e.getMessage() + "\"}");
        }
    }
}
