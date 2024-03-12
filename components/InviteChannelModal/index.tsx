import React from 'react';

interface IInviteChannelModalProps {
  show: boolean;
  onCloseModal: () => void;
  setShowInviteChannelModal: (flag: boolean) => void;
}

const InviteChannelModal = ({show, onCloseModal, setShowInviteChannelModal}: IInviteChannelModalProps) => {
  return <div>ddd</div>;
};

export default InviteChannelModal;
