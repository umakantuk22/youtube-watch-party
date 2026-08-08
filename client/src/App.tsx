import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SocketProvider } from './context/SocketContext';
import { RoomProvider } from './context/RoomContext';
import { LobbyPage } from './pages/LobbyPage';
import { RoomPage } from './pages/RoomPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <SocketProvider>
        <RoomProvider>
          <Routes>
            <Route path="/" element={<LobbyPage />} />
            <Route path="/room" element={<RoomPage />} />
          </Routes>
        </RoomProvider>
      </SocketProvider>
    </BrowserRouter>
  );
};

export default App;
