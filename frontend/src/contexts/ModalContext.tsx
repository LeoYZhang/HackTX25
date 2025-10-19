import React, { createContext, useContext, useState, ReactNode } from 'react';
import UserProfileModal from '../components/UserProfileModal';

interface ModalContextType {
  openProfileModal: () => void;
  closeProfileModal: () => void;
  isProfileModalOpen: boolean;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModal = () => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

interface ModalProviderProps {
  children: ReactNode;
}

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const openProfileModal = () => {
    setIsProfileModalOpen(true);
  };

  const closeProfileModal = () => {
    setIsProfileModalOpen(false);
  };

  return (
    <ModalContext.Provider value={{ openProfileModal, closeProfileModal, isProfileModalOpen }}>
      {children}
      <UserProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={closeProfileModal} 
      />
    </ModalContext.Provider>
  );
};
