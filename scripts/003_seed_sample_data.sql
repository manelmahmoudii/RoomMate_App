-- Updated to use correct column names and add comprehensive sample data
-- Insert sample profiles (these will be created automatically when users sign up via Supabase Auth)
-- This is just for reference - actual profiles are created via the trigger

-- Insert sample listings with proper owner_id references
INSERT INTO public.listings (owner_id, title, description, address, city, price, room_type, available_from, amenities, images, max_roommates) VALUES
(
  -- This will need to be updated with actual user IDs after signup
  '00000000-0000-0000-0000-000000000001'::uuid,
  'Chambre moderne près de l''université de Tunis',
  'Belle chambre meublée dans un appartement partagé, proche des transports en commun et de l''université de Tunis. Ambiance étudiante garantie!',
  'Avenue Habib Bourguiba, Menzah 6',
  'Tunis',
  350.00,
  'Chambre privée',
  '2024-02-01',
  ARRAY['WiFi haut débit', 'Climatisation', 'Cuisine équipée', 'Balcon', 'Machine à laver'],
  ARRAY['/modern-student-apartment-tunis.jpg', '/modern-apartment-bedroom-tunis.jpg'],
  2
),
(
  '00000000-0000-0000-0000-000000000002'::uuid,
  'Appartement partagé Sfax centre-ville',
  'Appartement spacieux au cœur de Sfax, idéal pour étudiants. Toutes commodités à proximité: supermarchés, cafés, bibliothèque.',
  'Rue Hedi Chaker, Centre-ville',
  'Sfax',
  280.00,
  'Appartement partagé',
  '2024-02-15',
  ARRAY['WiFi', 'Cuisine équipée', 'Parking', 'Terrasse'],
  ARRAY['/shared-apartment-sfax-center.jpg', '/modern-apartment-living-room-tunis.jpg'],
  3
),
(
  '00000000-0000-0000-0000-000000000003'::uuid,
  'Studio cosy à Sousse',
  'Petit studio parfait pour un étudiant, proche de la plage et de l''université de Sousse. Calme et lumineux.',
  'Avenue Tahar Sfar, Sousse',
  'Sousse',
  320.00,
  'Studio',
  '2024-03-01',
  ARRAY['WiFi', 'Climatisation', 'Kitchenette', 'Proche plage'],
  ARRAY['/cozy-student-room-sfax.jpg'],
  1
),
(
  '00000000-0000-0000-0000-000000000004'::uuid,
  'Chambre dans villa Monastir',
  'Grande chambre dans une belle villa avec jardin. Environnement calme, parfait pour les études.',
  'Rue des Palmiers, Monastir',
  'Monastir',
  300.00,
  'Chambre privée',
  '2024-02-20',
  ARRAY['WiFi', 'Jardin', 'Parking', 'Cuisine partagée'],
  ARRAY['/student-apartment-monastir.jpg'],
  2
);

-- Insert sample announcements
INSERT INTO public.announcements (user_id, title, content, category, city, created_at) VALUES
(
  '00000000-0000-0000-0000-000000000001'::uuid,
  'Recherche colocataire pour appartement Tunis',
  'Salut! Je cherche un(e) colocataire sympa pour partager un bel appartement à Tunis. Ambiance détendue, respect mutuel garanti!',
  'roommate',
  'Tunis',
  NOW() - INTERVAL '2 days'
),
(
  '00000000-0000-0000-0000-000000000002'::uuid,
  'Groupe d''étude Informatique - ISIMS',
  'Formation d''un groupe d''étude pour les examens d''informatique. Tous niveaux bienvenus!',
  'study_group',
  'Sfax',
  NOW() - INTERVAL '1 day'
),
(
  '00000000-0000-0000-0000-000000000003'::uuid,
  'Vends livres de médecine',
  'Vends collection de livres de médecine en excellent état. Prix négociables.',
  'marketplace',
  'Sousse',
  NOW() - INTERVAL '3 hours'
);

-- Note: In a real application, you would replace the hardcoded UUIDs with actual user IDs
-- after users sign up through the authentication system
