-- =============================================
-- PORTFOLIO SITE — Supabase Migration
-- Run this in the Supabase SQL Editor to set up all tables.
-- =============================================

-- Projects
CREATE TABLE IF NOT EXISTS projects (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL DEFAULT '',
  img             TEXT NOT NULL DEFAULT '',
  tags            TEXT NOT NULL DEFAULT '',
  description     TEXT NOT NULL DEFAULT '',
  role            TEXT NOT NULL DEFAULT '',
  year            TEXT NOT NULL DEFAULT '',
  stack           TEXT NOT NULL DEFAULT '',
  live            TEXT NOT NULL DEFAULT '#',
  overlay_tag     TEXT NOT NULL DEFAULT '',
  overlay_name    TEXT NOT NULL DEFAULT '',
  gallery_images  TEXT NOT NULL DEFAULT '[]',
  featured        BOOLEAN NOT NULL DEFAULT false,
  github_url      TEXT NOT NULL DEFAULT '',
  sort_order      INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Services
CREATE TABLE IF NOT EXISTS services (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  icon        TEXT NOT NULL DEFAULT '',
  name        TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Messages
CREATE TABLE IF NOT EXISTS messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL DEFAULT '',
  email       TEXT NOT NULL DEFAULT '',
  subject     TEXT NOT NULL DEFAULT '',
  message     TEXT NOT NULL DEFAULT '',
  date        TIMESTAMPTZ NOT NULL DEFAULT now(),
  status      TEXT NOT NULL DEFAULT 'unread' CHECK (status IN ('unread','read','replied','archived')),
  is_read     BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Site Settings (key-value for topbar, home, about, section headers)
CREATE TABLE IF NOT EXISTS site_settings (
  key         TEXT PRIMARY KEY,
  value       TEXT NOT NULL DEFAULT '',
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Social Links
CREATE TABLE IF NOT EXISTS social_links (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  icon        TEXT NOT NULL DEFAULT '',
  url         TEXT NOT NULL DEFAULT '#',
  title       TEXT NOT NULL DEFAULT '',
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;

-- Statistics (cards + bars in one table)
CREATE TABLE IF NOT EXISTS statistics (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stat_type   TEXT NOT NULL DEFAULT 'card' CHECK (stat_type IN ('card','bar')),
  name        TEXT NOT NULL DEFAULT '',
  number_val  INT,
  pct         INT,
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE statistics ENABLE ROW LEVEL SECURITY;

-- Media Files (tracks every upload)
CREATE TABLE IF NOT EXISTS media_files (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename     TEXT NOT NULL DEFAULT '',
  storage_path TEXT NOT NULL DEFAULT '',
  public_url   TEXT NOT NULL DEFAULT '',
  mime_type    TEXT NOT NULL DEFAULT '',
  size         BIGINT NOT NULL DEFAULT 0,
  width        INT,
  height       INT,
  duration     INT,
  folder       TEXT NOT NULL DEFAULT '',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;

-- =============================================
-- SEED DATA — only run after tables are created
-- =============================================

-- Site Settings seed
INSERT INTO site_settings (key, value) VALUES
  ('topbar_logo', 'AR.'),
  ('topbar_status', 'Available for work'),
  ('home_pre', 'MULTIMEDIA DESIGNER'),
  ('home_name', 'Omar Khalil'),
  ('home_role', 'I craft <span>Visuals</span> that live at the intersection of <span>design & code</span>'),
  ('about_image', '/img/me.jpg'),
  ('about_experience', '9+ Years'),
  ('about_label', 'Who I Am'),
  ('about_title', 'Creative <span class="accent">Mind,</span><br>Precise Visuals.'),
  ('about_description', 'Hey! I''m Omar — Creative Multi Media Designer focused on graphic design, video editing, multimedia production, AI visuals, and 3D workflows. I turn ideas into polished visual content for campaigns, brands, and digital platforms with strong attention to detail and delivery quality.

When I''m not pushing commits, you''ll find me exploring generative art, contributing to open source, or drinking too much coffee.'),
  ('about_skills', 'Photoshop,Illustrator,Premiere pro,After effects,InDesign,Adobe XD,Figma,Blender,Unreal Engine,HTML / CSS,Vibe coding,Ai powered designs,Ai powered videos'),
  ('stats_label', 'Numbers'),
  ('stats_title', 'By the Stats'),
  ('services_label', 'What I Do'),
  ('services_title', 'Capabilities'),
  ('contact_label', 'Let''s Talk'),
  ('contact_title', 'Start a Project'),
  ('contact_subtitle', 'Have an idea? A problem to solve? Or just want to say hi? My inbox is always open — let''s make something great together.'),
  ('contact_email', 'OMAR.SALAH@ICLOUD.COM')
ON CONFLICT (key) DO NOTHING;

-- Projects seed
INSERT INTO projects (title, img, tags, description, role, year, stack, live, overlay_tag, overlay_name, sort_order) VALUES
  ('Neon Dashboard', '/img/portfolio/work1.jpg', 'UI/UX,Branding,Figma', 'A futuristic analytics dashboard built for a SaaS startup. Designed end-to-end from wireframes to a production-ready React component library. Features real-time data visualization, dark/light mode toggle, and a fully responsive layout with 99+ Lighthouse score.', 'Lead Designer & Developer', '2025', 'React · Figma · TailwindCSS · Recharts', '#', 'UI/UX · Branding', 'Neon Dashboard', 0),
  ('SaaS Platform', '/img/portfolio/work2.jpg', 'Web App,React,Node.js', 'End-to-end SaaS platform for B2B project management. Includes team workspaces, role-based access control, Stripe billing integration, and a real-time notification system. Scaled to 10,000+ daily active users within 3 months of launch.', 'Full Stack Developer', '2024', 'React · Node.js · PostgreSQL · Stripe', '#', 'Web App · React', 'SaaS Platform', 1),
  ('Immersive World', '/img/portfolio/work3.jpg', '3D,WebGL,Three.js', 'An interactive 3D product showcase built with Three.js and WebGL. Users can explore and configure products in a photorealistic 3D environment directly in the browser — no plugins required. Featured on Awwwards Site of the Day.', 'Creative Developer', '2024', 'Three.js · WebGL · GSAP · Blender', '#', '3D · WebGL', 'Immersive World', 2),
  ('Luxury Store', '/img/portfolio/work4.jpg', 'E-Commerce,Shopify,UX', 'A bespoke e-commerce experience for a high-end fashion brand. Custom Shopify theme with fluid animations, 3D product viewer, and a seamless checkout flow. Conversion rate improved by 240% post-launch.', 'UX Designer & Shopify Developer', '2024', 'Shopify · Liquid · GSAP · Three.js', '#', 'E-Commerce', 'Luxury Store', 3),
  ('Fintech App', '/img/portfolio/work5.jpg', 'Mobile,Flutter,iOS', 'A cross-platform fintech app for personal finance tracking and crypto portfolio management. Biometric authentication, live market data, push notifications, and seamless bank linking via Plaid API.', 'Mobile Developer & UI Designer', '2023', 'Flutter · Dart · Firebase · Plaid API', '#', 'Mobile · Flutter', 'Fintech App', 4),
  ('AI Generator', '/img/portfolio/work6.jpg', 'AI,Python,OpenAI', 'A generative AI platform that creates custom marketing assets — ad copy, images, and video scripts — from a single brand brief. Powered by GPT-4 and Stable Diffusion with a custom fine-tuned model pipeline.', 'AI Engineer & Product Designer', '2023', 'Python · OpenAI API · React · FastAPI', '#', 'AI · Python', 'AI Generator', 5)
ON CONFLICT DO NOTHING;

-- Services seed
INSERT INTO services (icon, name, description, sort_order) VALUES
  ('🎨', 'Brand Identity', 'Building memorable brands with strategy and premium visual systems.', 0),
  ('⚡', 'Motion & Film', 'Commercial editing, motion graphics and storytelling for modern brands.', 1),
  ('🌐', 'AI Content Creation', 'Generating cinematic visuals and next-generation creative assets using AI.', 2),
  ('📱', '3D & CGI', 'Luxury product visualization, automotive CGI and realistic rendering.', 3),
  ('🤖', 'Digital Experiences', 'Interactive websites and immersive digital products.', 4),
  ('🚀', 'Creative Campaigns', 'High-end advertising concepts, social campaigns and marketing visuals designed to drive engagement.', 5)
ON CONFLICT DO NOTHING;

-- Statistics seed
INSERT INTO statistics (stat_type, name, number_val, pct, sort_order) VALUES
  ('card', 'Projects Done', 87, NULL, 0),
  ('card', 'Happy Clients', 54, NULL, 1),
  ('card', 'Years Active', 5, NULL, 2),
  ('bar', 'Creative Direction', NULL, 95, 3),
  ('bar', 'Brand Identity', NULL, 88, 4),
  ('bar', 'AI Production', NULL, 90, 5),
  ('bar', '3D / CGI', NULL, 85, 6)
ON CONFLICT DO NOTHING;

-- Social Links seed
INSERT INTO social_links (icon, url, title, sort_order) VALUES
  ('bi-github', '#', 'GitHub', 0),
  ('bi-linkedin', '#', 'LinkedIn', 1),
  ('bi-twitter-x', '#', 'Twitter/X', 2),
  ('bi-dribbble', '#', 'Dribbble', 3),
  ('bi-behance', '#', 'Behance', 4)
ON CONFLICT DO NOTHING;

-- Messages seed
INSERT INTO messages (name, email, subject, message, date, status, is_read) VALUES
  ('Sarah Chen', 'sarah.chen@techcorp.io', 'Project Inquiry — Brand Redesign', 'Hi Omar, I came across your portfolio and was really impressed by your brand identity work. We''re a tech startup looking for a complete brand overhaul — logo, visual system, and marketing collateral. Would love to discuss a potential collaboration. Our budget is flexible for the right creative partner.', now() - interval '2 hours', 'unread', false),
  ('Marcus Webb', 'marcus@webbdesign.co', 'Collaboration on AI Campaign', 'Hey! I''m working on a large-scale advertising campaign for a AI platform and need someone who can create stunning visuals with AI tools. Your AI-powered design work caught my eye. Are you available for a freelance gig starting next month? We need about 50 assets across social media and web.', now() - interval '5 hours', 'unread', false),
  ('Lina Al-Farsi', 'lina@luxurybrand.ae', 'E-Commerce Project for Fashion Line', 'Salam Omar, I run a luxury fashion brand based in Dubai and we need a new e-commerce website. I loved your Luxury Store project — the animations and 3D product viewer are exactly what we''re looking for. Can you share your availability and pricing? We''re targeting a Q2 launch.', now() - interval '26 hours', 'read', true),
  ('Jake Morrison', 'jake.m@gamestudio.com', '3D Environment Artist Needed', 'Hi there! We''re an indie game studio looking for a 3D artist to create immersive environments for our upcoming title. Your WebGL and Three.js work is incredible. Would you be interested in creating some concept environments? Paid project, remote work.', now() - interval '52 hours', 'replied', true),
  ('Emma Rodriguez', 'emma.r@greenleaf.org', 'Non-Profit Campaign Design', 'Hello Omar, I''m the marketing director at GreenLeaf Foundation. We''re launching a sustainability awareness campaign and need compelling visual content — video edits, social media graphics, and a mini-documentary style ad. Your multimedia skills seem perfect for this. What are your rates?', now() - interval '78 hours', 'replied', true),
  ('David Park', 'dpark@fintechplus.io', 'Mobile App UI/UX Review', 'Omar, we have a fintech app that needs a UI/UX audit and redesign. The current version has poor retention rates and we believe better design could fix that. I saw your Fintech App project and think you understand the space well. Can we set up a call this week?', now() - interval '120 hours', 'archived', true),
  ('Aisha Nkomo', 'aisha@creativehub.za', 'Motion Graphics for Product Launch', 'Hi! I need someone to create a 30-second product reveal video with motion graphics for our new headphone line. The style I''m going for is sleek, futuristic, and cinematic. Your motion & film work looks amazing. Quick turnaround needed — about 2 weeks. Interested?', now() - interval '168 hours', 'archived', true),
  ('Tommaso Bianchi', 'tom@archviz.it', 'Architectural Visualization Project', 'Buongiorno Omar, I am an architect based in Milan. I need photorealistic 3D renderings for a luxury villa project — interior and exterior. Your CGI work is stunning. Do you take architectural visualization commissions? We need 12 renders total. Timeline is flexible.', now() - interval '240 hours', 'read', true),
  ('Priya Sharma', 'priya@startuplab.in', 'AI Video Content for SaaS', 'Hey Omar! We''re building a SaaS product and need AI-generated video content for our landing page and onboarding flow. Your AI content creation capabilities look exactly right. Can you do a short test project before we commit to the full scope?', now() - interval '360 hours', 'unread', false)
ON CONFLICT DO NOTHING;
