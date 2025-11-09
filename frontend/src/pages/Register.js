import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API, AuthContext } from '../App';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { Activity } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    age: '',
    gender: '',
    timezone: 'UTC'
  });
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        age: formData.age ? parseInt(formData.age) : null
      };
      const response = await axios.post(`${API}/auth/register`, payload);
      login(response.data.access_token, response.data.user);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-teal-50 to-cyan-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <div className="bg-gradient-to-br from-blue-500 to-teal-500 p-3 rounded-xl">
                <Activity className="w-8 h-8 text-white" data-testid="register-logo" />
              </div>
            </div>
            <h1 className="text-3xl font-bold gradient-text" data-testid="register-title">OneBioCircle</h1>
            <p className="text-gray-600 text-sm" data-testid="register-subtitle">Create your health account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" data-testid="register-form">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
                data-testid="register-name-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleChange}
                required
                data-testid="register-email-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                data-testid="register-password-input"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age (Optional)</Label>
                <Input
                  id="age"
                  name="age"
                  type="number"
                  placeholder="25"
                  value={formData.age}
                  onChange={handleChange}
                  data-testid="register-age-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender (Optional)</Label>
                <Input
                  id="gender"
                  name="gender"
                  type="text"
                  placeholder="Male/Female"
                  value={formData.gender}
                  onChange={handleChange}
                  data-testid="register-gender-input"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white font-medium"
              disabled={loading}
              data-testid="register-submit-button"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <div className="text-center text-sm">
            <span className="text-gray-600">Already have an account? </span>
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium" data-testid="register-login-link">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
