import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../App';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  Pill, 
  Flame, 
  Utensils, 
  Moon, 
  Clock, 
  Lightbulb,
  Plus,
  Camera,
  Dumbbell,
  Video
} from 'lucide-react';
import { toast } from 'sonner';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/dashboard/stats`);
      setStats(response.data);
    } catch (error) {
      toast.error('Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8" data-testid="dashboard">
      <div>
        <h1 className="text-4xl font-bold text-gray-800" data-testid="dashboard-title">OneBioCircle Dashboard</h1>
        <p className="text-gray-600 mt-2" data-testid="dashboard-subtitle">Welcome back! Here's your health overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Active Medications */}
        <div className="bg-white rounded-2xl p-6 shadow-lg card-hover" data-testid="active-medications-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Medications</p>
              <p className="text-3xl font-bold text-gray-800 mt-2" data-testid="active-medications-count">{stats?.active_medications || 0}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-100 to-teal-100 p-3 rounded-xl">
              <Pill className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Calories Today */}
        <div className="bg-white rounded-2xl p-6 shadow-lg card-hover" data-testid="calories-today-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Calories Today</p>
              <p className="text-3xl font-bold text-gray-800 mt-2" data-testid="calories-today-count">{stats?.calories_today || 0}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-100 to-red-100 p-3 rounded-xl">
              <Flame className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Meals Logged */}
        <div className="bg-white rounded-2xl p-6 shadow-lg card-hover" data-testid="meals-logged-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Meals Logged</p>
              <p className="text-3xl font-bold text-gray-800 mt-2" data-testid="meals-logged-count">{stats?.meals_logged || 0}</p>
            </div>
            <div className="bg-gradient-to-br from-green-100 to-teal-100 p-3 rounded-xl">
              <Utensils className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Rest & Recovery */}
        <div className="bg-white rounded-2xl p-6 shadow-lg card-hover" data-testid="rest-recovery-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rest & Recovery</p>
              <p className="text-lg font-medium text-gray-800 mt-2">7.5 hours sleep</p>
            </div>
            <div className="bg-gradient-to-br from-purple-100 to-indigo-100 p-3 rounded-xl">
              <Moon className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Next Medication */}
        <div className="bg-gradient-to-br from-blue-500 to-teal-500 rounded-2xl p-6 shadow-lg card-hover text-white" data-testid="next-medication-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-blue-100">Next Medication</p>
              <p className="text-lg font-medium mt-1">
                {stats?.next_medication ? stats.next_medication.name : 'No medications'}
              </p>
            </div>
            <Clock className="w-8 h-8 text-white" />
          </div>
          <Button
            onClick={() => navigate('/medications')}
            className="w-full bg-white text-blue-600 hover:bg-blue-50"
            data-testid="add-medication-button"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Medication
          </Button>
        </div>

        {/* Daily Health Tip */}
        <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-6 shadow-lg card-hover text-white" data-testid="health-tip-card">
          <div className="flex items-start space-x-3">
            <Lightbulb className="w-6 h-6 mt-1" />
            <div>
              <p className="text-sm text-amber-100 font-medium">Daily Health Tip</p>
              <p className="text-sm mt-2" data-testid="health-tip-text">{stats?.health_tip}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h2 className="text-xl font-bold text-gray-800 mb-4" data-testid="quick-actions-title">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button
            onClick={() => navigate('/medications')}
            className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white h-auto py-6 flex-col space-y-2"
            data-testid="quick-action-add-medication"
          >
            <Plus className="w-6 h-6" />
            <span>Add Medication</span>
          </Button>

          <Button
            onClick={() => navigate('/nutrition')}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white h-auto py-6 flex-col space-y-2"
            data-testid="quick-action-scan-food"
          >
            <Camera className="w-6 h-6" />
            <span>Scan Food</span>
          </Button>

          <Button
            onClick={() => navigate('/workouts')}
            className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white h-auto py-6 flex-col space-y-2"
            data-testid="quick-action-view-workout"
          >
            <Dumbbell className="w-6 h-6" />
            <span>View Workout</span>
          </Button>

          <Button
            onClick={() => navigate('/tele-consultation')}
            className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white h-auto py-6 flex-col space-y-2"
            data-testid="quick-action-start-consultation"
          >
            <Video className="w-6 h-6" />
            <span>Start Tele-Consultation</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
