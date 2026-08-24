package com.fehmidev.projectmanagement.service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

/**
 * Stores uploaded files on the local filesystem.
 * <p>
 * Kept as a small, focused service so the storage backend (local disk today) can be swapped
 * for cloud storage (S3, Azure Blob, GCS, ...) later by replacing this class alone - nothing
 * that calls {@link #store(MultipartFile, String)} needs to change.
 */
@Service
public class FileStorageService {

    private static final Logger LOG = LoggerFactory.getLogger(FileStorageService.class);

    private final Path rootLocation;

    // Base URL prefix under which stored files are served back, see WebConfigurer's
    // resource handler mapping for "${file.upload-dir}" -> this same prefix.
    private static final String PUBLIC_URL_PREFIX = "/content/uploads";

    public FileStorageService(@Value("${file.upload-dir:uploads}") String uploadDir) {
        this.rootLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.rootLocation);
        } catch (IOException e) {
            throw new IllegalStateException("Could not initialize upload storage directory: " + this.rootLocation, e);
        }
    }

    /**
     * Stores the given file under a generated, collision-proof name inside a sub-folder
     * (e.g. "profile-pictures"), and returns the public URL it can be served back at.
     *
     * @param file the uploaded file.
     * @param subFolder logical grouping folder, e.g. "profile-pictures".
     * @return a {@link StoredFile} with the generated public URL and original metadata.
     */
    public StoredFile store(MultipartFile file, String subFolder) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Cannot store an empty file");
        }

        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "file");
        String extension = "";
        int dotIndex = originalFilename.lastIndexOf('.');
        if (dotIndex >= 0) {
            extension = originalFilename.substring(dotIndex); // includes the dot, e.g. ".png"
        }

        String generatedFilename = UUID.randomUUID() + extension;

        try {
            Path targetDir = this.rootLocation.resolve(subFolder).normalize();
            Files.createDirectories(targetDir);

            Path targetPath = targetDir.resolve(generatedFilename).normalize();
            // Defensive check: refuse to write outside the intended sub-folder.
            if (!targetPath.getParent().equals(targetDir)) {
                throw new IllegalArgumentException("Refusing to store file outside target directory");
            }

            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, targetPath, StandardCopyOption.REPLACE_EXISTING);
            }

            String publicUrl = PUBLIC_URL_PREFIX + "/" + subFolder + "/" + generatedFilename;
            LOG.debug("Stored file '{}' at '{}', public URL '{}'", originalFilename, targetPath, publicUrl);

            return new StoredFile(publicUrl, originalFilename, file.getContentType(), file.getSize());
        } catch (IOException e) {
            throw new IllegalStateException("Failed to store file: " + originalFilename, e);
        }
    }

    /** Metadata returned after a successful store, enough to populate an Attachment. */
    public record StoredFile(String publicUrl, String originalFilename, String contentType, long size) {}
}
