import React, { CSSProperties, FC, ReactNode, useCallback } from 'react';
import { CloseModalButton, CreateMenu } from '@components/Menu/style';

interface IMenuProps {
  children: ReactNode;
  style: CSSProperties;
  show: boolean;
  onCloseModal: (e: React.MouseEvent) => void;
  closeButton?: boolean;
}

const Menu: FC<IMenuProps> = ({ children, style, show, onCloseModal, closeButton }) => {
  const stopPropagation = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  if (!show) return null;

  return (
    <CreateMenu style={style} onClick={onCloseModal}>
      <div onClick={stopPropagation}>
        {closeButton && <CloseModalButton onClick={onCloseModal}>&times;</CloseModalButton>}
        {children}
      </div>
    </CreateMenu>
  );
};

Menu.defaultProps = {
  closeButton: true,
};

export default Menu;
