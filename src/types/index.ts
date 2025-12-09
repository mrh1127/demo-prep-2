export interface Profile {
  id: string
  email: string | null
  full_name: string | null
  phone: string | null
  preferred_language: string
  accessibility_needs: AccessibilityNeeds
  park_pass_id: string | null
  created_at: string
  updated_at: string
}

export interface AccessibilityNeeds {
  wheelchair?: boolean
  visual_impairment?: boolean
  hearing_impairment?: boolean
  mobility_assistance?: boolean
}

export interface Vehicle {
  id: string
  user_id: string
  license_plate: string
  state_province: string | null
  make: string | null
  model: string | null
  color: string | null
  nickname: string | null
  is_default: boolean
  created_at: string
}

export interface ParkingLot {
  id: string
  name: string
  code: string
  description: string | null
  location_lat: number
  location_lng: number
  total_capacity: number
  available_spots: number
  is_active: boolean
  amenities: string[]
  image_url: string | null
  created_at: string
  sections?: ParkingSection[]
  pricing_tiers?: PricingTier[]
}

export interface ParkingSection {
  id: string
  parking_lot_id: string
  name: string
  code: string
  level: number
  section_type: 'standard' | 'premium' | 'accessible'
  capacity: number
  available_spots: number
  location_lat: number | null
  location_lng: number | null
  color_code: string | null
  icon_name: string | null
  is_accessible: boolean
  is_active: boolean
  created_at: string
}

export interface ParkingSpot {
  id: string
  section_id: string
  spot_number: string
  spot_type: string
  is_accessible: boolean
  is_ev_charging: boolean
  is_available: boolean
  location_lat: number | null
  location_lng: number | null
  qr_code: string | null
  created_at: string
}

export interface PricingTier {
  id: string
  parking_lot_id: string
  name: string
  description: string | null
  price_per_hour: number
  daily_max: number | null
  is_active: boolean
  valid_from: string
  valid_until: string | null
  created_at: string
}

export interface ParkingSession {
  id: string
  user_id: string
  vehicle_id: string | null
  parking_spot_id: string | null
  pricing_tier_id: string | null
  session_status: 'active' | 'expired' | 'completed' | 'cancelled'
  started_at: string
  expires_at: string
  ended_at: string | null
  total_amount: number
  qr_code: string | null
  license_plate_entry: string | null
  created_at: string
  vehicle?: Vehicle
  parking_spot?: ParkingSpot & { section?: ParkingSection & { parking_lot?: ParkingLot } }
  pricing_tier?: PricingTier
}

export interface Payment {
  id: string
  user_id: string
  parking_session_id: string | null
  amount: number
  currency: string
  payment_method: PaymentMethod
  payment_status: PaymentStatus
  stripe_payment_intent_id: string | null
  receipt_url: string | null
  receipt_data: ReceiptData
  created_at: string
}

export type PaymentMethod = 'credit_card' | 'debit_card' | 'apple_pay' | 'google_pay' | 'park_pass'
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'

export interface ReceiptData {
  parking_lot?: string
  section?: string
  spot?: string
  duration_hours?: number
  rate?: number
  vehicle?: string
}

export interface SavedLocation {
  id: string
  user_id: string
  parking_session_id: string | null
  latitude: number
  longitude: number
  accuracy: number | null
  altitude: number | null
  heading: number | null
  parking_lot_id: string | null
  section_id: string | null
  spot_id: string | null
  photo_url: string | null
  notes: string | null
  is_active: boolean
  created_at: string
  parking_lot?: ParkingLot
  section?: ParkingSection
}

export interface GeoPosition {
  latitude: number
  longitude: number
  accuracy?: number
  altitude?: number
  heading?: number
}

export type Language = 'en' | 'es' | 'fr' | 'de' | 'zh' | 'ja' | 'ko' | 'pt'

export interface Translations {
  [key: string]: string | Translations
}
