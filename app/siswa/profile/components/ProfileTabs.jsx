'use client';

import { useState } from 'react';
import ProfileInfo from './ProfileInfo';
import CalendarView from './CalendarView';
import UserSetting from './UserSetting';

export default function ProfileTabs({ userProfile, borrowings }) {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profil', icon: '👤' },
    { id: 'calendar', label: 'Kalender', icon: '📅' },
    { id: 'setting', label: 'Setting', icon: '⚙️' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 transition-colors duration-300">
      {/* Tabs Navigation */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 px-6 md:px-8 py-5">
        <div className="flex gap-2 md:gap-3 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 md:px-7 py-3 md:py-3.5 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 md:gap-3 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-gray-200 hover:bg-gray-800 dark:hover:bg-gray-700'
              }`}
            >
              <span className="text-lg md:text-xl">{tab.icon}</span>
              <span className="text-sm md:text-base">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6 md:p-10 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 transition-colors duration-300">
        {activeTab === 'profile' && (
          <ProfileInfo userProfile={userProfile} />
        )}
        {activeTab === 'calendar' && (
          <CalendarView borrowings={borrowings} />
        )}
        {activeTab === 'setting' && (
          <UserSetting userProfile={userProfile} />
        )}
      </div>
    </div>
  );
}

