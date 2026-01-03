
export enum UserRole {
  ADMIN = 'admin',
  BLOOD_BANK = 'bloodBank',
  SEEKER = 'seeker',
  DONOR = 'donor',
  GUEST = 'guest'
}

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  location: string;
  bloodGroup?: BloodGroup;
}

export interface BloodBank {
  id: string;
  name: string;
  location: string;
  contact: string;
  inventory: Record<BloodGroup, number>;
  verified: boolean;
}

export interface Donor {
  id: string;
  name: string;
  bloodGroup: BloodGroup;
  location: string;
  lastDonationDate?: string;
  isAvailable: boolean;
  contact: string;
}

export interface BloodRequest {
  id: string;
  seekerId: string;
  bloodGroup: BloodGroup;
  units: number;
  location: string;
  hospital: string;
  status: 'pending' | 'fulfilled' | 'cancelled';
  urgency: 'critical' | 'normal';
  createdAt: string;
}

export interface Alert {
  id: string;
  type: 'emergency' | 'update';
  message: string;
  timestamp: string;
  location: string;
}
