export interface UserSession {
  id: string;
  email: string;
  role: string;
  avatar_url?: string;
  first_name?: string;
  last_name?: string;
  [key: string]: unknown; // Add index signature for compatibility with JWTPayload
}

export interface Listing {
  id: number;
  image: string;
  title: string;
  location: string;
  price: string;
  roommates: number;
  rating: number;
  features: string[];
}