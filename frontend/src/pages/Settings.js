import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API, AuthContext } from '../App';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Separator } from '../components/ui/separator';
import { toast } from 'sonner';
import { Save, Bell, Shield, Info } from 'lucide-react';

const Settings = () => {
  const { user, setUser } = useContext(AuthContext);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    age: '',
    gender: '',
    timezone: ''
  });
  const [preferences, setPreferences] = useState({
    medication_reminders: true,
    daily_tips: true,
    travel_alerts: true
  });
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        age: user.age?.toString() || '',
        gender: user.gender || '',
        timezone: user.timezone || 'UTC'
      });
    }
    fetchPreferences();
    fetchNotifications();
  }, [user]);

  const fetchPreferences = async () => {
    try {
      const response = await axios.get(`${API}/notifications/preferences`);
      setPreferences(response.data);
    } catch (error) {
      console.error('Failed to load preferences');
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${API}/notifications`);
      setNotifications(response.data);
    } catch (error) {
      console.error('Failed to load notifications');
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: profileData.name,
        age: profileData.age ? parseInt(profileData.age) : null,
        gender: profileData.gender,
        timezone: profileData.timezone
      };
      const response = await axios.put(`${API}/auth/me`, payload);
      setUser(response.data);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handlePreferencesSave = async () => {
    try {
      await axios.put(`${API}/notifications/preferences`, preferences);
      toast.success('Preferences saved');
    } catch (error) {
      toast.error('Failed to save preferences');
    }
  };

  const handleTestNotification = async () => {
    try {
      await axios.post(`${API}/notifications/test`);
      toast.success('🔔 Medication Reminder: Your dose is due in 2 hours.');
      fetchNotifications();
    } catch (error) {
      toast.error('Failed to send test notification');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-gray-600">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8" data-testid="settings-page">
      <div>
        <h1 className="text-4xl font-bold text-gray-800" data-testid="settings-title">Settings Center</h1>
        <p className="text-gray-600 mt-2">Manage your account and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Information */}
          <div className="bg-white rounded-2xl p-6 shadow-lg" data-testid="profile-section">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-gradient-to-br from-blue-100 to-teal-100 p-2 rounded-lg">
                <Info className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Profile Information</h2>
            </div>
            <form onSubmit={handleProfileSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  data-testid="profile-name-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={profileData.email}
                  disabled
                  className="bg-gray-50"
                  data-testid="profile-email-input"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={profileData.age}
                    onChange={(e) => setProfileData({ ...profileData, age: e.target.value })}
                    data-testid="profile-age-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Input
                    id="gender"
                    value={profileData.gender}
                    onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}
                    data-testid="profile-gender-input"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Input
                  id="timezone"
                  value={profileData.timezone}
                  onChange={(e) => setProfileData({ ...profileData, timezone: e.target.value })}
                  data-testid="profile-timezone-input"
                />
              </div>
              <Button type="submit" className="w-full" data-testid="save-profile-button">
                <Save className="w-4 h-4 mr-2" />
                Save Profile
              </Button>
            </form>
          </div>

          {/* Privacy & Security */}
          <div className="bg-white rounded-2xl p-6 shadow-lg" data-testid="privacy-section">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-gradient-to-br from-purple-100 to-indigo-100 p-2 rounded-lg">
                <Shield className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Privacy & Security</h2>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Change Password</h3>
                <p className="text-sm text-gray-600 mb-3">Update your password to keep your account secure</p>
                <Button variant="outline" data-testid="change-password-button">Change Password</Button>
              </div>
              <Separator />
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Privacy Policy</h3>
                <p className="text-sm text-gray-600 mb-3">Review our privacy policy and data handling practices</p>
                <Button variant="outline" data-testid="view-privacy-policy-button">View Privacy Policy</Button>
              </div>
              <Separator />
              <div>
                <h3 className="font-medium text-red-600 mb-2">Delete Account</h3>
                <p className="text-sm text-gray-600 mb-3">Permanently delete your account and all data</p>
                <Button variant="outline" className="text-red-600 hover:bg-red-50" data-testid="delete-account-button">Delete Account</Button>
              </div>
            </div>
          </div>

          {/* About */}
          <div className="bg-gradient-to-br from-blue-500 to-teal-500 rounded-2xl p-6 shadow-lg text-white" data-testid="about-section">
            <h2 className="text-xl font-bold mb-3">About OneBioCircle</h2>
            <p className="text-blue-100 leading-relaxed">
              OneBioCircle is your comprehensive digital health companion, designed to help you manage 
              medications, track nutrition, plan workouts, and access healthcare services seamlessly. 
              Our mission is to empower you to take control of your health journey.
            </p>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Notification Preferences */}
          <div className="bg-white rounded-2xl p-6 shadow-lg" data-testid="notification-preferences-section">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-gradient-to-br from-amber-100 to-orange-100 p-2 rounded-lg">
                <Bell className="w-5 h-5 text-amber-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Notification Preferences</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">Medication Reminders</p>
                  <p className="text-xs text-gray-500">Get notified for doses</p>
                </div>
                <Switch
                  checked={preferences.medication_reminders}
                  onCheckedChange={(checked) => setPreferences({ ...preferences, medication_reminders: checked })}
                  data-testid="medication-reminders-toggle"
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">Daily Health Tips</p>
                  <p className="text-xs text-gray-500">Receive daily wellness tips</p>
                </div>
                <Switch
                  checked={preferences.daily_tips}
                  onCheckedChange={(checked) => setPreferences({ ...preferences, daily_tips: checked })}
                  data-testid="daily-tips-toggle"
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">Travel Alerts</p>
                  <p className="text-xs text-gray-500">Timezone adjustment alerts</p>
                </div>
                <Switch
                  checked={preferences.travel_alerts}
                  onCheckedChange={(checked) => setPreferences({ ...preferences, travel_alerts: checked })}
                  data-testid="travel-alerts-toggle"
                />
              </div>
              <Button onClick={handlePreferencesSave} className="w-full mt-4" data-testid="save-preferences-button">
                <Save className="w-4 h-4 mr-2" />
                Save Preferences
              </Button>
              <Button onClick={handleTestNotification} variant="outline" className="w-full" data-testid="send-test-notification-button">
                Send Test Notification
              </Button>
            </div>
          </div>

          {/* Notification History */}
          <div className="bg-white rounded-2xl p-6 shadow-lg" data-testid="notification-history-section">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Notification History</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4" data-testid="no-notifications-message">No notifications yet</p>
              ) : (
                notifications.slice(0, 10).map((notif) => (
                  <div key={notif.id} className="p-3 bg-gray-50 rounded-lg" data-testid={`notification-${notif.id}`}>
                    <p className="text-sm text-gray-800">{notif.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(notif.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
