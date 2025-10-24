import React, { useState, useEffect, useRef } from 'react';
import type { UserProfile } from '../../types';
import { UserIcon } from '../../constants';
import { CameraIcon } from './icons';

interface UserProfilePaneProps {
    profile: UserProfile | null;
    onSave: (profile: UserProfile) => void;
}

export const UserProfilePane: React.FC<UserProfilePaneProps> = ({ profile, onSave }) => {
    const [formData, setFormData] = useState({
        fullName: '',
        jobTitle: '',
        bio: '',
        avatar: '',
    });
    const [saved, setSaved] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (profile) {
            setFormData({
                fullName: profile.fullName || '',
                jobTitle: profile.jobTitle || '',
                bio: profile.bio || '',
                avatar: profile.avatar || '',
            });
        }
    }, [profile]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, avatar: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleSave = () => {
        if (profile) {
            onSave({
                ...profile,
                ...formData,
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        }
    };

    const commonInputClass = "w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md py-1.5 px-2 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500";
    const labelClass = "block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1";
    
    return (
        <div className="p-4 space-y-6">
            <div className="flex flex-col items-center">
                <div className="relative group">
                    <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center ring-4 ring-white dark:ring-slate-900">
                        {formData.avatar ? (
                             <img src={formData.avatar} alt="Avatar Preview" className="w-full h-full rounded-full object-cover" />
                        ) : (
                            <UserIcon className="w-12 h-12 text-slate-400 dark:text-slate-500" />
                        )}
                    </div>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Change profile picture"
                    >
                       <CameraIcon className="w-8 h-8"/>
                    </button>
                     <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png, image/jpeg, image/gif"
                        onChange={handleAvatarChange}
                        className="hidden"
                    />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">@{profile?.username}</p>
            </div>
            
            <div className="space-y-4">
                 <div>
                    <label htmlFor="profile-fullName" className={labelClass}>Full Name</label>
                    <input id="profile-fullName" name="fullName" type="text" value={formData.fullName} onChange={handleChange} className={commonInputClass} />
                </div>
                 <div>
                    <label htmlFor="profile-jobTitle" className={labelClass}>Job Title</label>
                    <input id="profile-jobTitle" name="jobTitle" type="text" value={formData.jobTitle} onChange={handleChange} className={commonInputClass} placeholder="e.g., Senior Project Manager" />
                </div>
                 <div>
                    <label htmlFor="profile-bio" className={labelClass}>Short Bio</label>
                    <textarea id="profile-bio" name="bio" value={formData.bio} onChange={handleChange} className={`${commonInputClass} h-24`} placeholder="A brief description about your role or yourself."></textarea>
                </div>
            </div>
            
            <button
                onClick={handleSave}
                className={`w-full text-sm font-semibold px-4 py-2 rounded-md transition-colors ${saved ? 'bg-green-600' : 'bg-indigo-600 hover:bg-indigo-700'} text-white`}
            >
                {saved ? 'Saved!' : 'Save Changes'}
            </button>
        </div>
    );
};