-- =====================================================
-- THE BREAKERY POS & MINI-ERP
-- Migration: Internal Transfers Section Support
-- Description: Adds section references to internal_transfers
--              for section-based stock management
-- =====================================================

-- Add section references to internal_transfers
-- These are optional to maintain backwards compatibility with existing transfers
ALTER TABLE internal_transfers
ADD COLUMN IF NOT EXISTS from_section_id UUID REFERENCES sections(id),
ADD COLUMN IF NOT EXISTS to_section_id UUID REFERENCES sections(id);

-- Add column for responsible person name (not just user ID)
ALTER TABLE internal_transfers
ADD COLUMN IF NOT EXISTS responsible_person VARCHAR(100);

-- Add total_items and total_value for quick stats
ALTER TABLE internal_transfers
ADD COLUMN IF NOT EXISTS total_items INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_value DECIMAL(12,2) DEFAULT 0;

-- Add approved_at timestamp
ALTER TABLE internal_transfers
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

-- Create indexes for section-based queries
CREATE INDEX IF NOT EXISTS idx_internal_transfers_from_section ON internal_transfers(from_section_id);
CREATE INDEX IF NOT EXISTS idx_internal_transfers_to_section ON internal_transfers(to_section_id);

COMMENT ON COLUMN internal_transfers.from_section_id IS 'Source section for the transfer (new section-based model)';
COMMENT ON COLUMN internal_transfers.to_section_id IS 'Destination section for the transfer (new section-based model)';
COMMENT ON COLUMN internal_transfers.responsible_person IS 'Name of person responsible for the transfer';

-- =====================================================
-- Create view for section-based transfers
-- =====================================================

CREATE OR REPLACE VIEW view_section_transfers AS
SELECT
    it.id,
    it.transfer_number,
    it.from_section_id,
    fs.name AS from_section_name,
    fs.code AS from_section_code,
    fs.section_type AS from_section_type,
    fs.icon AS from_section_icon,
    it.to_section_id,
    ts.name AS to_section_name,
    ts.code AS to_section_code,
    ts.section_type AS to_section_type,
    ts.icon AS to_section_icon,
    it.status,
    it.transfer_date,
    it.expected_date,
    it.received_date,
    it.notes,
    it.responsible_person,
    it.total_items,
    it.total_value,
    it.created_by,
    it.approved_by,
    it.approved_at,
    it.received_by,
    it.created_at,
    it.updated_at
FROM internal_transfers it
LEFT JOIN sections fs ON fs.id = it.from_section_id
LEFT JOIN sections ts ON ts.id = it.to_section_id
WHERE it.from_section_id IS NOT NULL OR it.to_section_id IS NOT NULL;

COMMENT ON VIEW view_section_transfers IS 'Internal transfers using the new section-based model';

-- =====================================================
-- Function to update transfer totals
-- =====================================================

CREATE OR REPLACE FUNCTION update_transfer_totals()
RETURNS TRIGGER AS $$
BEGIN
    -- Update transfer totals when items are modified
    UPDATE internal_transfers
    SET
        total_items = (
            SELECT COUNT(*) FROM transfer_items WHERE transfer_id = COALESCE(NEW.transfer_id, OLD.transfer_id)
        ),
        total_value = (
            SELECT COALESCE(SUM(ti.quantity_requested * COALESCE(p.cost_price, 0)), 0)
            FROM transfer_items ti
            JOIN products p ON p.id = ti.product_id
            WHERE ti.transfer_id = COALESCE(NEW.transfer_id, OLD.transfer_id)
        ),
        updated_at = NOW()
    WHERE id = COALESCE(NEW.transfer_id, OLD.transfer_id);

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS trg_update_transfer_totals ON transfer_items;

CREATE TRIGGER trg_update_transfer_totals
AFTER INSERT OR UPDATE OR DELETE ON transfer_items
FOR EACH ROW EXECUTE FUNCTION update_transfer_totals();

COMMENT ON FUNCTION update_transfer_totals IS 'Automatically updates internal_transfers totals when items change';
