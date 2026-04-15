import React from 'react';
import Avatar from '@mui/material/Avatar';
import { stringAvatar } from '../../utils/avatar';

// Define the props your component expects
interface UserProfileProps {
  name: string;
  profileImageUrl?: string | null;
}

export default function UserProfileAvatar({ name, profileImageUrl }: UserProfileProps) {
  return (
    <Avatar
      // If profileImageUrl is valid, it shows the image. 
      // If it's null/undefined, or if the image fails to load, it falls back.
      src={profileImageUrl || undefined} 
      
      // We spread the result of our helper function to provide the background color and initials
      {...stringAvatar(name)}
      
      // Optional: adjust the size if needed
      // style={{ width: 40, height: 40 }} 
    />
  );
}