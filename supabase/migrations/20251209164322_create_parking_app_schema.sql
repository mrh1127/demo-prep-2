/*
  # Theme Park Parking Application Database Schema

  ## Overview
  This migration creates the complete database structure for a theme park parking application
  with payment processing and vehicle location services.

  ## New Tables

  1. `profiles` - Extended user profile information
    - `id` (uuid, primary key, references auth.users)
    - `email` (text)
    - `full_name` (text)
    - `phone` (text)
    - `preferred_language` (text, default 'en')
    - `accessibility_needs` (jsonb)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  2. `vehicles` - User registered vehicles
    - `id` (uuid, primary key)
    - `user_id` (uuid, references profiles)
    - `license_plate` (text)
    - `state_province` (text)
    - `make` (text)
    - `model` (text)
    - `color` (text)
    - `nickname` (text)
    - `is_default` (boolean)
    - `created_at` (timestamptz)

  3. `parking_lots` - Theme park parking areas
    - `id` (uuid, primary key)
    - `name` (text)
    - `code` (text, unique)
    - `description` (text)
    - `location_lat` (numeric)
    - `location_lng` (numeric)
    - `total_capacity` (integer)
    - `is_active` (boolean)
    - `amenities` (jsonb)
    - `created_at` (timestamptz)

  4. `parking_sections` - Sections/levels within parking lots
    - `id` (uuid, primary key)
    - `parking_lot_id` (uuid, references parking_lots)
    - `name` (text)
    - `code` (text)
    - `level` (integer)
    - `section_type` (text)
    - `capacity` (integer)
    - `location_lat` (numeric)
    - `location_lng` (numeric)
    - `color_code` (text)
    - `icon_name` (text)
    - `is_accessible` (boolean)
    - `is_active` (boolean)

  5. `parking_spots` - Individual parking spaces
    - `id` (uuid, primary key)
    - `section_id` (uuid, references parking_sections)
    - `spot_number` (text)
    - `spot_type` (text)
    - `is_accessible` (boolean)
    - `is_ev_charging` (boolean)
    - `is_available` (boolean)
    - `location_lat` (numeric)
    - `location_lng` (numeric)
    - `qr_code` (text, unique)

  6. `pricing_tiers` - Pricing configuration
    - `id` (uuid, primary key)
    - `parking_lot_id` (uuid, references parking_lots)
    - `name` (text)
    - `description` (text)
    - `price_per_hour` (numeric)
    - `daily_max` (numeric)
    - `is_active` (boolean)
    - `valid_from` (timestamptz)
    - `valid_until` (timestamptz)

  7. `parking_sessions` - Active and historical parking sessions
    - `id` (uuid, primary key)
    - `user_id` (uuid, references profiles)
    - `vehicle_id` (uuid, references vehicles)
    - `parking_spot_id` (uuid, references parking_spots)
    - `pricing_tier_id` (uuid, references pricing_tiers)
    - `session_status` (text)
    - `started_at` (timestamptz)
    - `expires_at` (timestamptz)
    - `ended_at` (timestamptz)
    - `total_amount` (numeric)
    - `qr_code` (text)
    - `license_plate_entry` (text)

  8. `payments` - Payment transactions
    - `id` (uuid, primary key)
    - `user_id` (uuid, references profiles)
    - `parking_session_id` (uuid, references parking_sessions)
    - `amount` (numeric)
    - `currency` (text)
    - `payment_method` (text)
    - `payment_status` (text)
    - `stripe_payment_intent_id` (text)
    - `receipt_url` (text)
    - `created_at` (timestamptz)

  9. `saved_locations` - GPS-saved vehicle locations
    - `id` (uuid, primary key)
    - `user_id` (uuid, references profiles)
    - `parking_session_id` (uuid, references parking_sessions)
    - `latitude` (numeric)
    - `longitude` (numeric)
    - `accuracy` (numeric)
    - `altitude` (numeric)
    - `parking_lot_id` (uuid, references parking_lots)
    - `section_id` (uuid, references parking_sections)
    - `spot_id` (uuid, references parking_spots)
    - `photo_url` (text)
    - `notes` (text)
    - `created_at` (timestamptz)

  10. `push_subscriptions` - Push notification subscriptions
    - `id` (uuid, primary key)
    - `user_id` (uuid, references profiles)
    - `endpoint` (text)
    - `subscription_data` (jsonb)
    - `is_active` (boolean)
    - `created_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Users can only access their own data
  - Parking lot/section/spot data is publicly readable
  - Payment data is strictly user-scoped
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  phone text,
  preferred_language text DEFAULT 'en',
  accessibility_needs jsonb DEFAULT '{}',
  park_pass_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  license_plate text NOT NULL,
  state_province text,
  make text,
  model text,
  color text,
  nickname text,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own vehicles"
  ON vehicles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own vehicles"
  ON vehicles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vehicles"
  ON vehicles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own vehicles"
  ON vehicles FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Parking lots table
CREATE TABLE IF NOT EXISTS parking_lots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  description text,
  location_lat numeric(10, 7),
  location_lng numeric(10, 7),
  total_capacity integer DEFAULT 0,
  available_spots integer DEFAULT 0,
  is_active boolean DEFAULT true,
  amenities jsonb DEFAULT '[]',
  image_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE parking_lots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active parking lots"
  ON parking_lots FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Parking sections table
CREATE TABLE IF NOT EXISTS parking_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parking_lot_id uuid NOT NULL REFERENCES parking_lots(id) ON DELETE CASCADE,
  name text NOT NULL,
  code text NOT NULL,
  level integer DEFAULT 0,
  section_type text DEFAULT 'standard',
  capacity integer DEFAULT 0,
  available_spots integer DEFAULT 0,
  location_lat numeric(10, 7),
  location_lng numeric(10, 7),
  color_code text,
  icon_name text,
  is_accessible boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(parking_lot_id, code)
);

ALTER TABLE parking_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active sections"
  ON parking_sections FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Parking spots table
CREATE TABLE IF NOT EXISTS parking_spots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id uuid NOT NULL REFERENCES parking_sections(id) ON DELETE CASCADE,
  spot_number text NOT NULL,
  spot_type text DEFAULT 'standard',
  is_accessible boolean DEFAULT false,
  is_ev_charging boolean DEFAULT false,
  is_available boolean DEFAULT true,
  location_lat numeric(10, 7),
  location_lng numeric(10, 7),
  qr_code text UNIQUE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(section_id, spot_number)
);

ALTER TABLE parking_spots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view parking spots"
  ON parking_spots FOR SELECT
  TO authenticated
  USING (true);

-- Pricing tiers table
CREATE TABLE IF NOT EXISTS pricing_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parking_lot_id uuid NOT NULL REFERENCES parking_lots(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price_per_hour numeric(10, 2) NOT NULL,
  daily_max numeric(10, 2),
  is_active boolean DEFAULT true,
  valid_from timestamptz DEFAULT now(),
  valid_until timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE pricing_tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active pricing"
  ON pricing_tiers FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Parking sessions table
CREATE TABLE IF NOT EXISTS parking_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  vehicle_id uuid REFERENCES vehicles(id) ON DELETE SET NULL,
  parking_spot_id uuid REFERENCES parking_spots(id) ON DELETE SET NULL,
  pricing_tier_id uuid REFERENCES pricing_tiers(id) ON DELETE SET NULL,
  session_status text DEFAULT 'active' CHECK (session_status IN ('active', 'expired', 'completed', 'cancelled')),
  started_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL,
  ended_at timestamptz,
  total_amount numeric(10, 2) DEFAULT 0,
  qr_code text UNIQUE,
  license_plate_entry text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE parking_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions"
  ON parking_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON parking_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON parking_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  parking_session_id uuid REFERENCES parking_sessions(id) ON DELETE SET NULL,
  amount numeric(10, 2) NOT NULL,
  currency text DEFAULT 'USD',
  payment_method text NOT NULL CHECK (payment_method IN ('credit_card', 'debit_card', 'apple_pay', 'google_pay', 'park_pass')),
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
  stripe_payment_intent_id text,
  receipt_url text,
  receipt_data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payments"
  ON payments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Saved locations table
CREATE TABLE IF NOT EXISTS saved_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  parking_session_id uuid REFERENCES parking_sessions(id) ON DELETE SET NULL,
  latitude numeric(10, 7) NOT NULL,
  longitude numeric(10, 7) NOT NULL,
  accuracy numeric(10, 2),
  altitude numeric(10, 2),
  heading numeric(5, 2),
  parking_lot_id uuid REFERENCES parking_lots(id) ON DELETE SET NULL,
  section_id uuid REFERENCES parking_sections(id) ON DELETE SET NULL,
  spot_id uuid REFERENCES parking_spots(id) ON DELETE SET NULL,
  photo_url text,
  notes text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE saved_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saved locations"
  ON saved_locations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved locations"
  ON saved_locations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved locations"
  ON saved_locations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved locations"
  ON saved_locations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Push subscriptions table
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  endpoint text NOT NULL,
  subscription_data jsonb NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, endpoint)
);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions"
  ON push_subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions"
  ON push_subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions"
  ON push_subscriptions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own subscriptions"
  ON push_subscriptions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_vehicles_user_id ON vehicles(user_id);
CREATE INDEX IF NOT EXISTS idx_parking_sections_lot_id ON parking_sections(parking_lot_id);
CREATE INDEX IF NOT EXISTS idx_parking_spots_section_id ON parking_spots(section_id);
CREATE INDEX IF NOT EXISTS idx_parking_spots_available ON parking_spots(is_available);
CREATE INDEX IF NOT EXISTS idx_parking_sessions_user_id ON parking_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_parking_sessions_status ON parking_sessions(session_status);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_session_id ON payments(parking_session_id);
CREATE INDEX IF NOT EXISTS idx_saved_locations_user_id ON saved_locations(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_locations_active ON saved_locations(is_active);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
