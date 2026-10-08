'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function MeetingRoom({ code }: { code: string }) {
  const [showParticipants, setShowParticipants] = useState(true);
  
  // Mock participant list for UI structure
  const [participants, setParticipants] = useState([
    { id: 1, name: 'Om Prakash Chaubey', isHost: true, muted: false, videoOn: true },
    { id: 2, name: 'Alice Smith', isHost: false, muted: false, videoOn: true },
    { id: 3, name: 'Bob Johnson', isHost: false, muted: true, videoOn: false },
    { id: 4, name: 'Charlie Davis', isHost: false, muted: false, videoOn: true },
  ]);

  const muteAll = () => {
    setParticipants(participants.map(p => p.isHost ? p : { ...p, muted: true }));
  };

  const removeParticipant = (id: number) => {
    setParticipants(participants.filter(p => p.id !== id));
  };

  const toggleMute = (id: number) => {
    setParticipants(participants.map(p => p.id === id ? { ...p, muted: !p.muted } : p));
  };

  return (
    <div className="h-screen flex flex-col bg-[#1A1A1A] text-white overflow-hidden">
      
      {/* Top Header */}
      <div className="h-10 bg-[#222222] flex items-center justify-between px-4 text-xs text-gray-300 border-b border-[#333333]">
        <div className="flex items-center gap-4">
          <span className="text-green-500 font-bold">🛡️</span>
          <span>Zoom Meeting</span>
        </div>
        <div className="font-mono bg-[#111111] px-3 py-1 rounded">
           ID: {code}
        </div>
        <div>
           <button className="bg-[#333333] px-3 py-1 rounded hover:bg-[#444444] transition-colors">View</button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Video Grid */}
        <div className="flex-1 p-2 grid grid-cols-2 gap-2 auto-rows-fr bg-black">
          {participants.map(p => (
            <div key={p.id} className="bg-[#222222] rounded-lg border border-[#333333] flex items-center justify-center relative overflow-hidden group">
              
              {p.videoOn ? (
                <div className="w-full h-full bg-[#111111] flex items-center justify-center">
                    <span className="text-gray-500 text-sm italic">Video Feed Active</span>
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full bg-[#0B5CFF] flex items-center justify-center text-4xl font-bold shadow-lg">
                  {p.name.charAt(0)}
                </div>
              )}
              
              {/* Participant Name Badge */}
              <div className="absolute bottom-2 left-2 bg-black/70 px-3 py-1 rounded text-sm flex items-center gap-2 shadow">
                {p.muted && <span className="text-red-500">🔇</span>}
                <span className="font-medium">{p.name}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Participants Side Panel */}
        {showParticipants && (
          <div className="w-80 bg-white text-black flex flex-col border-l border-gray-300 shadow-xl z-10">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <span className="font-semibold text-gray-800 text-lg">Participants ({participants.length})</span>
              <button onClick={() => setShowParticipants(false)} className="text-gray-500 hover:text-gray-800">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2">
              {participants.map(p => (
                <div key={p.id} className="flex justify-between items-center p-3 hover:bg-blue-50 rounded-lg group transition-colors">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                        {p.name.charAt(0)}
                     </div>
                     <span className="text-sm font-medium text-gray-700">{p.name} {p.isHost && <span className="text-xs text-gray-500 font-normal">(Host)</span>}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!p.isHost && (
                      <button onClick={() => removeParticipant(p.id)} className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors">Remove</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 border-t border-gray-200 flex justify-center bg-gray-50">
              <button onClick={muteAll} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 w-full transition-colors shadow-sm">
                Mute All
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Control Bar */}
      <div className="h-16 bg-[#222222] border-t border-[#111111] flex items-center justify-between px-6 shadow-lg z-20">
        
        {/* Left Controls */}
        <div className="flex gap-2">
          <button 
             onClick={() => toggleMute(1)}
             className={`flex flex-col items-center justify-center w-14 h-14 rounded-lg transition-colors ${participants[0].muted ? 'text-red-500 hover:bg-[#333333]' : 'text-gray-300 hover:bg-[#333333]'}`}
          >
            <span className="text-xl mb-1">{participants[0].muted ? '🔇' : '🎤'}</span>
            <span className="text-[10px]">Mute</span>
          </button>
          
          <button className="flex flex-col items-center justify-center w-14 h-14 rounded-lg text-gray-300 hover:bg-[#333333] transition-colors">
            <span className="text-xl mb-1">📷</span>
            <span className="text-[10px]">Stop Video</span>
          </button>
        </div>
        
        {/* Center Controls */}
        <div className="flex gap-2">
          <button 
            onClick={() => setShowParticipants(!showParticipants)}
            className={`flex flex-col items-center justify-center w-16 h-14 rounded-lg transition-colors ${showParticipants ? 'bg-[#333333] text-white' : 'text-gray-300 hover:bg-[#333333]'}`}
          >
            <span className="text-xl mb-1">👥</span>
            <span className="text-[10px]">Participants</span>
          </button>
          
          <button className="flex flex-col items-center justify-center w-16 h-14 rounded-lg text-green-500 hover:bg-[#333333] transition-colors">
            <span className="text-xl mb-1">⬆️</span>
            <span className="text-[10px]">Share Screen</span>
          </button>
          
          <button className="flex flex-col items-center justify-center w-16 h-14 rounded-lg text-gray-300 hover:bg-[#333333] transition-colors">
            <span className="text-xl mb-1">💬</span>
            <span className="text-[10px]">Chat</span>
          </button>
        </div>
        
        {/* Right Controls */}
        <div>
          <Link href="/">
             <button className="bg-[#E02828] px-5 py-2 rounded-lg font-semibold hover:bg-red-700 text-sm shadow-md transition-colors">
               End
             </button>
          </Link>
        </div>
      </div>
    </div>
  );
}