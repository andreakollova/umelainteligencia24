-- umelainteligencia24 - Complete database setup
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard)

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

INSERT INTO categories (name, slug) VALUES
  ('Modely', 'modely'),
  ('Výskum', 'vyskum'),
  ('Nástroje', 'nastroje'),
  ('Biznis', 'biznis');

-- Articles
CREATE TABLE IF NOT EXISTS articles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text,
  content text,
  image_url text,
  category_id uuid REFERENCES categories(id),
  author text DEFAULT 'Redakcia',
  is_featured boolean DEFAULT false,
  is_published boolean DEFAULT true,
  views int DEFAULT 0,
  source_url text,
  source_name text,
  video_url text,
  original_author text,
  original_date timestamptz,
  ig_post_id text,
  published_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Subscribers
CREATE TABLE IF NOT EXISTS subscribers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email_hash text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- Projects
CREATE TABLE IF NOT EXISTS projects (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  category text,
  subcategory text,
  tags text[] DEFAULT '{}',
  stars int DEFAULT 0,
  license text,
  external_url text NOT NULL,
  image_url text,
  source_name text DEFAULT 'GitHub',
  is_published boolean DEFAULT true,
  is_new boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Daily views tracking
CREATE TABLE IF NOT EXISTS daily_views (
  date date PRIMARY KEY DEFAULT CURRENT_DATE,
  count int DEFAULT 0
);

-- Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_views ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read articles" ON articles FOR SELECT USING (true);
CREATE POLICY "Public read projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Public read daily_views" ON daily_views FOR SELECT USING (true);

-- Service role write policies
CREATE POLICY "Service write articles" ON articles FOR ALL USING (true);
CREATE POLICY "Service write subscribers" ON subscribers FOR ALL USING (true);
CREATE POLICY "Service write projects" ON projects FOR ALL USING (true);
CREATE POLICY "Service write daily_views" ON daily_views FOR ALL USING (true);
CREATE POLICY "Service write categories" ON categories FOR ALL USING (true);

-- Storage bucket for IG assets
INSERT INTO storage.buckets (id, name, public) VALUES ('ig-assets', 'ig-assets', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read ig-assets" ON storage.objects FOR SELECT USING (bucket_id = 'ig-assets');
CREATE POLICY "Service write ig-assets" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'ig-assets');
CREATE POLICY "Service update ig-assets" ON storage.objects FOR UPDATE USING (bucket_id = 'ig-assets');
