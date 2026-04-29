CREATE TABLE IF NOT EXISTS speed_readings (
  id BIGSERIAL PRIMARY KEY,
  speed_kmph NUMERIC(6,2) NOT NULL CHECK (speed_kmph >= 0 AND speed_kmph <= 180),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS speed_readings_recorded_at_idx
  ON speed_readings (recorded_at);

