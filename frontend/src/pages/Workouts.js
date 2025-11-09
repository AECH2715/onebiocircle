import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../App';
import { Button } from '../components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { toast } from 'sonner';
import { Dumbbell, Clock } from 'lucide-react';

const Workouts = () => {
  const [workouts, setWorkouts] = useState([]);
  const [selectedDay, setSelectedDay] = useState('Mon');
  const [loading, setLoading] = useState(true);

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    try {
      const response = await axios.get(`${API}/workouts`);
      setWorkouts(response.data);
    } catch (error) {
      toast.error('Failed to load workouts');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentDayWorkout = () => {
    return workouts.find(w => w.day === selectedDay);
  };

  const currentWorkout = getCurrentDayWorkout();

  return (
    <div className="p-8 space-y-8" data-testid="workouts-page">
      <div>
        <h1 className="text-4xl font-bold text-gray-800" data-testid="workouts-title">Fitness Planner</h1>
        <p className="text-gray-600 mt-2">Your personalized weekly workout plan</p>
      </div>

      {/* Week Selector */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <Tabs value={selectedDay} onValueChange={setSelectedDay} data-testid="week-selector">
          <TabsList className="grid grid-cols-7 w-full" data-testid="days-tabs">
            {days.map(day => (
              <TabsTrigger key={day} value={day} data-testid={`day-tab-${day.toLowerCase()}`}>
                {day}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Daily Workout Plan */}
      {loading ? (
        <div className="text-center py-12">Loading workouts...</div>
      ) : currentWorkout && currentWorkout.exercises.length > 0 ? (
        <div className="space-y-6" data-testid="workout-exercises">
          <h2 className="text-2xl font-bold text-gray-800">{selectedDay} Workout</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentWorkout.exercises.map((exercise, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg card-hover" data-testid={`exercise-card-${index}`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2" data-testid={`exercise-name-${index}`}>{exercise.name}</h3>
                    <div className="flex items-center text-sm text-gray-600 space-x-4">
                      <span data-testid={`exercise-sets-${index}`}>{exercise.sets} sets</span>
                      <span>•</span>
                      <span data-testid={`exercise-reps-${index}`}>{exercise.reps} reps</span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    exercise.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                    exercise.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`} data-testid={`exercise-difficulty-${index}`}>
                    {exercise.difficulty}
                  </span>
                </div>
                <p className="text-sm text-gray-600" data-testid={`exercise-instructions-${index}`}>{exercise.instructions}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-2xl shadow-lg" data-testid="rest-day-message">
          <div className="text-6xl mb-4">🛑</div>
          <p className="text-2xl font-bold text-gray-800 mb-2">Rest Day</p>
          <p className="text-gray-600">Take a break and let your body recover!</p>
        </div>
      )}

      {/* Sample Workout Data Display (for demo) */}
      {!loading && workouts.length === 0 && (
        <div className="bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl p-8 text-white shadow-lg">
          <h3 className="text-xl font-bold mb-4">Sample Workout Available</h3>
          <p className="mb-4">Start with our recommended workout plans!</p>
          <Button
            onClick={async () => {
              try {
                // Add sample workout for Monday
                await axios.post(`${API}/workouts`, {
                  day: 'Mon',
                  exercises: [
                    {
                      name: 'Push-ups',
                      sets: '3',
                      reps: '15',
                      instructions: 'Keep your back straight and lower your body until your chest nearly touches the floor.',
                      difficulty: 'Medium'
                    },
                    {
                      name: 'Squats',
                      sets: '4',
                      reps: '20',
                      instructions: 'Stand with feet shoulder-width apart, lower your body as if sitting back into a chair.',
                      difficulty: 'Easy'
                    },
                    {
                      name: 'Plank',
                      sets: '3',
                      reps: '60 sec',
                      instructions: 'Hold a push-up position with your body in a straight line from head to heels.',
                      difficulty: 'Medium'
                    }
                  ]
                });
                // Add sample workout for Wednesday
                await axios.post(`${API}/workouts`, {
                  day: 'Wed',
                  exercises: [
                    {
                      name: 'Lunges',
                      sets: '3',
                      reps: '12 each leg',
                      instructions: 'Step forward with one leg, lowering your hips until both knees are bent at 90 degrees.',
                      difficulty: 'Medium'
                    },
                    {
                      name: 'Burpees',
                      sets: '3',
                      reps: '10',
                      instructions: 'Drop into a squat, kick feet back to plank, do a push-up, jump feet forward, and jump up.',
                      difficulty: 'Hard'
                    }
                  ]
                });
                // Add sample workout for Friday
                await axios.post(`${API}/workouts`, {
                  day: 'Fri',
                  exercises: [
                    {
                      name: 'Mountain Climbers',
                      sets: '3',
                      reps: '20',
                      instructions: 'Start in plank position, alternate bringing knees to chest rapidly.',
                      difficulty: 'Hard'
                    },
                    {
                      name: 'Jumping Jacks',
                      sets: '3',
                      reps: '30',
                      instructions: 'Jump while spreading legs and raising arms overhead, then return to start.',
                      difficulty: 'Easy'
                    }
                  ]
                });
                toast.success('Sample workouts added!');
                fetchWorkouts();
              } catch (error) {
                toast.error('Failed to add sample workouts');
              }
            }}
            className="bg-white text-purple-600 hover:bg-purple-50"
            data-testid="add-sample-workouts-button"
          >
            <Dumbbell className="w-4 h-4 mr-2" />
            Load Sample Workouts
          </Button>
        </div>
      )}
    </div>
  );
};

export default Workouts;
