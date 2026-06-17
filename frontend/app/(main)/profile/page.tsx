import { Metadata } from 'next';
import ProfileClient from './ProfileClient';

export const metadata: Metadata = {
  title: 'My Profile - Koder',
  description: 'View your profile, rank, and progress',
};

export default function ProfilePage() {
  return <ProfileClient />;
}
