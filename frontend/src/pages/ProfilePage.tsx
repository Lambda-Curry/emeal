import React from 'react';
import { ProfileForm } from '../components/forms/ProfileForm';
import './profile-page.scss';

export const ProfilePage = () => (
  <main className='page profile'>
    <div className='profile-content'>
      <h2>Profile Page</h2>
      <ProfileForm />
    </div>
  </main>
);
