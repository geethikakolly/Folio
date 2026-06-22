-- V1__initial_schema.sql
-- Creates core tables: users, notebooks, notes, tags, attachments

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    avatar_url VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE TABLE notebooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#FFFFFF',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE TABLE notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notebook_id UUID NOT NULL REFERENCES notebooks(id),
    user_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    markdown_content TEXT,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    color VARCHAR(7) DEFAULT '#CCCCCC',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    UNIQUE(user_id, name)
);

CREATE TABLE note_tags (
    note_id UUID NOT NULL REFERENCES notes(id),
    tag_id UUID NOT NULL REFERENCES tags(id),
    PRIMARY KEY (note_id, tag_id)
);

CREATE TABLE attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    note_id UUID NOT NULL REFERENCES notes(id),
    user_id UUID NOT NULL REFERENCES users(id),
    file_name VARCHAR(500) NOT NULL,
    file_url VARCHAR(1000) NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_notebooks_user_id ON notebooks(user_id);
CREATE INDEX idx_notes_notebook_id ON notes(notebook_id);
CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_title ON notes(title);
CREATE INDEX idx_tags_user_id ON tags(user_id);
CREATE INDEX idx_attachments_note_id ON attachments(note_id);
CREATE INDEX idx_attachments_user_id ON attachments(user_id);
