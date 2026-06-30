package com.fehmidev.projectmanagement.web.rest;

import static com.fehmidev.projectmanagement.domain.TaskCommentAsserts.*;
import static com.fehmidev.projectmanagement.web.rest.TestUtil.createUpdateProxyForBean;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fehmidev.projectmanagement.IntegrationTest;
import com.fehmidev.projectmanagement.domain.TaskComment;
import com.fehmidev.projectmanagement.repository.TaskCommentRepository;
import com.fehmidev.projectmanagement.service.TaskCommentService;
import com.fehmidev.projectmanagement.service.dto.TaskCommentDTO;
import com.fehmidev.projectmanagement.service.mapper.TaskCommentMapper;
import jakarta.persistence.EntityManager;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Integration tests for the {@link TaskCommentResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class TaskCommentResourceIT {

    private static final String DEFAULT_CONTENT = "AAAAAAAAAA";
    private static final String UPDATED_CONTENT = "BBBBBBBBBB";

    private static final Instant DEFAULT_CREATED_DATE = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_CREATED_DATE = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final String ENTITY_API_URL = "/api/task-comments";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private TaskCommentRepository taskCommentRepository;

    @Mock
    private TaskCommentRepository taskCommentRepositoryMock;

    @Autowired
    private TaskCommentMapper taskCommentMapper;

    @Mock
    private TaskCommentService taskCommentServiceMock;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restTaskCommentMockMvc;

    private TaskComment taskComment;

    private TaskComment insertedTaskComment;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static TaskComment createEntity() {
        return new TaskComment().content(DEFAULT_CONTENT).createdDate(DEFAULT_CREATED_DATE);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static TaskComment createUpdatedEntity() {
        return new TaskComment().content(UPDATED_CONTENT).createdDate(UPDATED_CREATED_DATE);
    }

    @BeforeEach
    void initTest() {
        taskComment = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedTaskComment != null) {
            taskCommentRepository.delete(insertedTaskComment);
            insertedTaskComment = null;
        }
    }

    @Test
    @Transactional
    void createTaskComment() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the TaskComment
        TaskCommentDTO taskCommentDTO = taskCommentMapper.toDto(taskComment);
        var returnedTaskCommentDTO = om.readValue(
            restTaskCommentMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(taskCommentDTO)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            TaskCommentDTO.class
        );

        // Validate the TaskComment in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedTaskComment = taskCommentMapper.toEntity(returnedTaskCommentDTO);
        assertTaskCommentUpdatableFieldsEquals(returnedTaskComment, getPersistedTaskComment(returnedTaskComment));

        insertedTaskComment = returnedTaskComment;
    }

    @Test
    @Transactional
    void createTaskCommentWithExistingId() throws Exception {
        // Create the TaskComment with an existing ID
        taskComment.setId(1L);
        TaskCommentDTO taskCommentDTO = taskCommentMapper.toDto(taskComment);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restTaskCommentMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(taskCommentDTO)))
            .andExpect(status().isBadRequest());

        // Validate the TaskComment in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkCreatedDateIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        taskComment.setCreatedDate(null);

        // Create the TaskComment, which fails.
        TaskCommentDTO taskCommentDTO = taskCommentMapper.toDto(taskComment);

        restTaskCommentMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(taskCommentDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllTaskComments() throws Exception {
        // Initialize the database
        insertedTaskComment = taskCommentRepository.saveAndFlush(taskComment);

        // Get all the taskCommentList
        restTaskCommentMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(taskComment.getId().intValue())))
            .andExpect(jsonPath("$.[*].content").value(hasItem(DEFAULT_CONTENT)))
            .andExpect(jsonPath("$.[*].createdDate").value(hasItem(DEFAULT_CREATED_DATE.toString())));
    }

    @SuppressWarnings({ "unchecked" })
    void getAllTaskCommentsWithEagerRelationshipsIsEnabled() throws Exception {
        when(taskCommentServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restTaskCommentMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(taskCommentServiceMock, times(1)).findAllWithEagerRelationships(any());
    }

    @SuppressWarnings({ "unchecked" })
    void getAllTaskCommentsWithEagerRelationshipsIsNotEnabled() throws Exception {
        when(taskCommentServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restTaskCommentMockMvc.perform(get(ENTITY_API_URL + "?eagerload=false")).andExpect(status().isOk());
        verify(taskCommentRepositoryMock, times(1)).findAll(any(Pageable.class));
    }

    @Test
    @Transactional
    void getTaskComment() throws Exception {
        // Initialize the database
        insertedTaskComment = taskCommentRepository.saveAndFlush(taskComment);

        // Get the taskComment
        restTaskCommentMockMvc
            .perform(get(ENTITY_API_URL_ID, taskComment.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(taskComment.getId().intValue()))
            .andExpect(jsonPath("$.content").value(DEFAULT_CONTENT))
            .andExpect(jsonPath("$.createdDate").value(DEFAULT_CREATED_DATE.toString()));
    }

    @Test
    @Transactional
    void getNonExistingTaskComment() throws Exception {
        // Get the taskComment
        restTaskCommentMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingTaskComment() throws Exception {
        // Initialize the database
        insertedTaskComment = taskCommentRepository.saveAndFlush(taskComment);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the taskComment
        TaskComment updatedTaskComment = taskCommentRepository.findById(taskComment.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedTaskComment are not directly saved in db
        em.detach(updatedTaskComment);
        updatedTaskComment.content(UPDATED_CONTENT).createdDate(UPDATED_CREATED_DATE);
        TaskCommentDTO taskCommentDTO = taskCommentMapper.toDto(updatedTaskComment);

        restTaskCommentMockMvc
            .perform(
                put(ENTITY_API_URL_ID, taskCommentDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(taskCommentDTO))
            )
            .andExpect(status().isOk());

        // Validate the TaskComment in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedTaskCommentToMatchAllProperties(updatedTaskComment);
    }

    @Test
    @Transactional
    void putNonExistingTaskComment() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        taskComment.setId(longCount.incrementAndGet());

        // Create the TaskComment
        TaskCommentDTO taskCommentDTO = taskCommentMapper.toDto(taskComment);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restTaskCommentMockMvc
            .perform(
                put(ENTITY_API_URL_ID, taskCommentDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(taskCommentDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the TaskComment in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchTaskComment() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        taskComment.setId(longCount.incrementAndGet());

        // Create the TaskComment
        TaskCommentDTO taskCommentDTO = taskCommentMapper.toDto(taskComment);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restTaskCommentMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(taskCommentDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the TaskComment in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamTaskComment() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        taskComment.setId(longCount.incrementAndGet());

        // Create the TaskComment
        TaskCommentDTO taskCommentDTO = taskCommentMapper.toDto(taskComment);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restTaskCommentMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(taskCommentDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the TaskComment in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateTaskCommentWithPatch() throws Exception {
        // Initialize the database
        insertedTaskComment = taskCommentRepository.saveAndFlush(taskComment);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the taskComment using partial update
        TaskComment partialUpdatedTaskComment = new TaskComment();
        partialUpdatedTaskComment.setId(taskComment.getId());

        partialUpdatedTaskComment.createdDate(UPDATED_CREATED_DATE);

        restTaskCommentMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedTaskComment.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedTaskComment))
            )
            .andExpect(status().isOk());

        // Validate the TaskComment in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertTaskCommentUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedTaskComment, taskComment),
            getPersistedTaskComment(taskComment)
        );
    }

    @Test
    @Transactional
    void fullUpdateTaskCommentWithPatch() throws Exception {
        // Initialize the database
        insertedTaskComment = taskCommentRepository.saveAndFlush(taskComment);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the taskComment using partial update
        TaskComment partialUpdatedTaskComment = new TaskComment();
        partialUpdatedTaskComment.setId(taskComment.getId());

        partialUpdatedTaskComment.content(UPDATED_CONTENT).createdDate(UPDATED_CREATED_DATE);

        restTaskCommentMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedTaskComment.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedTaskComment))
            )
            .andExpect(status().isOk());

        // Validate the TaskComment in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertTaskCommentUpdatableFieldsEquals(partialUpdatedTaskComment, getPersistedTaskComment(partialUpdatedTaskComment));
    }

    @Test
    @Transactional
    void patchNonExistingTaskComment() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        taskComment.setId(longCount.incrementAndGet());

        // Create the TaskComment
        TaskCommentDTO taskCommentDTO = taskCommentMapper.toDto(taskComment);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restTaskCommentMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, taskCommentDTO.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(taskCommentDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the TaskComment in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchTaskComment() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        taskComment.setId(longCount.incrementAndGet());

        // Create the TaskComment
        TaskCommentDTO taskCommentDTO = taskCommentMapper.toDto(taskComment);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restTaskCommentMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(taskCommentDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the TaskComment in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamTaskComment() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        taskComment.setId(longCount.incrementAndGet());

        // Create the TaskComment
        TaskCommentDTO taskCommentDTO = taskCommentMapper.toDto(taskComment);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restTaskCommentMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(taskCommentDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the TaskComment in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteTaskComment() throws Exception {
        // Initialize the database
        insertedTaskComment = taskCommentRepository.saveAndFlush(taskComment);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the taskComment
        restTaskCommentMockMvc
            .perform(delete(ENTITY_API_URL_ID, taskComment.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return taskCommentRepository.count();
    }

    protected void assertIncrementedRepositoryCount(long countBefore) {
        assertThat(countBefore + 1).isEqualTo(getRepositoryCount());
    }

    protected void assertDecrementedRepositoryCount(long countBefore) {
        assertThat(countBefore - 1).isEqualTo(getRepositoryCount());
    }

    protected void assertSameRepositoryCount(long countBefore) {
        assertThat(countBefore).isEqualTo(getRepositoryCount());
    }

    protected TaskComment getPersistedTaskComment(TaskComment taskComment) {
        return taskCommentRepository.findById(taskComment.getId()).orElseThrow();
    }

    protected void assertPersistedTaskCommentToMatchAllProperties(TaskComment expectedTaskComment) {
        assertTaskCommentAllPropertiesEquals(expectedTaskComment, getPersistedTaskComment(expectedTaskComment));
    }

    protected void assertPersistedTaskCommentToMatchUpdatableProperties(TaskComment expectedTaskComment) {
        assertTaskCommentAllUpdatablePropertiesEquals(expectedTaskComment, getPersistedTaskComment(expectedTaskComment));
    }
}
