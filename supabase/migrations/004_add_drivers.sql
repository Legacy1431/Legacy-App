-- Run this if you already deployed and have real data. Adds a place to
-- track each driver's CDL and medical card expiration per client.
alter table clients add column if not exists drivers jsonb not null default '[]';
