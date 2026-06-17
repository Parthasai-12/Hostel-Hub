package com.example.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    private static final Logger log = LoggerFactory.getLogger(FileStorageService.class);
    private final Path fileStorageLocation;

    public FileStorageService() {
        this.fileStorageLocation = Paths.get("uploads/complaints").toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
            log.info("File storage location initialized at: {}", this.fileStorageLocation);
        } catch (Exception ex) {
            log.error("Could not create directory for file uploads: {}", this.fileStorageLocation, ex);
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    public String storeFile(MultipartFile file) {
        // Validate file
        if (file.isEmpty()) {
            log.warn("Attempted to upload an empty file");
            throw new RuntimeException("Failed to store empty file.");
        }

        log.info("Received file upload request. Original Name: {}, Mime Type: {}, Size: {} bytes",
                file.getOriginalFilename(), file.getContentType(), file.getSize());

        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            log.warn("Invalid file format: {}", contentType);
            throw new RuntimeException("Only image files are allowed.");
        }

        // Generate unique filename
        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
        String fileExtension = "";
        if (originalFilename.contains(".")) {
            fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String fileName = UUID.randomUUID().toString() + fileExtension;

        try {
            // Check for invalid characters
            if (fileName.contains("..")) {
                log.error("Invalid filename sequence: {}", fileName);
                throw new RuntimeException("Filename contains invalid path sequence " + fileName);
            }

            // Copy file to the target location
            Path targetLocation = this.fileStorageLocation.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            log.info("Successfully saved file to disk. Location: {}, Filename: {}", 
                    targetLocation.toAbsolutePath(), fileName);

            return fileName;
        } catch (IOException ex) {
            log.error("Failed to store file: {}", fileName, ex);
            throw new RuntimeException("Could not store file " + fileName + ". Please try again!", ex);
        }
    }

    public String getFileUrl(String fileName) {
        if (fileName == null || fileName.isEmpty()) {
            return null;
        }
        String fileUrl = "/uploads/complaints/" + fileName;
        log.info("Resolved image URL: {} for filename: {}", fileUrl, fileName);
        return fileUrl;
    }
}
