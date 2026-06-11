-- ArbiTrack - Schema Supabase
-- Execute este SQL no Supabase SQL Editor

-- Casas de Apostas
CREATE TABLE casas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  ativa BOOLEAN DEFAULT true,
  saldo_atual DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Apostas (arbitragens)
CREATE TABLE apostas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  evento TEXT NOT NULL,
  modalidade TEXT,
  data_evento TIMESTAMPTZ,
  casa1_id UUID REFERENCES casas(id),
  casa1_mercado TEXT,
  casa1_odd DECIMAL(6,3),
  casa1_stake DECIMAL(10,2),
  casa2_id UUID REFERENCES casas(id),
  casa2_mercado TEXT,
  casa2_odd DECIMAL(6,3),
  casa2_stake DECIMAL(10,2),
  total_apostado DECIMAL(10,2),
  lucro DECIMAL(10,2),
  roi DECIMAL(6,2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'green', 'red', 'void')),
  notas TEXT,
  grupo_evento TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Movimentações de saldo
CREATE TABLE movimentacoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  casa_id UUID REFERENCES casas(id),
  tipo TEXT CHECK (tipo IN ('deposito', 'saque', 'ajuste')),
  valor DECIMAL(10,2),
  descricao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Atualizar saldo da casa automaticamente
CREATE OR REPLACE FUNCTION atualizar_saldo_casa()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE casas SET saldo_atual = (
    SELECT COALESCE(SUM(
      CASE WHEN tipo = 'deposito' THEN valor
           WHEN tipo = 'saque' THEN -valor
           ELSE valor END
    ), 0)
    FROM movimentacoes WHERE casa_id = NEW.casa_id
  ), updated_at = NOW()
  WHERE id = NEW.casa_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_atualizar_saldo
AFTER INSERT OR UPDATE OR DELETE ON movimentacoes
FOR EACH ROW EXECUTE FUNCTION atualizar_saldo_casa();

-- Dados iniciais de exemplo
INSERT INTO casas (nome, ativa, saldo_atual) VALUES
('Bet365', true, 350.00),
('Betano', true, 300.00),
('Stake', true, 355.30),
('Superbet', true, 250.00);

-- Row Level Security (RLS) - desativado para uso pessoal
-- Se quiser proteger os dados, habilite e configure conforme necessário
