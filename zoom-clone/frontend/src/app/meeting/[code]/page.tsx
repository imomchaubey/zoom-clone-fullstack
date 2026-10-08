'use client';
import { useState, useEffect, use, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import MeetingRoom from '@/components/MeetingRoom';

function MeetingFlow({ paramsPromise }: { paramsPromise: Promise<{ code: string }> }) {
  const { code } = use(paramsPromise);
  const searchParams = useSearchParams();
  
  const [joined, setJoined] = useState(false);
  const [displayName, setDisplayName] = useState(searchParams.get('name') || 'Om Prakash Chaubey');
  const [isValidating, setIsValidating] = useState(true);
  
  // Create a reference to attach the camera stream to the HTML video element
  const videoRef = useRef<HTMLVideoElement>(null);

  // Validate meeting
  useEffect(() => {
    const timer = setTimeout(() => setIsValidating(false), 500);
    return () => clearTimeout(timer);
  }, [code]);

  // Request camera and microphone access when on the Pre-Join screen
  useEffect(() => {
    let mediaStream: MediaStream | null = null;

    if (!isValidating && !joined) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((stream) => {
          mediaStream = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          console.error("Error accessing media devices.", err);
        });
    }

    // Cleanup: turn off the camera when the component unmounts or user joins
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isValidating, joined]);

  if (isValidating) {
    return (
      <div className="h-screen bg-[#1A1A1A] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-[#0B5CFF] border-t-transparent rounded-full animate-spin"></div>
          <p>Connecting...</p>
        </div>
      </div>
    );
  }

  if (!joined) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Join Meeting</h2>
          
          {/* Active Camera Preview */}
          <div className="bg-gray-900 aspect-video rounded-lg mb-6 flex items-center justify-center border border-gray-200 relative overflow-hidden">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover transform scale-x-[-1]" 
            />
          </div>
          
          <form onSubmit={(e) => { e.preventDefault(); setJoined(true); }}>
            <input 
              type="text" 
              required
              placeholder="Enter your name" 
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-300 mb-4 focus:ring-2 focus:ring-[#0B5CFF] outline-none text-black"
            />
            
            <div className="flex flex-col gap-3 mb-6 text-sm text-gray-600 text-left px-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded text-[#0B5CFF]" /> 
                Do not connect to audio
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded text-[#0B5CFF]" /> 
                Turn off my video
              </label>
            </div>

            <button 
              type="submit"
              disabled={!displayName.trim()}
              className="w-full bg-[#0B5CFF] text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-lg shadow-sm"
            >
              Join
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <MeetingRoom code={code} />;
}

// The main page export wrapping the flow in Suspense
export default function MeetingPage({ params }: { params: Promise<{ code: string }> }) {
  return (
    <Suspense fallback={
      <div className="h-screen bg-[#1A1A1A] flex items-center justify-center text-white">
        <div className="w-8 h-8 border-4 border-[#0B5CFF] border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <MeetingFlow paramsPromise={params} />
    </Suspense>
  );
}