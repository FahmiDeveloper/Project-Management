package com.fehmidev.projectmanagement.web.rest;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

/**
 * Serves files stored by {@code FileStorageService} back over HTTP.
 * <p>
 * Replaces a previous {@code ResourceHandlerRegistry}-based mapping in {@code WebConfigurer},
 * which turned out to be unreliable on Windows: {@code Path.toUri()} only appends the trailing
 * slash a directory location needs if that directory already exists on disk at the exact
 * moment it's called (a bean-initialization-order race), and hand-building a "file:" URI
 * string is easy to get subtly wrong (a well-formed Windows file URI needs "file:///C:/...",
 * not "file:C:/..."). Reading the file directly here avoids all of that: no URI parsing, no
 * dependency on resource-handler registration order, and any failure is a plain, loggable
 * "file not found on disk" rather than a silent resource-location mismatch.
 * <p>
 * "/content/uploads/**" must keep matching {@code FileStorageService.PUBLIC_URL_PREFIX} and
 * the corresponding permitAll() rule in SecurityConfiguration.
 */
@RestController
public class UploadedFileResource {

    private static final Logger LOG = LoggerFactory.getLogger(UploadedFileResource.class);

    private final Path rootLocation;

    public UploadedFileResource(@Value("${file.upload-dir:uploads}") String uploadDir) {
        this.rootLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    /**
     * @param subFolder logical grouping folder used at upload time, e.g. "profile-pictures".
     * @param filename the generated (UUID-based) filename, including extension.
     */
    @GetMapping("/content/uploads/{subFolder}/{filename:.+}")
    public ResponseEntity<Resource> serve(@PathVariable String subFolder, @PathVariable String filename) throws IOException {
        Path file = rootLocation.resolve(subFolder).resolve(filename).normalize();

        // Defensive check: refuse to serve anything outside the intended upload root,
        // mirroring the equivalent guard in FileStorageService.store().
        if (!file.startsWith(rootLocation)) {
            LOG.warn("Refusing to serve file outside upload root: {}", file);
            return ResponseEntity.notFound().build();
        }

        if (!Files.exists(file) || !Files.isReadable(file)) {
            LOG.debug("Requested file not found on disk: {}", file);
            return ResponseEntity.notFound().build();
        }

        Resource resource = new UrlResource(file.toUri());
        String contentType = Files.probeContentType(file);

        return ResponseEntity.ok()
            .contentType(contentType != null ? MediaType.parseMediaType(contentType) : MediaType.APPLICATION_OCTET_STREAM)
            .body(resource);
    }
}
