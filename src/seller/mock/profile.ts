import type { SellerProfileData } from '@/seller/types/profile';

export const SELLER_PROFILE_SEED: SellerProfileData = {
  name: 'Arjun Mehta',
  company: 'Mehta Chemicals Pvt Ltd',
  verified: true,
  badge: 'Premium Seller',
  gst: '27AAACR1234A1Z1',
  profileImage:
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80',
  address: 'Mumbai, MH 400001',
  bankVerified: true,
  kycStatus: 'verified',
  kycDocumentsCount: 3,
  tradeLicenseExpiryDays: 142,
  documents: [
    { id: 'gst-cert', title: 'GST Certificate' },
    { id: 'pan-card', title: 'PAN Card' },
    { id: 'trade-license', title: 'Trade License' },
  ],
  appVersion: 'Version 2.4.12-build-09',
};
