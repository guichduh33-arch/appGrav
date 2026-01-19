-- Product Category Prices: Permet de définir des prix spécifiques par catégorie client
-- Ex: prix "wholesale" différent du prix retail pour les clients B2B

-- Table pour stocker les prix par catégorie client
CREATE TABLE IF NOT EXISTS product_category_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    customer_category_id UUID NOT NULL REFERENCES customer_categories(id) ON DELETE CASCADE,
    price NUMERIC(12, 2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),

    -- Un seul prix par produit/catégorie
    UNIQUE (product_id, customer_category_id)
);

-- Index pour les recherches fréquentes
CREATE INDEX idx_product_category_prices_product ON product_category_prices(product_id);
CREATE INDEX idx_product_category_prices_category ON product_category_prices(customer_category_id);
CREATE INDEX idx_product_category_prices_active ON product_category_prices(is_active) WHERE is_active = true;

-- RLS
ALTER TABLE product_category_prices ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow read product_category_prices" ON product_category_prices
    FOR SELECT USING (true);

CREATE POLICY "Allow insert product_category_prices" ON product_category_prices
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update product_category_prices" ON product_category_prices
    FOR UPDATE USING (true);

CREATE POLICY "Allow delete product_category_prices" ON product_category_prices
    FOR DELETE USING (true);

-- Trigger pour mise à jour automatique de updated_at
CREATE OR REPLACE FUNCTION update_product_category_prices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_product_category_prices_updated_at
    BEFORE UPDATE ON product_category_prices
    FOR EACH ROW
    EXECUTE FUNCTION update_product_category_prices_updated_at();

-- Fonction pour obtenir le prix d'un produit pour un client donné
-- Prend en compte: prix spécifique catégorie > prix wholesale > réduction % > prix retail
CREATE OR REPLACE FUNCTION get_customer_product_price(
    p_product_id UUID,
    p_customer_id UUID DEFAULT NULL
)
RETURNS NUMERIC AS $$
DECLARE
    v_customer_category_id UUID;
    v_price_modifier_type TEXT;
    v_discount_percentage NUMERIC;
    v_retail_price NUMERIC;
    v_wholesale_price NUMERIC;
    v_category_price NUMERIC;
    v_final_price NUMERIC;
BEGIN
    -- Récupérer le prix retail du produit
    SELECT retail_price, wholesale_price INTO v_retail_price, v_wholesale_price
    FROM products WHERE id = p_product_id;

    IF v_retail_price IS NULL THEN
        RETURN 0;
    END IF;

    -- Si pas de client, retourner le prix retail
    IF p_customer_id IS NULL THEN
        RETURN v_retail_price;
    END IF;

    -- Récupérer les infos de la catégorie client
    SELECT
        c.category_id,
        cc.price_modifier_type,
        cc.discount_percentage
    INTO
        v_customer_category_id,
        v_price_modifier_type,
        v_discount_percentage
    FROM customers c
    LEFT JOIN customer_categories cc ON cc.id = c.category_id
    WHERE c.id = p_customer_id;

    -- Si pas de catégorie, retourner le prix retail
    IF v_customer_category_id IS NULL OR v_price_modifier_type IS NULL THEN
        RETURN v_retail_price;
    END IF;

    -- Vérifier s'il y a un prix spécifique pour cette catégorie
    SELECT price INTO v_category_price
    FROM product_category_prices
    WHERE product_id = p_product_id
      AND customer_category_id = v_customer_category_id
      AND is_active = true;

    -- Si prix spécifique existe, l'utiliser
    IF v_category_price IS NOT NULL THEN
        RETURN v_category_price;
    END IF;

    -- Sinon, appliquer la logique de la catégorie
    CASE v_price_modifier_type
        WHEN 'wholesale' THEN
            -- Utiliser le prix wholesale s'il existe, sinon retail
            v_final_price := COALESCE(v_wholesale_price, v_retail_price);
        WHEN 'discount_percentage' THEN
            -- Appliquer la réduction sur le prix retail
            v_final_price := v_retail_price * (1 - COALESCE(v_discount_percentage, 0) / 100);
        WHEN 'custom' THEN
            -- Pour custom, chercher le prix spécifique (déjà fait), sinon retail
            v_final_price := v_retail_price;
        ELSE
            -- retail ou autre: prix retail
            v_final_price := v_retail_price;
    END CASE;

    RETURN v_final_price;
END;
$$ LANGUAGE plpgsql;

-- Commentaires
COMMENT ON TABLE product_category_prices IS 'Prix personnalisés des produits par catégorie client';
COMMENT ON COLUMN product_category_prices.price IS 'Prix spécifique pour cette combinaison produit/catégorie';
COMMENT ON FUNCTION get_customer_product_price IS 'Calcule le prix final d''un produit pour un client donné selon sa catégorie';
