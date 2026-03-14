package com.mora.ocr.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
public class OcrService {

    @Value("${python.api.url:http://localhost:8000}")
    private String pythonApiUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public String processOcr(MultipartFile file) throws IOException {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        ByteArrayResource resource = new ByteArrayResource(file.getBytes()) {
            @Override
            public String getFilename() {
                return file.getOriginalFilename();
            }
        };

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", new HttpEntity<>(resource, createFileHeaders(file)));

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        ResponseEntity<String> response = restTemplate.exchange(
                pythonApiUrl + "/ocr",
                HttpMethod.POST,
                requestEntity,
                String.class
        );

        return response.getBody();
    }

    private HttpHeaders createFileHeaders(MultipartFile file) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(
                file.getContentType() != null ? file.getContentType() : "application/octet-stream"));
        headers.setContentDispositionFormData("file", file.getOriginalFilename());
        return headers;
    }
}
