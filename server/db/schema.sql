CREATE TABLE advisor_client_links (
  id SERIAL PRIMARY KEY,
  advisor_id INTEGER NOT NULL REFERENCES users(id),
  client_id INTEGER NOT NULL REFERENCES users(id),
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT no_self_link CHECK (advisor_id != client_id),
  CONSTRAINT unique_active_link UNIQUE (advisor_id, client_id)
);

ALTER TABLE advisor_client_links DROP CONSTRAINT unique_active_link;

CREATE UNIQUE INDEX unique_active_link
ON advisor_client_links (advisor_id, client_id)
WHERE status != 'revoked';



CREATE TABLE password_reset_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);