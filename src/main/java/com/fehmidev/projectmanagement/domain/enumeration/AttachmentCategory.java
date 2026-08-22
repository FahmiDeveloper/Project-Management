package com.fehmidev.projectmanagement.domain.enumeration;

/**
 * The AttachmentCategory enumeration.
 * Distinguishes an employee's profile picture from any other file attached to them
 * (e.g. documents, resumes) so both can live in the same attachment table without ambiguity.
 */
public enum AttachmentCategory {
    PROFILE_PICTURE,
    GENERAL,
}
