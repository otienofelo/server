CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Farmers table
CREATE TABLE farmers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  village VARCHAR(255) NOT NULL,
  farm_size FLOAT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Animals table
CREATE TABLE animals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id VARCHAR(255) NOT NULL,
  farmer_id UUID REFERENCES farmers(id) ON DELETE CASCADE,
  tag VARCHAR(100) NOT NULL,
  species VARCHAR(50) NOT NULL,
  breed VARCHAR(100),
  age INTEGER,
  status VARCHAR(50) DEFAULT 'healthy',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Visits table (health records)
CREATE TABLE visits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id VARCHAR(255) NOT NULL,
  animal_id UUID REFERENCES animals(id) ON DELETE CASCADE,
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  symptoms TEXT[],
  diseases JSONB, -- array of objects: [{name, confidence, prevention, treatment}]
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Diseases table (disease library)
CREATE TABLE diseases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  species VARCHAR(50) NOT NULL,
  symptoms TEXT[],
  prevention TEXT,
  treatment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);