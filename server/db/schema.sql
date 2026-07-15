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