CREATE TABLE totals (id integer PRIMARY KEY CHECK (id=1), yes bigint NOT NULL DEFAULT 0, no bigint NOT NULL DEFAULT 0);
INSERT INTO totals(id) VALUES(1) ON CONFLICT DO NOTHING;
-- Random browser token hashes only: no names, emails, IP addresses, or card data.
CREATE TABLE browser_limits (token text PRIMARY KEY, blocked_until timestamptz NOT NULL);
CREATE TABLE payments (session_id text PRIMARY KEY, browser_token text NOT NULL, counted boolean NOT NULL DEFAULT false);
-- Purge expired cooldown rows periodically; payment references remain for deduplication.
