-- PostgreSQL Database Schema for Muslim Wedding Invitation
-- Run this in psql or your preferred database client (e.g. pgAdmin, Supabase, Neon)

CREATE TABLE IF NOT EXISTS rsvps (
  id SERIAL PRIMARY KEY,
  guest_name VARCHAR(255) NOT NULL,
  attendance VARCHAR(50) NOT NULL, -- 'attending' or 'declined'
  guest_count INTEGER NOT NULL DEFAULT 1,
  message TEXT,
  ip_address VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for quick sorting by submission date
CREATE INDEX IF NOT EXISTS idx_rsvps_created_at ON rsvps(created_at DESC);

-- Index for duplicate checks by guest name
CREATE INDEX IF NOT EXISTS idx_rsvps_guest_name ON rsvps(LOWER(guest_name));

-- Sample query to check responses
-- SELECT guest_name, attendance, guest_count, message, created_at FROM rsvps ORDER BY created_at DESC;
