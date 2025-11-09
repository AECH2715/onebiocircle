import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API } from '../App';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { Camera, Plus, Flame, Utensils, ScanLine, Trash2 } from 'lucide-react';

const Nutrition = () => {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    calories: '',
    image_url: ''
  });
  const fileInputRef = useRef();

  useEffect(() => {
    fetchMeals();
  }, []);

  const fetchMeals = async () => {
    try {
      const response = await axios.get(`${API}/meals`);
      setMeals(response.data);
    } catch (error) {
      toast.error('Failed to load meals');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        calories: parseInt(formData.calories)
      };
      await axios.post(`${API}/meals`, payload);
      toast.success('Meal added successfully');
      fetchMeals();
      resetForm();
      setDialogOpen(false);
    } catch (error) {
      toast.error('Failed to add meal');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this meal?')) return;
    try {
      await axios.delete(`${API}/meals/${id}`);
      toast.success('Meal deleted');
      fetchMeals();
    } catch (error) {
      toast.error('Failed to delete meal');
    }
  };

  const handleScanFood = () => {
    toast.info('Food scanning feature (demo): Detected 450 calories');
    setFormData({
      name: 'Scanned Meal',
      calories: '450',
      image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      calories: '',
      image_url: ''
    });
  };

  const totalCalories = meals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
  const todayMeals = meals.filter(meal => {
    const mealDate = new Date(meal.meal_time);
    const today = new Date();
    return mealDate.toDateString() === today.toDateString();
  });

  return (
    <div className="p-8 space-y-8" data-testid="nutrition-page">
      <div>
        <h1 className="text-4xl font-bold text-gray-800" data-testid="nutrition-title">Nutrition & Food Scanner</h1>
        <p className="text-gray-600 mt-2">Track your daily nutrition and scan meals</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg" data-testid="calories-summary-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Today's Calories</p>
              <p className="text-3xl font-bold text-gray-800 mt-2" data-testid="total-calories">
                {todayMeals.reduce((sum, meal) => sum + (meal.calories || 0), 0)}
              </p>
            </div>
            <div className="bg-gradient-to-br from-orange-100 to-red-100 p-3 rounded-xl">
              <Flame className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg" data-testid="meals-logged-summary-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Meals Logged</p>
              <p className="text-3xl font-bold text-gray-800 mt-2" data-testid="meals-count">{todayMeals.length}</p>
            </div>
            <div className="bg-gradient-to-br from-green-100 to-teal-100 p-3 rounded-xl">
              <Utensils className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg" data-testid="total-scans-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Scans</p>
              <p className="text-3xl font-bold text-gray-800 mt-2" data-testid="scans-count">{meals.length}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-100 to-purple-100 p-3 rounded-xl">
              <ScanLine className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Food Scanner */}
      <div className="bg-gradient-to-br from-blue-500 to-teal-500 rounded-2xl p-8 shadow-lg text-white" data-testid="food-scanner-section">
        <h2 className="text-2xl font-bold mb-4">Scan Your Food</h2>
        <p className="text-blue-100 mb-6">Upload a photo to detect calories (demo feature)</p>
        <Button
          onClick={handleScanFood}
          className="bg-white text-blue-600 hover:bg-blue-50"
          data-testid="scan-food-button"
        >
          <Camera className="w-4 h-4 mr-2" />
          Upload & Scan
        </Button>
      </div>

      {/* Meals Log */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800" data-testid="meals-log-title">Meals Log</h2>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-green-500 to-teal-500 text-white" data-testid="add-meal-button">
                <Plus className="w-4 h-4 mr-2" />
                Add Meal
              </Button>
            </DialogTrigger>
            <DialogContent data-testid="add-meal-dialog">
              <DialogHeader>
                <DialogTitle>Add Meal</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Meal Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    data-testid="meal-name-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="calories">Calories</Label>
                  <Input
                    id="calories"
                    type="number"
                    value={formData.calories}
                    onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                    required
                    data-testid="meal-calories-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image_url">Image URL (optional)</Label>
                  <Input
                    id="image_url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://..."
                    data-testid="meal-image-input"
                  />
                </div>
                <Button type="submit" className="w-full" data-testid="save-meal-button">
                  Save Meal
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading meals...</div>
        ) : meals.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-lg" data-testid="meals-empty-state">
            <div className="text-6xl mb-4">🍽️</div>
            <p className="text-xl text-gray-600">No meals logged yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="meals-list">
            {meals.map((meal) => (
              <div key={meal.id} className="bg-white rounded-2xl shadow-lg overflow-hidden card-hover" data-testid={`meal-card-${meal.id}`}>
                {meal.image_url && (
                  <img src={meal.image_url} alt={meal.name} className="w-full h-48 object-cover" />
                )}
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-2" data-testid={`meal-name-${meal.id}`}>{meal.name}</h3>
                  <div className="flex items-center text-orange-600 mb-4">
                    <Flame className="w-5 h-5 mr-2" />
                    <span className="text-xl font-bold" data-testid={`meal-calories-${meal.id}`}>{meal.calories} cal</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">
                    {new Date(meal.meal_time).toLocaleString()}
                  </p>
                  <Button
                    onClick={() => handleDelete(meal.id)}
                    variant="outline"
                    size="sm"
                    className="w-full text-red-600 hover:bg-red-50"
                    data-testid={`delete-meal-${meal.id}`}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Nutrition;
