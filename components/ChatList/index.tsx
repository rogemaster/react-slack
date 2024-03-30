import React, { forwardRef, MutableRefObject, useCallback, useRef } from 'react';
import { ChatZone, Section, StickyHeader } from '@components/ChatList/style';
import { IChat, IDM } from "@typings/db";
import Chat from '@components/Chat';
import { positionValues, Scrollbars } from 'react-custom-scrollbars-2';

interface IChatListProps {
  chatSections: { [key: string]: (IDM | IChat)[] };
  setSize: (index: (size: number) => number) => Promise<(IDM | IChat)[][] | undefined>;
  isEmpty: boolean;
  isReachingEnd: boolean;
}

const ChatList = forwardRef<Scrollbars, IChatListProps>(
  ({ chatSections, setSize, isReachingEnd, isEmpty }, scrollRef) => {
    const onScroll = useCallback(
      (values: positionValues) => {
        if (values.scrollTop === 0 && !isReachingEnd) {
          console.log('위');
          setSize((prevSize) => prevSize + 1).then(() => {
            const current = (scrollRef as MutableRefObject<Scrollbars>)?.current;
            if (current) {
              current.scrollTop(current.getScrollHeight() - values.scrollHeight);
            }
          });
        }
      },
      [isReachingEnd],
    );

    return (
      <ChatZone>
        <Scrollbars autoHide ref={scrollRef} onScrollFrame={onScroll}>
          {Object.entries(chatSections).map(([date, chats]) => {
            return (
              <Section className={`section-${date}`} key={date}>
                <StickyHeader>
                  <button>{date}</button>
                </StickyHeader>
                {chats.map((chat) => (
                  <Chat key={chat.id} data={chat} />
                ))}
              </Section>
            );
          })}
        </Scrollbars>
      </ChatZone>
    );
  },
);

export default ChatList;
