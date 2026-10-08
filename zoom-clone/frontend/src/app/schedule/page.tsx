'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SchedulePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<{ id: string; url: string } | null>(null);

  const [formData, setFormData] = useState({
    title: 'My Personal Meeting Room',
    description: '',
    date: '', // Starts empty to prevent server/client hydration mismatch
    time: '12:00',
    duration: '40',
  });

  // Set the current date only after the component mounts on the client
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      date: new Date().toISOString().split('T')[0]
    }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      setTimeout(() => {
        const mockMeetingCode = Math.floor(10000000000 + Math.random() * 90000000000).toString();
        setSuccessData({
          id: mockMeetingCode,
          url: `http://localhost:3000/meeting/${mockMeetingCode}`
        });
        setIsSubmitting(false);
      }, 800);
    } catch (error) {
      console.error('Failed to schedule meeting', error);
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = () => {
    if (successData) {
      const inviteText = `You have been invited to a scheduled Zoom meeting.\n\nTopic: ${formData.title}\nTime: ${formData.date} ${formData.time}\n\nJoin Zoom Meeting\n${successData.url}\n\nMeeting ID: ${successData.id}`;
      navigator.clipboard.writeText(inviteText);
      alert('Invitation copied to clipboard!');
    }
  };

  if (successData) {
    return (
      <div className="h-full w-full bg-gray-50 py-10 px-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-lg w-full text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <h2 className="text-2xl font-semibold mb-2">Meeting Scheduled!</h2>
          <p className="text-gray-600 mb-6">Your meeting has been successfully created.</p>
          
          <div className="bg-gray-50 p-4 rounded-lg text-left mb-6 border border-gray-200">
            <p className="font-medium text-gray-800 mb-1">Topic: <span className="font-normal text-gray-600">{formData.title}</span></p>
            <p className="font-medium text-gray-800 mb-1">Time: <span className="font-normal text-gray-600">{formData.date} at {formData.time}</span></p>
            <p className="font-medium text-gray-800 mb-3">Meeting ID: <span className="font-normal text-gray-600">{successData.id}</span></p>
            <div className="flex items-center gap-2">
              <input type="text" readOnly value={successData.url} className="w-full text-sm bg-white border border-gray-300 p-2 rounded outline-none" />
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <Link href="/" className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors">
              Back to Home
            </Link>
            <button onClick={copyToClipboard} className="px-6 py-2 bg-[#0B5CFF] text-white rounded-lg hover:bg-blue-700 font-medium transition-colors">
              Copy Invitation
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-800">Schedule Meeting</h1>
          <Link href="/" className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="flex gap-4 items-start">
            <label className="w-32 pt-2 text-sm font-medium text-gray-700">Topic</label>
            <input 
              type="text" 
              required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="flex-1 border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#0B5CFF] focus:border-transparent outline-none" 
            />
          </div>

          <div className="flex gap-4 items-start">
            <label className="w-32 pt-2 text-sm font-medium text-gray-700">Description <span className="text-gray-400 font-normal">(Optional)</span></label>
            <textarea 
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="flex-1 border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#0B5CFF] focus:border-transparent outline-none resize-none" 
              rows={3}
            />
          </div>

          <div className="flex gap-4 items-start">
            <label className="w-32 pt-2 text-sm font-medium text-gray-700">Time</label>
            <div className="flex-1 grid grid-cols-2 gap-4">
              <input 
                type="date" 
                required
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#0B5CFF] focus:border-transparent outline-none" 
              />
              <input 
                type="time" 
                required
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
                className="border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#0B5CFF] focus:border-transparent outline-none" 
              />
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <label className="w-32 pt-2 text-sm font-medium text-gray-700">Duration</label>
            <select 
              value={formData.duration}
              onChange={(e) => setFormData({...formData, duration: e.target.value})}
              className="w-48 border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#0B5CFF] focus:border-transparent outline-none bg-white"
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="40">40 minutes</option>
              <option value="60">1 hour</option>
              <option value="120">2 hours</option>
            </select>
          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
            <Link href="/" className="px-6 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 font-medium transition-colors">
              Cancel
            </Link>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-[#0B5CFF] text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}