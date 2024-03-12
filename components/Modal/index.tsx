import React, { FC, ReactNode, useCallback } from 'react';
import { CloseModalButton, CreateModal } from '@components/Modal/style';

interface IModalProps {
  children: ReactNode;
  show: boolean;
  onCloseModal: () => void;
}

const Modal: FC<IModalProps> = ({ children, show, onCloseModal }) => {
  const stopPropagation = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  if (!show) {
    return null;
  }

  return (
    <CreateModal onClick={onCloseModal}>
      <div onClick={stopPropagation}>
        <CloseModalButton onClick={onCloseModal}>&times;</CloseModalButton>
        {children}
      </div>
    </CreateModal>
  );
};

export default Modal;
