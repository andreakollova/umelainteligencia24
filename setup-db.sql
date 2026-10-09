-- Run this in Supabase SQL Editor

-- Categories table
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Articles table
CREATE TABLE articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT,
  image_url TEXT,
  category_id UUID REFERENCES categories(id),
  author TEXT DEFAULT 'Redakcia',
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  views INTEGER DEFAULT 0,
  published_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read articles" ON articles FOR SELECT USING (is_published = true);
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);

-- Service role full access
CREATE POLICY "Service role full access articles" ON articles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access categories" ON categories FOR ALL USING (true) WITH CHECK (true);

-- Insert categories
INSERT INTO categories (name, slug) VALUES
  ('Roboty', 'roboty'),
  ('AI', 'ai'),
  ('Drony', 'drony'),
  ('Automatizacia', 'automatizacia'),
  ('Veda', 'veda'),
  ('Technologie', 'technologie');

-- Insert sample articles
INSERT INTO articles (title, slug, excerpt, image_url, category_id, author, is_featured, published_at) VALUES
  ('Boston Dynamics predstavil noveho humanoidneho robota Atlas 2.0', 'boston-dynamics-atlas-2', 'Spolocnost Boston Dynamics odhalila novu generaciu svojho humanoidneho robota Atlas, ktory je este obratnejsi a silnejsi nez jeho predchodca.', 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800', (SELECT id FROM categories WHERE slug = 'roboty'), 'Jan Novak', true, now() - interval '1 hour'),
  ('OpenAI spusta novy model o5 s revolucnym uvazovanim', 'openai-o5-model', 'Najnovsi model od OpenAI dokaze riesit komplexne vedecke problemy a programovat cele aplikacie samostatne.', 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800', (SELECT id FROM categories WHERE slug = 'ai'), 'Maria Kovacova', true, now() - interval '2 hours'),
  ('DJI Mavic 5 Pro: Najlepsi dron na trhu?', 'dji-mavic-5-pro', 'Recenzia noveho dronu od DJI, ktory prinasa 8K video a 60 minutovy cas letu.', 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800', (SELECT id FROM categories WHERE slug = 'drony'), 'Peter Horvath', false, now() - interval '3 hours'),
  ('Tesla Optimus zacina pracovat v tovarniach', 'tesla-optimus-tovarne', 'Humanoidny robot od Tesly uz pracuje v troch tovarniach a zvlada zakladne montazne ulohy.', 'https://images.unsplash.com/photo-1563207153-f403bf289096?w=800', (SELECT id FROM categories WHERE slug = 'roboty'), 'Redakcia', false, now() - interval '4 hours'),
  ('Slovensky startup vyvija robota pre domacnosti', 'slovensky-robot-domacnost', 'Bratislavsky startup RoboHome pracuje na robotovi, ktory dokaze upratovat, varit a starat sa o domacich mazlickov.', 'https://images.unsplash.com/photo-1535378620166-273708d44e4c?w=800', (SELECT id FROM categories WHERE slug = 'roboty'), 'Jan Novak', true, now() - interval '5 hours'),
  ('Umelá inteligencia diagnostikuje choroby presnejsie nez lekari', 'ai-diagnostika-chorob', 'Nova studia ukazuje, ze AI systemy dokazu diagnostikovat 15 typov rakoviny s 98% presnostou.', 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800', (SELECT id FROM categories WHERE slug = 'ai'), 'Maria Kovacova', false, now() - interval '6 hours'),
  ('Autonomne kamiony uz jazdia po europskych dialniach', 'autonomne-kamiony-europa', 'Prvych 50 autonomnych kamionov zacalo pravidelne jazdit na trase Rotterdam - Mnichov.', 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800', (SELECT id FROM categories WHERE slug = 'automatizacia'), 'Peter Horvath', false, now() - interval '7 hours'),
  ('CERN objavi novu casticu pomocou kvantoveho pocitaca', 'cern-nova-castica', 'Vedci v CERNe vyuzili kvantovy pocitac na simulaciu zrazok castic a objavili doteraz neznamu subatomarnu casticu.', 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800', (SELECT id FROM categories WHERE slug = 'veda'), 'Redakcia', false, now() - interval '8 hours'),
  ('Xiaomi predstavilo robota psa CyberDog 3', 'xiaomi-cyberdog-3', 'Novy roboticky pes od Xiaomi ma vylepsenu navigaciu, rozpoznavanie tvari a dokaze nosit nakupy.', 'https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=800', (SELECT id FROM categories WHERE slug = 'roboty'), 'Jan Novak', false, now() - interval '9 hours'),
  ('Google DeepMind vyvinul AI ktora navrhuje nove lieky', 'deepmind-ai-lieky', 'AlphaFold 4 dokaze navrhovt molekuly liekov 100x rychlejsie nez tradicne metody.', 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800', (SELECT id FROM categories WHERE slug = 'ai'), 'Maria Kovacova', false, now() - interval '10 hours'),
  ('Roboty v skolach: Buducnost vzdelavania na Slovensku', 'roboty-skoly-slovensko', 'Ministerstvo skolstva planuje zaviest robotiku ako povinny predmet na zakladnych skolach od roku 2028.', 'https://images.unsplash.com/photo-1531746790095-e5e1db60b21f?w=800', (SELECT id FROM categories WHERE slug = 'technologie'), 'Redakcia', false, now() - interval '11 hours'),
  ('NASA posiela robotov na Mars v novej misii', 'nasa-roboty-mars', 'Dva nove rovery a dron budu skumat povrch Marsu a hladat stopy zivota.', 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=800', (SELECT id FROM categories WHERE slug = 'veda'), 'Peter Horvath', false, now() - interval '12 hours');

-- Create index for faster queries
CREATE INDEX idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX idx_articles_category ON articles(category_id);
CREATE INDEX idx_articles_featured ON articles(is_featured) WHERE is_featured = true;
