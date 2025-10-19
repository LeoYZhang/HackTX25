import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import UserProfileModal from './UserProfileModal';

const UserProfile: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClose = () => {
    // If there's a referrer, go back, otherwise go to home
    if (document.referrer && !document.referrer.includes(window.location.origin)) {
      navigate(-1);
      } else {
        navigate('/');
    }
  };

  return (
    <UserProfileModal 
      isOpen={true} 
      onClose={handleClose} 
    />
  );
};

export default UserProfile;

