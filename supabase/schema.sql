-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables
CREATE TABLE planos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome TEXT NOT NULL CHECK (nome IN ('teste', 'básico', 'avançado')),
    preco_mensal NUMERIC(10,2) NOT NULL,
    descricao TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE empresas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome TEXT NOT NULL,
    cnpj TEXT UNIQUE NOT NULL,
    email TEXT NOT NULL,
    telefone TEXT,
    plano_id UUID REFERENCES planos(id),
    status TEXT NOT NULL CHECK (status IN ('ativo', 'inativo', 'teste')),
    data_aprovacao TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE usuarios (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    nome TEXT NOT NULL,
    email TEXT NOT NULL,
    tipo_usuario TEXT NOT NULL CHECK (tipo_usuario IN ('cliente', 'interno')),
    funcao TEXT NOT NULL,
    empresa_id UUID REFERENCES empresas(id),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE solicitacoes_acesso (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome TEXT NOT NULL,
    empresa_nome TEXT NOT NULL,
    cnpj TEXT NOT NULL,
    email TEXT NOT NULL,
    telefone TEXT,
    justificativa TEXT,
    status TEXT NOT NULL CHECK (status IN ('pendente', 'aprovado', 'rejeitado')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orgaos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome TEXT NOT NULL,
    uasg TEXT,
    esfera TEXT NOT NULL CHECK (esfera IN ('municipal', 'estadual', 'federal')),
    estado TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE editais (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    orgao_id UUID REFERENCES orgaos(id),
    empresa_id UUID REFERENCES empresas(id),
    numero TEXT NOT NULL,
    sistema TEXT NOT NULL,
    data_disputa DATE NOT NULL,
    hora_disputa TIME,
    prazo_entrega INTEGER,
    status TEXT NOT NULL CHECK (status IN ('aguardando', 'vencido', 'ganho', 'perdido', 'cancelado')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE itens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    edital_id UUID REFERENCES editais(id),
    numero_item TEXT NOT NULL,
    nome TEXT NOT NULL,
    quantidade INTEGER NOT NULL,
    valor_maximo NUMERIC(10,2),
    status TEXT NOT NULL CHECK (status IN ('habilitado', 'desclassificado')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE produtos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome TEXT NOT NULL,
    marca TEXT,
    modelo TEXT,
    unidade TEXT NOT NULL,
    descricao TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE fornecedores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome TEXT NOT NULL,
    email TEXT,
    telefone TEXT,
    empresa_id UUID REFERENCES empresas(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE precos_produtos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    produto_id UUID REFERENCES produtos(id),
    fornecedor_id UUID REFERENCES fornecedores(id),
    preco NUMERIC(10,2) NOT NULL,
    frete NUMERIC(10,2),
    data_coleta DATE NOT NULL,
    validade INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE documentos_empresa (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES empresas(id),
    nome TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('certidão', 'contrato', 'outros')),
    validade DATE,
    arquivo_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE historico_lances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID REFERENCES itens(id),
    preco_disputado NUMERIC(10,2) NOT NULL,
    resultado TEXT NOT NULL CHECK (resultado IN ('ganhou', 'perdeu', 'cancelado')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security
ALTER TABLE planos ENABLE ROW LEVEL SECURITY;
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE solicitacoes_acesso ENABLE ROW LEVEL SECURITY;
ALTER TABLE orgaos ENABLE ROW LEVEL SECURITY;
ALTER TABLE editais ENABLE ROW LEVEL SECURITY;
ALTER TABLE itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE fornecedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE precos_produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos_empresa ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico_lances ENABLE ROW LEVEL SECURITY;

-- Create temporary policies for testing
CREATE POLICY "Permitir tudo" ON planos FOR ALL USING (true);
CREATE POLICY "Permitir tudo" ON empresas FOR ALL USING (true);
CREATE POLICY "Permitir tudo" ON usuarios FOR ALL USING (true);
CREATE POLICY "Permitir tudo" ON solicitacoes_acesso FOR ALL USING (true);
CREATE POLICY "Permitir tudo" ON orgaos FOR ALL USING (true);
CREATE POLICY "Permitir tudo" ON editais FOR ALL USING (true);
CREATE POLICY "Permitir tudo" ON itens FOR ALL USING (true);
CREATE POLICY "Permitir tudo" ON produtos FOR ALL USING (true);
CREATE POLICY "Permitir tudo" ON fornecedores FOR ALL USING (true);
CREATE POLICY "Permitir tudo" ON precos_produtos FOR ALL USING (true);
CREATE POLICY "Permitir tudo" ON documentos_empresa FOR ALL USING (true);
CREATE POLICY "Permitir tudo" ON historico_lances FOR ALL USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_empresas_updated_at
    BEFORE UPDATE ON empresas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usuarios_updated_at
    BEFORE UPDATE ON usuarios
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 