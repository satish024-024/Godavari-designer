ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}'::TEXT[] NOT NULL;

UPDATE public.products
SET
  tags = ARRAY[
    'blouse',
    'allover',
    'long sleeves',
    'knot',
    'flower',
    'hand lines line',
    'full hand',
    'hand top',
    'full sleeve',
    'JC 4577'
  ]::TEXT[],
  rpm = 350,
  estimated_time = 796,
  back_stitch_count = 62600,
  hand_stitch_count = 108000,
  total_stitch_count = 170600,
  updated_at = TIMEZONE('utc'::text, NOW())
WHERE code = 'JC4577';
