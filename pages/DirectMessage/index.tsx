import React, { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { Container, DragOver, Header } from '@pages/DirectMessage/style';
import gravatar from 'gravatar';
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import { IDM, IUser } from '@typings/db';
import fetcher from '@utils/fetcher';
import { useParams } from 'react-router';
import ChatList from '@components/ChatList';
import ChatBox from '@components/ChatBox';
import useInput from '@hooks/useInput';
import axios from 'axios';
import makeSection from '@utils/makeSection';
import { Scrollbars } from 'react-custom-scrollbars-2';
import useSocket from '@hooks/useSocket';

const DirectMessage = () => {
  const [dragOver, setDragOver] = useState<boolean>(false);
  const { workspace, id } = useParams<{ workspace: string; id: string }>();
  const scrollbarRef = useRef<Scrollbars | null>(null);
  const [chat, onChangeChat, setChat] = useInput('');
  const [socket] = useSocket(workspace);

  const { data: userData } = useSWR<IUser>(`/api/workspaces/${workspace}/users/${id}`, fetcher);
  const { data: myData } = useSWR<IUser>('/api/users', fetcher);
  const {
    data: chatData,
    mutate: mutateChat,
    setSize,
    isLoading,
  } = useSWRInfinite<IDM[]>(
    (index) => `/api/workspaces/${workspace}/dms/${id}/chats?perPage=20&page=${index + 1}`,
    fetcher,
  );

  const isEmpty = chatData?.[0]?.length === 0;
  const isReachingEnd = isEmpty || (chatData && chatData[chatData.length - 1]?.length < 20) || false;

  // 로딩 시 스크롤바 제일 아래로
  useEffect(() => {
    if (isLoading) {
      scrollbarRef.current?.scrollToBottom();
    }
  }, [isLoading]);

  useEffect(() => {
    socket?.on('dm', onMessage);
    return () => {
      socket?.off('dm', onMessage);
    };
  }, []);

  const onMessage = useCallback(
    (data: IDM) => {
      if (data.SenderId === Number(id) && myData?.id !== Number(id)) {
        mutateChat((chatData) => {
          chatData?.[0].unshift(data);
          return chatData;
        }).then(() => {
          if (scrollbarRef.current) {
            if (
              scrollbarRef.current?.getScrollHeight() <
              scrollbarRef.current?.getClientHeight() + scrollbarRef.current?.getScrollTop() + 150
            ) {
              setTimeout(() => {
                scrollbarRef.current?.scrollToBottom();
              }, 50);
            }
          }
        });
      }
    },
    [id, scrollbarRef.current],
  );

  const onSubmitForm = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (chat?.trim() && chatData) {
        const savedChat = chat;
        mutateChat((prevChatData) => {
          prevChatData?.[0].unshift({
            id: (chatData[0][0]?.id || 0) + 1,
            content: savedChat,
            SenderId: myData?.id,
            Sender: myData,
            Receiver: userData,
            ReceiverId: userData?.id,
            createdAt: new Date(),
          } as IDM);
          return prevChatData;
        }).then(() => {
          setChat('');
        });
        axios
          .post(`/api/workspaces/${workspace}/dms/${id}/chats`, {
            content: chat,
          })
          .then(() => {
            mutateChat();
            setChat('');
            scrollbarRef.current?.scrollToBottom();
          })
          .catch((error) => {
            mutateChat();
            console.dir(error.response);
          });
      }

      setChat('');
    },
    [chat, setChat, mutateChat],
  );

  const onDrag = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();

      const formData = new FormData();
      if (e.dataTransfer.items) {
        for (let i = 0; i < e.dataTransfer.items.length; i++) {
          if (e.dataTransfer.items[i].kind === 'file') {
            const file = e.dataTransfer.items[i].getAsFile();
            console.log(file?.name);
            if (file) {
              formData.append('image', file);
            }
          }
        }
      } else {
        for (let i = 0; i < e.dataTransfer.files.length; i++) {
          console.log(e.dataTransfer.files[i].name);
          formData.append('image', e.dataTransfer.files[i]);
        }
      }

      axios.post(`/api/workspaces/${workspace}/dms/${id}/images`, formData).then(() => {
        setDragOver(false);
        mutateChat();
      });
    },
    [mutateChat, workspace, id],
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    console.log(e);
    setDragOver(true);
  }, []);

  if (!userData || !myData) {
    return null;
  }

  const chatSections = makeSection(chatData ? chatData.flat().reverse() : []);

  return (
    <Container onDrag={onDrag} onDragOver={onDragOver}>
      <Header>
        <img src={gravatar.url(userData.email, { s: '24px', d: 'retro' })} alt={userData.nickname} />
        <span>{userData.nickname}</span>
      </Header>
      <ChatList
        chatSections={chatSections || []}
        ref={scrollbarRef}
        setSize={setSize}
        isEmpty={isEmpty}
        isReachingEnd={isReachingEnd}
      />
      <ChatBox
        onSubmitForm={onSubmitForm}
        chat={chat}
        onChangeChat={onChangeChat}
        placeholder={`Message ${userData.nickname}`}
      />
      {dragOver && <DragOver>업로드!</DragOver>}
    </Container>
  );
};

export default DirectMessage;
