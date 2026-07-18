import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, User, Save, Upload, Camera } from "lucide-react";
import { toast } from "sonner";

export const EditProfile = ({ onClose }: { onClose: () => void }) => {
  const [profile, setProfile] = useState({
    displayName: "Rohit Jangra",
    email: "rohit@example.com",
    avatarUrl: "",
    bio: ""
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("swiftpay_user_profile");
    if (saved) {
      setProfile(JSON.parse(saved));
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("swiftpay_user_profile", JSON.stringify(profile));
    toast.success("Profile updated successfully!");
    window.dispatchEvent(new Event("profile_updated"));
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile({ ...profile, avatarUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="absolute inset-0 z-[80] bg-slate-950 flex flex-col animate-in slide-in-from-right-full duration-300">
      <div className="flex items-center gap-4 p-6 border-b border-slate-800">
        <button 
          onClick={onClose}
          className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center hover:bg-slate-800 transition-colors border border-slate-700/50 shrink-0"
        >
          <ArrowLeft className="w-5 h-5 text-slate-400" />
        </button>
        <h2 className="text-xl font-bold text-white">Edit Profile</h2>
      </div>

      <div className="p-6 overflow-y-auto pb-24">
        <div className="flex flex-col items-center mb-8">
          <input
            type="file"
            accept="image/*"
            capture="user"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
          />
          <div 
            onClick={triggerFileInput}
            className="w-24 h-24 bg-indigo-900/50 rounded-full border-2 border-indigo-500/30 flex items-center justify-center mb-4 relative overflow-hidden group cursor-pointer"
          >
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="w-10 h-10 text-indigo-400" />
            )}
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-xs text-slate-400">Tap to upload or take a photo</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Display Name</label>
            <input 
              type="text" 
              value={profile.displayName}
              onChange={e => setProfile({...profile, displayName: e.target.value})}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Email Address</label>
            <input 
              type="email" 
              value={profile.email}
              onChange={e => setProfile({...profile, email: e.target.value})}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Bio</label>
            <textarea 
              value={profile.bio}
              onChange={e => setProfile({...profile, bio: e.target.value})}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors resize-none h-24"
              placeholder="Tell us about yourself..."
            ></textarea>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 bg-slate-950/80 backdrop-blur-md border-t border-slate-800">
        <button 
          onClick={handleSave}
          className="w-full bg-indigo-600 hover:bg-indigo-500 transition-colors py-4 rounded-xl text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
        >
          <Save className="w-5 h-5" />
          Save Changes
        </button>
      </div>
    </div>
  );
};
