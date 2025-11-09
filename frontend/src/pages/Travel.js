import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../App';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { Plus, Plane, MapPin, Calendar, Clock, Trash2 } from 'lucide-react';

const Travel = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    destination: '',
    start_date: '',
    end_date: '',
    timezone: ''
  });

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const response = await axios.get(`${API}/trips`);
      setTrips(response.data);
    } catch (error) {
      toast.error('Failed to load trips');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/trips`, formData);
      toast.success('Trip added successfully');
      fetchTrips();
      resetForm();
      setDialogOpen(false);
    } catch (error) {
      toast.error('Failed to add trip');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this trip?')) return;
    try {
      await axios.delete(`${API}/trips/${id}`);
      toast.success('Trip deleted');
      fetchTrips();
    } catch (error) {
      toast.error('Failed to delete trip');
    }
  };

  const resetForm = () => {
    setFormData({
      destination: '',
      start_date: '',
      end_date: '',
      timezone: ''
    });
  };

  return (
    <div className="p-8 space-y-8" data-testid="travel-page">
      <div>
        <h1 className="text-4xl font-bold text-gray-800" data-testid="travel-title">Travel Wellness</h1>
        <p className="text-gray-600 mt-2">Manage medications across timezones</p>
      </div>

      {/* Smart Timezone Adjustment Card */}
      <div className="bg-gradient-to-br from-blue-500 to-teal-500 rounded-2xl p-8 shadow-lg text-white" data-testid="timezone-adjustment-card">
        <div className="flex items-start space-x-4">
          <div className="bg-white bg-opacity-20 p-3 rounded-xl">
            <Clock className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-3">Smart Timezone Adjustment</h2>
            <p className="text-blue-100 leading-relaxed">
              When you add a travel plan, OneBioCircle automatically adjusts your medication reminders 
              to match the new timezone. Your health routine stays consistent wherever you go!
            </p>
          </div>
        </div>
      </div>

      {/* Trips Section */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800" data-testid="trips-section-title">Your Travel Plans</h2>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-500 to-teal-500 text-white" data-testid="add-trip-button">
                <Plus className="w-4 h-4 mr-2" />
                Add Trip
              </Button>
            </DialogTrigger>
            <DialogContent data-testid="add-trip-dialog">
              <DialogHeader>
                <DialogTitle>Add Travel Plan</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="destination">Destination</Label>
                  <Input
                    id="destination"
                    placeholder="e.g., Paris, France"
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    required
                    data-testid="trip-destination-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                    data-testid="trip-start-date-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    required
                    data-testid="trip-end-date-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Input
                    id="timezone"
                    placeholder="e.g., Europe/Paris or UTC+1"
                    value={formData.timezone}
                    onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                    required
                    data-testid="trip-timezone-input"
                  />
                </div>
                <Button type="submit" className="w-full" data-testid="save-trip-button">
                  Save Trip
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading trips...</div>
        ) : trips.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-lg" data-testid="trips-empty-state">
            <div className="text-6xl mb-4">✈️</div>
            <p className="text-xl text-gray-600 mb-2">No travel plans yet.</p>
            <p className="text-gray-500">Add your upcoming trips to manage medications across timezones.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="trips-list">
            {trips.map((trip) => (
              <div key={trip.id} className="bg-white rounded-2xl p-6 shadow-lg card-hover" data-testid={`trip-card-${trip.id}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-gradient-to-br from-blue-100 to-teal-100 p-3 rounded-xl">
                    <Plane className="w-6 h-6 text-blue-600" />
                  </div>
                  <Button
                    onClick={() => handleDelete(trip.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:bg-red-50"
                    data-testid={`delete-trip-${trip.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4" data-testid={`trip-destination-${trip.id}`}>{trip.destination}</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span data-testid={`trip-dates-${trip.id}`}>{trip.start_date} to {trip.end_date}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    <span data-testid={`trip-timezone-${trip.id}`}>Timezone: {trip.timezone}</span>
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-800">
                      ✅ Medication reminders will be automatically adjusted for this timezone
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Travel;
