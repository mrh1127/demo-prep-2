/*
  # Seed Parking Lot Data

  ## Overview
  Seeds initial parking lot data for the theme park including:
  - 4 main parking lots (Magic, Wonder, Adventure, Discovery)
  - Multiple sections per lot with themed names
  - Pricing tiers

  ## Data Added
  - 4 parking lots with GPS coordinates
  - 16 parking sections across all lots
  - Pricing tiers for standard, premium, and preferred parking
*/

-- Insert parking lots
INSERT INTO parking_lots (id, name, code, description, location_lat, location_lng, total_capacity, available_spots, amenities, image_url) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Magic Kingdom Parking', 'MAGIC', 'Main parking structure near Magic Kingdom entrance', 28.4177, -81.5812, 2500, 1847, '["tram_service", "ev_charging", "covered_parking", "restrooms"]', 'https://images.pexels.com/photos/1004409/pexels-photo-1004409.jpeg'),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Wonder Parking Plaza', 'WONDER', 'Surface lot with easy access to park entrance', 28.4165, -81.5798, 1800, 1243, '["tram_service", "restrooms", "first_aid"]', 'https://images.pexels.com/photos/1004416/pexels-photo-1004416.jpeg'),
  ('c3d4e5f6-a7b8-9012-cdef-123456789012', 'Adventure Parking Deck', 'ADVENTURE', 'Multi-level parking structure with covered spots', 28.4189, -81.5825, 3000, 2156, '["ev_charging", "covered_parking", "restrooms", "elevator"]', 'https://images.pexels.com/photos/63294/autos-technology-vw-multi-storey-car-park-63294.jpeg'),
  ('d4e5f6a7-b8c9-0123-defa-234567890123', 'Discovery Lot', 'DISCOVERY', 'Economy parking with shuttle service', 28.4155, -81.5840, 2000, 1589, '["shuttle_service", "restrooms"]', 'https://images.pexels.com/photos/1004409/pexels-photo-1004409.jpeg')
ON CONFLICT DO NOTHING;

-- Insert parking sections for Magic Kingdom Parking
INSERT INTO parking_sections (id, parking_lot_id, name, code, level, section_type, capacity, available_spots, color_code, icon_name, is_accessible) VALUES
  ('11111111-1111-1111-1111-111111111111', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Aladdin', 'AL', 1, 'standard', 400, 287, '#FF6B6B', 'lamp', false),
  ('22222222-2222-2222-2222-222222222222', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Belle', 'BE', 1, 'standard', 400, 312, '#4ECDC4', 'rose', false),
  ('33333333-3333-3333-3333-333333333333', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Cinderella', 'CI', 2, 'premium', 350, 198, '#45B7D1', 'shoe', false),
  ('44444444-4444-4444-4444-444444444444', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Dopey', 'DO', 2, 'accessible', 150, 89, '#96CEB4', 'dwarf', true)
ON CONFLICT DO NOTHING;

-- Insert parking sections for Wonder Parking Plaza
INSERT INTO parking_sections (id, parking_lot_id, name, code, level, section_type, capacity, available_spots, color_code, icon_name, is_accessible) VALUES
  ('55555555-5555-5555-5555-555555555555', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Elsa', 'EL', 0, 'standard', 500, 367, '#A8E6CF', 'snowflake', false),
  ('66666666-6666-6666-6666-666666666666', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Flynn', 'FL', 0, 'standard', 500, 412, '#FFD93D', 'sun', false),
  ('77777777-7777-7777-7777-777777777777', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Goofy', 'GO', 0, 'accessible', 200, 134, '#6C5CE7', 'hat', true),
  ('88888888-8888-8888-8888-888888888888', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Hercules', 'HE', 0, 'premium', 300, 198, '#E17055', 'lightning', false)
ON CONFLICT DO NOTHING;

-- Insert parking sections for Adventure Parking Deck
INSERT INTO parking_sections (id, parking_lot_id, name, code, level, section_type, capacity, available_spots, color_code, icon_name, is_accessible) VALUES
  ('99999999-9999-9999-9999-999999999999', 'c3d4e5f6-a7b8-9012-cdef-123456789012', 'Indiana', 'IN', 1, 'standard', 600, 423, '#00B894', 'hat', false),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'c3d4e5f6-a7b8-9012-cdef-123456789012', 'Jasmine', 'JA', 2, 'standard', 600, 489, '#FDCB6E', 'tiger', false),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'c3d4e5f6-a7b8-9012-cdef-123456789012', 'Kronk', 'KR', 3, 'premium', 400, 267, '#E84393', 'squirrel', false),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'c3d4e5f6-a7b8-9012-cdef-123456789012', 'Lilo', 'LI', 1, 'accessible', 200, 145, '#0984E3', 'flower', true)
ON CONFLICT DO NOTHING;

-- Insert parking sections for Discovery Lot
INSERT INTO parking_sections (id, parking_lot_id, name, code, level, section_type, capacity, available_spots, color_code, icon_name, is_accessible) VALUES
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'd4e5f6a7-b8c9-0123-defa-234567890123', 'Mulan', 'MU', 0, 'standard', 600, 456, '#D63031', 'dragon', false),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'd4e5f6a7-b8c9-0123-defa-234567890123', 'Nemo', 'NE', 0, 'standard', 600, 534, '#0984E3', 'fish', false),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'd4e5f6a7-b8c9-0123-defa-234567890123', 'Olaf', 'OL', 0, 'standard', 500, 398, '#74B9FF', 'snowman', false),
  ('12121212-1212-1212-1212-121212121212', 'd4e5f6a7-b8c9-0123-defa-234567890123', 'Peter', 'PE', 0, 'accessible', 150, 112, '#55EFC4', 'feather', true)
ON CONFLICT DO NOTHING;

-- Insert pricing tiers using gen_random_uuid()
INSERT INTO pricing_tiers (parking_lot_id, name, description, price_per_hour, daily_max, is_active) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Standard', 'Regular parking rate', 5.00, 30.00, true),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Premium', 'Preferred close-in parking', 8.00, 45.00, true),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Standard', 'Regular parking rate', 4.00, 25.00, true),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Premium', 'Preferred close-in parking', 7.00, 40.00, true),
  ('c3d4e5f6-a7b8-9012-cdef-123456789012', 'Standard', 'Covered garage parking', 6.00, 35.00, true),
  ('c3d4e5f6-a7b8-9012-cdef-123456789012', 'Premium', 'Premium covered parking', 9.00, 50.00, true),
  ('d4e5f6a7-b8c9-0123-defa-234567890123', 'Economy', 'Budget-friendly with shuttle', 3.00, 20.00, true)
ON CONFLICT DO NOTHING;
