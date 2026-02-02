-- =====================================================
-- THE BREAKERY POS & MINI-ERP - CONSOLIDATED SCHEMA
-- Migration 010: LAN, Sync & Display Module
-- Tables: lan_nodes, sync_*, display_promotions
-- =====================================================

-- =====================================================
-- TABLE: lan_nodes
-- =====================================================
CREATE TABLE lan_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id VARCHAR(100) UNIQUE NOT NULL,
    device_name VARCHAR(200),
    device_type VARCHAR(50) NOT NULL,
    ip_address INET,
    port INTEGER DEFAULT 3001,
    status VARCHAR(20) DEFAULT 'offline',
    is_hub BOOLEAN DEFAULT FALSE,
    capabilities JSONB DEFAULT '[]',
    last_heartbeat TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lan_nodes_device ON lan_nodes(device_id);
CREATE INDEX idx_lan_nodes_type ON lan_nodes(device_type);
CREATE INDEX idx_lan_nodes_status ON lan_nodes(status);
CREATE INDEX idx_lan_nodes_hub ON lan_nodes(is_hub) WHERE is_hub = TRUE;

-- =====================================================
-- TABLE: lan_messages (for offline communication)
-- =====================================================
CREATE TABLE lan_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_device_id VARCHAR(100) NOT NULL,
    to_device_id VARCHAR(100),
    message_type VARCHAR(50) NOT NULL,
    payload JSONB NOT NULL,
    is_broadcast BOOLEAN DEFAULT FALSE,
    acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lan_messages_from ON lan_messages(from_device_id);
CREATE INDEX idx_lan_messages_to ON lan_messages(to_device_id);
CREATE INDEX idx_lan_messages_type ON lan_messages(message_type);
CREATE INDEX idx_lan_messages_pending ON lan_messages(acknowledged) WHERE acknowledged = FALSE;

-- =====================================================
-- TABLE: sync_devices
-- =====================================================
CREATE TABLE sync_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id VARCHAR(100) UNIQUE NOT NULL,
    device_name VARCHAR(200),
    device_type sync_device_type NOT NULL,
    last_sync_at TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'offline',
    sync_version INTEGER DEFAULT 0,
    capabilities JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sync_devices_device ON sync_devices(device_id);
CREATE INDEX idx_sync_devices_type ON sync_devices(device_type);
CREATE INDEX idx_sync_devices_status ON sync_devices(status);

-- =====================================================
-- TABLE: sync_queue
-- =====================================================
CREATE TABLE sync_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    operation VARCHAR(20) NOT NULL,
    payload JSONB,
    priority INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending',
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 5,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);

CREATE INDEX idx_sync_queue_device ON sync_queue(device_id);
CREATE INDEX idx_sync_queue_status ON sync_queue(status);
CREATE INDEX idx_sync_queue_priority ON sync_queue(priority DESC, created_at ASC);
CREATE INDEX idx_sync_queue_pending ON sync_queue(status, device_id) WHERE status = 'pending';

-- =====================================================
-- TABLE: sync_conflicts
-- =====================================================
CREATE TABLE sync_conflicts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    local_data JSONB,
    remote_data JSONB,
    resolution VARCHAR(20),
    resolved_by UUID REFERENCES user_profiles(id),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sync_conflicts_entity ON sync_conflicts(entity_type, entity_id);
CREATE INDEX idx_sync_conflicts_unresolved ON sync_conflicts(resolution) WHERE resolution IS NULL;

-- =====================================================
-- TABLE: display_promotions
-- =====================================================
CREATE TABLE display_promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    subtitle TEXT,
    description TEXT,
    image_url TEXT,
    background_color VARCHAR(20),
    text_color VARCHAR(20),
    start_date DATE,
    end_date DATE,
    start_time TIME,
    end_time TIME,
    days_of_week INTEGER[],
    priority INTEGER DEFAULT 0,
    display_duration INTEGER DEFAULT 10,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_display_promotions_active ON display_promotions(is_active);
CREATE INDEX idx_display_promotions_dates ON display_promotions(start_date, end_date);
CREATE INDEX idx_display_promotions_priority ON display_promotions(priority DESC);

-- =====================================================
-- TABLE: display_content
-- =====================================================
CREATE TABLE display_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_type VARCHAR(30) NOT NULL,
    title VARCHAR(200),
    content JSONB NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_display_content_type ON display_content(content_type);
CREATE INDEX idx_display_content_active ON display_content(is_active);

-- =====================================================
-- TABLE: kds_stations
-- =====================================================
CREATE TABLE kds_stations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    station_type VARCHAR(20) NOT NULL,
    device_id VARCHAR(100),
    categories UUID[],
    is_active BOOLEAN DEFAULT TRUE,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_kds_stations_type ON kds_stations(station_type);
CREATE INDEX idx_kds_stations_device ON kds_stations(device_id);

-- =====================================================
-- TABLE: kds_order_queue
-- =====================================================
CREATE TABLE kds_order_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    station_type VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    priority INTEGER DEFAULT 0,
    bumped_at TIMESTAMPTZ,
    bumped_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_kds_queue_order ON kds_order_queue(order_id);
CREATE INDEX idx_kds_queue_station ON kds_order_queue(station_type);
CREATE INDEX idx_kds_queue_status ON kds_order_queue(status);
CREATE INDEX idx_kds_queue_pending ON kds_order_queue(station_type, status, created_at)
    WHERE status IN ('pending', 'preparing');
