-- V2__sharing_tables.sql
-- Creates sharing tables: shared_notes, shared_notebooks

CREATE TABLE shared_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    note_id UUID NOT NULL REFERENCES notes(id),
    shared_by_user_id UUID NOT NULL REFERENCES users(id),
    shared_with_user_id UUID NOT NULL REFERENCES users(id),
    permission_level VARCHAR(50) NOT NULL DEFAULT 'VIEW',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    UNIQUE(note_id, shared_with_user_id)
);

CREATE TABLE shared_notebooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notebook_id UUID NOT NULL REFERENCES notebooks(id),
    shared_by_user_id UUID NOT NULL REFERENCES users(id),
    shared_with_user_id UUID NOT NULL REFERENCES users(id),
    permission_level VARCHAR(50) NOT NULL DEFAULT 'VIEW',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    UNIQUE(notebook_id, shared_with_user_id)
);

-- Create indexes for sharing tables
CREATE INDEX idx_shared_notes_note_id ON shared_notes(note_id);
CREATE INDEX idx_shared_notes_shared_by ON shared_notes(shared_by_user_id);
CREATE INDEX idx_shared_notes_shared_with ON shared_notes(shared_with_user_id);
CREATE INDEX idx_shared_notebooks_notebook_id ON shared_notebooks(notebook_id);
CREATE INDEX idx_shared_notebooks_shared_by ON shared_notebooks(shared_by_user_id);
CREATE INDEX idx_shared_notebooks_shared_with ON shared_notebooks(shared_with_user_id);
