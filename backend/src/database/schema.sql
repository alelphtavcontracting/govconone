
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

ALTER DATABASE govconone SET row_security = on;

CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) UNIQUE,
    subscription_tier VARCHAR(20) NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'elite')),
    subscription_status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (subscription_status IN ('active', 'suspended', 'cancelled')),
    ai_usage_quota INTEGER DEFAULT 1000,
    ai_usage_current INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    google_id VARCHAR(255) UNIQUE,
    avatar_url TEXT,
    role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE ai_usage_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    model_used VARCHAR(255),
    tokens_used INTEGER,
    cost_estimate DECIMAL(10, 6),
    duration_ms INTEGER,
    request_data JSONB,
    response_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    content TEXT,
    metadata JSONB,
    file_url TEXT,
    file_size INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    solicitation_number VARCHAR(255),
    agency VARCHAR(255),
    description TEXT,
    naics_codes TEXT[],
    set_aside_type VARCHAR(100),
    contract_value_min DECIMAL(15, 2),
    contract_value_max DECIMAL(15, 2),
    due_date TIMESTAMP WITH TIME ZONE,
    ai_score INTEGER CHECK (ai_score >= 0 AND ai_score <= 100),
    ai_analysis JSONB,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'submitted', 'awarded', 'closed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    opportunity_id UUID REFERENCES opportunities(id) ON DELETE SET NULL,
    contract_number VARCHAR(255),
    title VARCHAR(500) NOT NULL,
    agency VARCHAR(255),
    contract_value DECIMAL(15, 2),
    start_date DATE,
    end_date DATE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'terminated')),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE subcontractors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    website VARCHAR(255),
    capabilities TEXT[],
    naics_codes TEXT[],
    certifications TEXT[],
    location VARCHAR(255),
    ai_match_score INTEGER CHECK (ai_match_score >= 0 AND ai_match_score <= 100),
    contact_history JSONB,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blacklisted')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE capability_statements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    template_type VARCHAR(50),
    naics_codes TEXT[],
    ai_generated BOOLEAN DEFAULT false,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON tenants FOR ALL TO authenticated USING (id = current_setting('app.current_tenant_id')::UUID);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_tenant_isolation ON users FOR ALL TO authenticated USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY ai_usage_tenant_isolation ON ai_usage_logs FOR ALL TO authenticated USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY documents_tenant_isolation ON documents FOR ALL TO authenticated USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
CREATE POLICY opportunities_tenant_isolation ON opportunities FOR ALL TO authenticated USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
CREATE POLICY contracts_tenant_isolation ON contracts FOR ALL TO authenticated USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

ALTER TABLE subcontractors ENABLE ROW LEVEL SECURITY;
CREATE POLICY subcontractors_tenant_isolation ON subcontractors FOR ALL TO authenticated USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

ALTER TABLE capability_statements ENABLE ROW LEVEL SECURITY;
CREATE POLICY capability_statements_tenant_isolation ON capability_statements FOR ALL TO authenticated USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_google_id ON users(google_id);

CREATE INDEX idx_ai_usage_logs_tenant_id ON ai_usage_logs(tenant_id);
CREATE INDEX idx_ai_usage_logs_user_id ON ai_usage_logs(user_id);
CREATE INDEX idx_ai_usage_logs_created_at ON ai_usage_logs(created_at);

CREATE INDEX idx_documents_tenant_id ON documents(tenant_id);
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_type ON documents(type);

CREATE INDEX idx_opportunities_tenant_id ON opportunities(tenant_id);
CREATE INDEX idx_opportunities_due_date ON opportunities(due_date);
CREATE INDEX idx_opportunities_status ON opportunities(status);

CREATE INDEX idx_contracts_tenant_id ON contracts(tenant_id);
CREATE INDEX idx_contracts_status ON contracts(status);

CREATE INDEX idx_subcontractors_tenant_id ON subcontractors(tenant_id);
CREATE INDEX idx_subcontractors_status ON subcontractors(status);

CREATE INDEX idx_capability_statements_tenant_id ON capability_statements(tenant_id);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_opportunities_updated_at BEFORE UPDATE ON opportunities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON contracts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subcontractors_updated_at BEFORE UPDATE ON subcontractors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_capability_statements_updated_at BEFORE UPDATE ON capability_statements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
