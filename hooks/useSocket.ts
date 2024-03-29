import React, { useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const backUrl = 'http://localhost:3095';

const sockets: { [key: string]: Socket } = {};

const useSocket = (workspace?: string): [Socket | undefined, () => void] => {
  const disconnect = useCallback(() => {
    if (workspace) {
      sockets[workspace].disconnect();
      delete sockets[workspace];
    }
  }, [workspace]);

  if (!workspace) {
    return [undefined, disconnect];
  }

  if (!sockets[workspace]) {
    sockets[workspace] = io(`${backUrl}/ws-${workspace}`, {
      transports: ['websocket'],
    });

    console.log('sockets', sockets);
  }


  // sockets[workspace].on('hello', (args) => {
  //   console.log(args);
  // });

  // sockets[workspace].emit('world');

  return [sockets[workspace], disconnect];
};

export default useSocket;
