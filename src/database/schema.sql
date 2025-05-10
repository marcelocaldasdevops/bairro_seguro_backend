-- Tabela users (já estava correta)
CREATE TABLE users (
                       user_id SERIAL PRIMARY KEY,
                       name VARCHAR(100) NOT NULL,
                       email VARCHAR(100) UNIQUE NOT NULL,
                       password VARCHAR(255) NOT NULL,
                       cpf VARCHAR(14) UNIQUE NOT NULL,
                       bairro VARCHAR(100) NOT NULL,
                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela locations (já estava correta)
CREATE TABLE locations (
                           location_id SERIAL PRIMARY KEY,
                           latitude DECIMAL(10, 8) NOT NULL,
                           longitude DECIMAL(11, 8) NOT NULL
);

-- Tabela incidents (CORRIGIDA)
CREATE TABLE incidents (
                           incident_id SERIAL PRIMARY KEY,
                           user_id INTEGER REFERENCES users(user_id),
                           description TEXT NOT NULL,
                           severity_level VARCHAR(10) CHECK (severity_level IN ('low', 'medium', 'high')),
                           timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                           location_id INTEGER REFERENCES locations(location_id),
                           status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'in_progress'))
);

-- Índices (só executar após criar as tabelas)
CREATE INDEX idx_incidents_user_id ON incidents(user_id);
CREATE INDEX idx_incidents_location_id ON incidents(location_id);
CREATE INDEX idx_incidents_timestamp ON incidents(timestamp);

-- alter table
ALTER TABLE incidents
ALTER COLUMN user_id SET NOT NULL,
ALTER COLUMN location_id SET NOT NULL;