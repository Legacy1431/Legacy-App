-- Run this if you already deployed and have real data. Adds expiration-date
-- tracking to filings and nothing else touches existing data.
alter table recur_status add column if not exists expires_on date;
