import React, { FormEvent, useCallback } from 'react';
import { Container, Header } from '@pages/Channel/styles';
import ChatList from '@components/ChatList';
import ChatBox from '@components/ChatBox';
import useInput from '@hooks/useInput';
import useSWR from 'swr';
import { IDM, IUser } from '@typings/db';
import fetcher from '@utils/fetcher';
import { useParams } from 'react-router';
import axios from 'axios';
import gravatar from 'gravatar';

const Channel = () => {
  const [chat, onChangeChat] = useInput('');

  const onSubmitForm = useCallback((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Channel');
  }, []);

  return (
    <Container>
      <Header>Channel</Header>
      {/*<ChatList chatData={} />*/}
      <ChatBox onSubmitForm={onSubmitForm} chat={chat} onChangeChat={onChangeChat} />
    </Container>
  );
};

export default Channel;
