'use client';

import { useState, useEffect } from 'react';
import { Settings, Key, Bell, Moon, Sun, Globe, Save, Type } from 'lucide-react';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useFontSize } from '@/contexts/FontSizeContext';
import { t } from '@/lib/translations';
import ChangePasswordForm from './ChangePasswordForm';

export default function UserSetting({ userProfile }) {
  const { darkMode, toggleDarkMode } = useDarkMode();
  const { language, changeLanguage } = useLanguage();
  const { fontSize, changeFontSize } = useFontSize();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    borrowReminders: true,
    overdueAlerts: true,
    newRequests: true
  });

  const [generalSettings, setGeneralSettings] = useState({
    language: language,
    timezone: 'WIB',
    dateFormat: 'dd/mm/yyyy',
    fontSize: fontSize
  });

  useEffect(() => {
    setGeneralSettings({
      ...generalSettings,
      language: language,
      fontSize: fontSize
    });
  }, [language, fontSize]);

  const handleGeneralSave = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Save language and font size
      changeLanguage(generalSettings.language);
      changeFontSize(generalSettings.fontSize);
      
      // Save other settings
      localStorage.setItem('generalSettings', JSON.stringify({
        timezone: generalSettings.timezone,
        dateFormat: generalSettings.dateFormat
      }));
      
      setMessage({ type: 'success', text: t('settingsSaved', language) });
    } catch (error) {
      setMessage({ type: 'error', text: t('errorOccurred', language) });
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationSave = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      localStorage.setItem('notificationSettings', JSON.stringify(notificationSettings));
      setMessage({ type: 'success', text: t('settingsSaved', language) });
    } catch (error) {
      setMessage({ type: 'error', text: t('errorOccurred', language) });
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'general', label: t('general', language), icon: Settings },
    { id: 'security', label: t('security', language), icon: Key },
    { id: 'notifications', label: t('notifications', language), icon: Bell },
    { id: 'appearance', label: t('appearance', language), icon: Globe },
  ];

  return (
    <div>
      {/* Message */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-xl ${
          message.type === 'success'
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tabs */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-300 font-semibold border-l-4 border-blue-600 dark:border-blue-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
            {/* General Settings */}
            {activeTab === 'general' && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{t('general', language)}</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t('language', language)}
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{t('languageDesc', language)}</p>
                    <select 
                      value={generalSettings.language}
                      onChange={(e) => {
                        const newLang = e.target.value;
                        setGeneralSettings({ ...generalSettings, language: newLang });
                        changeLanguage(newLang);
                      }}
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    >
                      <option value="id">{t('indonesian', language)}</option>
                      <option value="en">{t('english', language)}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Zona Waktu
                    </label>
                    <select 
                      value={generalSettings.timezone}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, timezone: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    >
                      <option value="WIB">WIB (UTC+7)</option>
                      <option value="WITA">WITA (UTC+8)</option>
                      <option value="WIT">WIT (UTC+9)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Format Tanggal
                    </label>
                    <select 
                      value={generalSettings.dateFormat}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, dateFormat: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    >
                      <option value="dd/mm/yyyy">DD/MM/YYYY</option>
                      <option value="mm/dd/yyyy">MM/DD/YYYY</option>
                      <option value="yyyy-mm-dd">YYYY-MM-DD</option>
                    </select>
                  </div>
                  <button
                    onClick={handleGeneralSave}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    {loading ? 'Menyimpan...' : t('save', language)}
                  </button>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Keamanan</h3>
                {showPasswordForm ? (
                  <ChangePasswordForm onClose={() => setShowPasswordForm(false)} />
                ) : (
                  <div className="space-y-6">
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Ubah Password</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Ganti password Anda untuk menjaga keamanan akun</p>
                      <button
                        onClick={() => setShowPasswordForm(true)}
                        className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg"
                      >
                        Ubah Password
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Notifikasi</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Notifikasi Email</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Terima notifikasi melalui email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.emailNotifications}
                        onChange={(e) => setNotificationSettings({ ...notificationSettings, emailNotifications: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Pengingat Peminjaman</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Notifikasi sebelum jatuh tempo</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.borrowReminders}
                        onChange={(e) => setNotificationSettings({ ...notificationSettings, borrowReminders: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Peringatan Terlambat</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Notifikasi untuk peminjaman terlambat</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.overdueAlerts}
                        onChange={(e) => setNotificationSettings({ ...notificationSettings, overdueAlerts: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Permintaan Baru</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Notifikasi untuk permintaan peminjaman baru</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.newRequests}
                        onChange={(e) => setNotificationSettings({ ...notificationSettings, newRequests: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <button
                    onClick={handleNotificationSave}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    {loading ? 'Menyimpan...' : 'Simpan Pengaturan'}
                  </button>
                </div>
              </div>
            )}

            {/* Appearance Settings */}
            {activeTab === 'appearance' && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{t('appearance', language)}</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        {darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                        {darkMode ? t('darkMode', language) : t('lightMode', language)}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {language === 'id' 
                          ? 'Aktifkan mode gelap untuk kenyamanan mata'
                          : 'Enable dark mode for eye comfort'}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={darkMode}
                        onChange={toggleDarkMode}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <Type className="w-4 h-4" />
                      {t('fontSize', language)}
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{t('fontSizeDesc', language)}</p>
                    <select 
                      value={generalSettings.fontSize}
                      onChange={(e) => {
                        const newSize = e.target.value;
                        setGeneralSettings({ ...generalSettings, fontSize: newSize });
                        changeFontSize(newSize);
                      }}
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    >
                      <option value="small">{t('small', language)}</option>
                      <option value="medium">{t('medium', language)}</option>
                      <option value="large">{t('large', language)}</option>
                      <option value="extra-large">{t('extraLarge', language)}</option>
                    </select>
                    <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Preview:</p>
                      <p className={`text-${generalSettings.fontSize === 'small' ? 'sm' : generalSettings.fontSize === 'medium' ? 'base' : generalSettings.fontSize === 'large' ? 'lg' : 'xl'} text-gray-900 dark:text-white`}>
                        {language === 'id' 
                          ? 'Ini adalah contoh teks dengan ukuran font yang dipilih'
                          : 'This is a sample text with the selected font size'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

