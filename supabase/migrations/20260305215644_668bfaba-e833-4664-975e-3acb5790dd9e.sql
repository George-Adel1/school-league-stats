
-- Create announcements table
CREATE TABLE public.announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT,
  image_url TEXT,
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read published announcements
CREATE POLICY "Anyone can read published announcements"
  ON public.announcements FOR SELECT
  USING (published = true);

-- Admins can do everything
CREATE POLICY "Admins can manage announcements"
  ON public.announcements FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create storage bucket for announcement images
INSERT INTO storage.buckets (id, name, public) VALUES ('announcements', 'announcements', true);

-- Allow authenticated users to read announcement images
CREATE POLICY "Public read announcement images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'announcements');

-- Admins can upload announcement images
CREATE POLICY "Admins can upload announcement images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'announcements' AND public.has_role(auth.uid(), 'admin'));

-- Admins can delete announcement images
CREATE POLICY "Admins can delete announcement images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'announcements' AND public.has_role(auth.uid(), 'admin'));
