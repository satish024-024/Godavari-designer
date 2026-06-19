-- Seed default testimonials
INSERT INTO public.testimonials (id, name, role, quote, rating, image, display_order)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Neha Mehta', 'Designer, Delhi', 'Godavari transformed our ideas into exquisite embroidery that elevates our entire collection.', 5.0, NULL, 1),
  ('22222222-2222-2222-2222-222222222222', 'House of Anaya', 'Fashion House', 'The sampling quality made approvals effortless.', 5.0, 'media-client-1', 2),
  ('33333333-3333-3333-3333-333333333333', 'Label Neha', 'Designer Label', 'Digitizing felt exact, refined and ready for production.', 5.0, 'media-client-2', 3),
  ('44444444-4444-4444-4444-444444444444', 'Saaz Couture', 'Couture Studio', 'Our bridal pieces now carry a richer finish.', 5.0, 'media-client-3', 4),
  ('55555555-5555-5555-5555-555555555555', 'Ivy & Oak Designs', 'Boutique', 'A calm, premium experience from quote to delivery.', 5.0, 'media-client-4', 5),
  ('66666666-6666-6666-6666-666666666666', 'Meera Bridals', 'Bridal Atelier', 'Every motif arrived production-ready.', 5.0, 'media-client-5', 6)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  quote = EXCLUDED.quote,
  rating = EXCLUDED.rating,
  image = EXCLUDED.image,
  display_order = EXCLUDED.display_order;

-- Seed default FAQs
INSERT INTO public.faqs (id, question, answer, category, display_order)
VALUES 
  ('f1111111-1111-1111-1111-111111111111', 'What formats do the machine-ready files come in?', 'We support DST, EXP, PES, JEF, and XXX formats. You can download all or any format after purchasing.', 'Formats', 1),
  ('f2222222-2222-2222-2222-222222222222', 'What is your turnaround time for custom digitizing?', 'Custom digitizing designs are reviewed, quoted, and sampled within 24-48 hours.', 'Digitizing', 2),
  ('f3333333-3333-3333-3333-333333333333', 'Do you supply physical samples of designs?', 'No, we provide high-resolution digital stitch-out rendering files and video previews. Once approved, the digital files are ready for production on your machine.', 'Sampling', 3),
  ('f4444444-4444-4444-4444-444444444444', 'How do I download my purchases?', 'Once payment is verified, you can download files directly from your order tracking screen or user profile area.', 'Orders', 4)
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  answer = EXCLUDED.answer,
  category = EXCLUDED.category,
  display_order = EXCLUDED.display_order;
