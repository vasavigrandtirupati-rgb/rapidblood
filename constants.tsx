
import { BloodGroup, UserRole, BloodBank, Donor, BloodRequest } from './types';

export const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const LOCATIONS = [
  "Tirupati", "Vijayawada", "Guntur", "Nellore", "Kurnool", 
  "Visakhapatnam", "Rajahmundry", "Anantapur", "Kadapa"
];

const generateInventory = () => {
  const inv: any = {};
  BLOOD_GROUPS.forEach(bg => {
    inv[bg] = Math.floor(Math.random() * 50);
  });
  return inv;
};

export const DUMMY_BLOOD_BANKS: BloodBank[] = Array.from({ length: 20 }).map((_, i) => ({
  id: `bb-${i}`,
  name: `${LOCATIONS[i % LOCATIONS.length]} Red Cross Society`,
  location: LOCATIONS[i % LOCATIONS.length],
  contact: `+91 99887766${i.toString().padStart(2, '0')}`,
  inventory: generateInventory(),
  verified: i % 3 !== 0
}));

export const DUMMY_DONORS: Donor[] = Array.from({ length: 20 }).map((_, i) => ({
  id: `dn-${i}`,
  name: `Donor ${i + 1}`,
  bloodGroup: BLOOD_GROUPS[i % BLOOD_GROUPS.length],
  location: LOCATIONS[i % LOCATIONS.length],
  lastDonationDate: '2023-10-12',
  isAvailable: Math.random() > 0.3,
  contact: `+91 88776655${i.toString().padStart(2, '0')}`
}));

export const DUMMY_REQUESTS: BloodRequest[] = Array.from({ length: 10 }).map((_, i) => ({
  id: `req-${i}`,
  seekerId: `seeker-${i}`,
  bloodGroup: BLOOD_GROUPS[Math.floor(Math.random() * BLOOD_GROUPS.length)],
  units: Math.floor(Math.random() * 5) + 1,
  location: LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)],
  hospital: "City General Hospital",
  status: i % 4 === 0 ? 'fulfilled' : 'pending',
  urgency: i % 3 === 0 ? 'critical' : 'normal',
  createdAt: new Date().toISOString()
}));
