import React, { FormEvent, useCallback } from 'react';
import { Button, Input, Label } from '@pages/SignUp/style';
import Modal from '@components/Modal';
import useInput from '@hooks/useInput';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useParams } from 'react-router';
import useSWR from 'swr';
import { IChannel, IUser } from '@typings/db';
import fetcher from '@utils/fetcher';

interface IInviteWorkspaceModalProps {
  show: boolean;
  onCloseModal: () => void;
  setShowInviteWorkspaceModal: (flag: boolean) => void;
}

const InviteWorkspaceModal = ({ show, onCloseModal, setShowInviteWorkspaceModal }: IInviteWorkspaceModalProps) => {
  const [newMember, onChangeNewMember, setInviteNewMember] = useInput('');
  const { workspace, channel } = useParams<{ workspace: string; channel: string }>();

  const { data: userData } = useSWR<IUser | false>('http://localhost:3095/api/users', fetcher);
  const { mutate: mutateChannel } = useSWR<IChannel[]>(
    userData ? `http://localhost:3095/api/workspaces/${workspace}/channels` : null,
    fetcher,
  );

  const onInviteMember = useCallback((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!newMember || !newMember.trim()) return;

    axios
      .post(
        `http://localhost:3095/api/workspaces/${workspace}/members`,
        {
          email: newMember,
        },
        { withCredentials: true },
      )
      .then((response) => {
        setShowInviteWorkspaceModal(false);
        mutateChannel();
        setInviteNewMember('');
      })
      .catch((error) => {
        console.dir(error);
        toast.error(error.response?.data, { position: 'bottom-center' });
      });
  }, []);

  return (
    <Modal show={show} onCloseModal={onCloseModal}>
      <form onSubmit={onInviteMember}>
        <Label id="workspace-label">
          <span>이메일</span>
          <Input id="member" type="email" value={newMember} onChange={onChangeNewMember} />
        </Label>
        <Button type="submit">초대하기</Button>
      </form>
    </Modal>
  );
};

export default InviteWorkspaceModal;
