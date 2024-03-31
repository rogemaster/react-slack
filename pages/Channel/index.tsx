import React, { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { Container, Header } from '@pages/Channel/styles';
import ChatList from '@components/ChatList';
import ChatBox from '@components/ChatBox';
import useInput from '@hooks/useInput';
import useSWR from 'swr';
import { IChannel, IChat, IUser } from '@typings/db';
import fetcher from '@utils/fetcher';
import { useParams } from 'react-router';
import axios from 'axios';
import { Scrollbars } from 'react-custom-scrollbars-2';
import useSocket from '@hooks/useSocket';
import useSWRInfinite from 'swr/infinite';
import makeSection from '@utils/makeSection';
import InviteChannelModal from '@components/InviteChannelModal';
import { DragOver } from '@pages/DirectMessage/style';

const Channel = () => {
  const [showInviteChannelModal, setShowInviteChannelModal] = useState<boolean>(false);
  const [dragOver, setDragOver] = useState(false);

  const { workspace, channel } = useParams<{ workspace: string; channel: string }>();
  const scrollbarRef = useRef<Scrollbars | null>(null);
  const [chat, onChangeChat, setChat] = useInput('');
  const [socket] = useSocket(workspace);

  const { data: myData } = useSWR<IUser>('/api/users', fetcher);
  const {
    data: chatData,
    mutate: mutateChat,
    setSize,
    isLoading,
  } = useSWRInfinite<IChat[]>(
    (index) => `/api/workspaces/${workspace}/channels/${channel}/chats?perPage=20&page=${index + 1}`,
    fetcher,
  );
  const { data: channelMembersData } = useSWR<IUser[]>(
    myData ? `/api/workspace.${workspace}/channels/${channel}/members` : null,
    fetcher,
  );
  const { data: channelData } = useSWR<IChannel>(`/api/workspaces/${workspace}/channels/${channel}`, fetcher);

  const isEmpty = chatData?.[0]?.length === 0;
  const isReachingEnd = isEmpty || (chatData && chatData[chatData.length - 1]?.length < 20) || false;

  // 로딩 시 스크롤바 제일 아래로
  useEffect(() => {
    if (isLoading) {
      scrollbarRef.current?.scrollToBottom();
    }
  }, [isLoading]);

  useEffect(() => {
    socket?.on('message', onMessage);
    return () => {
      socket?.off('message', onMessage);
    };
  }, []);

  const onMessage = useCallback(
    (data: IChat) => {
      if (data.Channel.name === channel && (data.content.startsWith('uploads\\') || data.UserId !== myData?.id)) {
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
    [channel, scrollbarRef.current],
  );

  const onSubmitForm = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (chat?.trim() && chatData && channelData) {
        const savedChat = chat;
        mutateChat((prevChatData) => {
          prevChatData?.[0].unshift({
            id: (chatData[0][0]?.id || 0) + 1,
            content: savedChat,
            UserId: myData?.id,
            User: myData,
            ChannelId: channelData.id,
            Channel: channelData,
            createdAt: new Date(),
          } as IChat);
          return prevChatData;
        }).then(() => {
          setChat('');
        });
        axios
          .post(`/api/workspaces/${workspace}/channels/${channel}/chats`, {
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
    [chat, channelData, setChat, mutateChat],
  );

  const onClickInviteChannel = useCallback(() => {
    setShowInviteChannelModal(true);
  }, []);

  const onCloseModal = useCallback(() => {
    setShowInviteChannelModal(false);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      console.log(e);
      const formData = new FormData();
      if (e.dataTransfer.items) {
        // Use DataTransferItemList interface to access the file(s)
        for (let i = 0; i < e.dataTransfer.items.length; i++) {
          // If dropped items aren't files, reject them
          if (e.dataTransfer.items[i].kind === 'file') {
            const file = e.dataTransfer.items[i].getAsFile();
            console.log(e, '.... file[' + i + '].name = ' + file?.name);
            if (file) {
              formData.append('image', file);
            }
          }
        }
      } else {
        // Use DataTransfer interface to access the file(s)
        for (let i = 0; i < e.dataTransfer.files.length; i++) {
          console.log(e, '... file[' + i + '].name = ' + e.dataTransfer.files[i].name);
          formData.append('image', e.dataTransfer.files[i]);
        }
      }
      axios.post(`/api/workspaces/${workspace}/channels/${channel}/images`, formData).then(() => {
        setDragOver(false);
      });
    },
    [workspace, channel],
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    console.log(e);
    setDragOver(true);
  }, []);

  if (!myData) {
    return null;
  }

  const chatSections = makeSection(chatData ? chatData.flat().reverse() : []);

  return (
    <Container onDrop={onDrop} onDragOver={onDragOver}>
      <Header>
        <span>#{channel}</span>
        <div className="header-right">
          <span>{channelMembersData?.length}</span>
          <button
            className="c-button-unstyled p-ia__view_header__button"
            aria-label="Add people to #react-native"
            data-sk="tooltip_parent"
            type="button"
            onClick={onClickInviteChannel}
          >
            <i className="c-icon p-ia__view_header__button_icon c-icon--add-user" aria-hidden="true" />
          </button>
        </div>
      </Header>
      <ChatList
        chatSections={chatSections || []}
        ref={scrollbarRef}
        setSize={setSize}
        isEmpty={isEmpty}
        isReachingEnd={isReachingEnd}
      />
      <ChatBox onSubmitForm={onSubmitForm} chat={chat} onChangeChat={onChangeChat} />
      <InviteChannelModal
        show={showInviteChannelModal}
        onCloseModal={onCloseModal}
        setShowInviteChannelModal={setShowInviteChannelModal}
      />
      {dragOver && <DragOver>업로드!</DragOver>}
    </Container>
  );
};

export default Channel;
