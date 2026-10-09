-- V2: Extended schema for scraper

-- Add new columns to articles
ALTER TABLE articles ADD COLUMN IF NOT EXISTS source_url TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS source_name TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS original_author TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS original_date TEXT;

-- Delete old sample articles
DELETE FROM articles;

-- Delete old categories and insert new ones
DELETE FROM categories;

INSERT INTO categories (name, slug) VALUES
  ('Technologie', 'technologie'),
  ('Vyvoj', 'vyvoj'),
  ('Roboty', 'roboty');
