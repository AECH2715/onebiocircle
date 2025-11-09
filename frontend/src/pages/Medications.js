import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../App';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { toast } from 'sonner';
import { Plus, Camera, Edit, Trash2, Clock, Bell, BellOff } from 'lucide-react';

const Medications = () => {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMed, setEditingMed] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    dose: '',
    frequency: '',
    times: '',
    notes: '',
    next_dose: '',
    reminder_enabled: true
  });

  useEffect(() => {
    fetchMedications();
  }, []);

  const fetchMedications = async () => {
    try {
      const response = await axios.get(`${API}/medications`);
      setMedications(response.data);
    } catch (error) {
      toast.error('Failed to load medications');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingMed) {
        await axios.put(`${API}/medications/${editingMed.id}`, formData);
        toast.success('Medication updated successfully');
      } else {
        await axios.post(`${API}/medications`, formData);
        toast.success('Medication added successfully');
      }
      fetchMedications();
      resetForm();
      setDialogOpen(false);
    } catch (error) {
      toast.error('Failed to save medication');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this medication?')) return;
    try {
      await axios.delete(`${API}/medications/${id}`);
      toast.success('Medication deleted');
      fetchMedications();
    } catch (error) {
      toast.error('Failed to delete medication');
    }
  };

  const handleEdit = (med) => {
    setEditingMed(med);
    setFormData({
      name: med.name,
      dose: med.dose,
      frequency: med.frequency,
      times: med.times,
      notes: med.notes || '',
      next_dose: med.next_dose || '',
      reminder_enabled: med.reminder_enabled
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      dose: '',
      frequency: '',
      times: '',
      notes: '',
      next_dose: '',
      reminder_enabled: true
    });
    setEditingMed(null);
  };

  const handleScanPrescription = () => {
    toast.info('Prescription scanning feature (demo)');
  };

  return (
    <div className="p-8 space-y-8" data-testid="medications-page">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-800" data-testid="medications-title">Your Medications</h1>
          <p className="text-gray-600 mt-2">Manage your medication schedule</p>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={handleScanPrescription}
            variant="outline"
            className="space-x-2"
            data-testid="scan-prescription-button"
          >
            <Camera className="w-4 h-4" />
            <span>Scan Prescription</span>
          </Button>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-500 to-teal-500 text-white space-x-2" data-testid="add-medication-manually-button">
                <Plus className="w-4 h-4" />
                <span>Add Manually</span>
              </Button>
            </DialogTrigger>
            <DialogContent data-testid="medication-dialog">
              <DialogHeader>
                <DialogTitle>{editingMed ? 'Edit Medication' : 'Add Medication'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Medication Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    data-testid="medication-name-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dose">Dose</Label>
                  <Input
                    id="dose"
                    placeholder="e.g., 500mg"
                    value={formData.dose}
                    onChange={(e) => setFormData({ ...formData, dose: e.target.value })}
                    required
                    data-testid="medication-dose-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency</Label>
                  <Input
                    id="frequency"
                    placeholder="e.g., Twice daily"
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                    required
                    data-testid="medication-frequency-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="times">Times</Label>
                  <Input
                    id="times"
                    placeholder="e.g., 8:00 AM, 8:00 PM"
                    value={formData.times}
                    onChange={(e) => setFormData({ ...formData, times: e.target.value })}
                    required
                    data-testid="medication-times-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="next_dose">Next Dose</Label>
                  <Input
                    id="next_dose"
                    placeholder="e.g., Today 8:00 PM"
                    value={formData.next_dose}
                    onChange={(e) => setFormData({ ...formData, next_dose: e.target.value })}
                    data-testid="medication-next-dose-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    placeholder="Additional notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    data-testid="medication-notes-input"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="reminder"
                    checked={formData.reminder_enabled}
                    onCheckedChange={(checked) => setFormData({ ...formData, reminder_enabled: checked })}
                    data-testid="medication-reminder-toggle"
                  />
                  <Label htmlFor="reminder">Enable Reminders</Label>
                </div>
                <Button type="submit" className="w-full" data-testid="save-medication-button">
                  {editingMed ? 'Update Medication' : 'Save Medication'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading medications...</div>
      ) : medications.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-lg" data-testid="medications-empty-state">
          <div className="text-6xl mb-4">💊</div>
          <p className="text-xl text-gray-600 mb-6">No medications added yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="medications-list">
          {medications.map((med) => (
            <div key={med.id} className="bg-white rounded-2xl p-6 shadow-lg card-hover" data-testid={`medication-card-${med.id}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-800" data-testid={`medication-name-${med.id}`}>{med.name}</h3>
                  <p className="text-sm text-gray-600">{med.dose}</p>
                </div>
                {med.reminder_enabled ? (
                  <Bell className="w-5 h-5 text-blue-600" data-testid={`reminder-enabled-${med.id}`} />
                ) : (
                  <BellOff className="w-5 h-5 text-gray-400" data-testid={`reminder-disabled-${med.id}`} />
                )}
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>{med.frequency}</span>
                </div>
                <p className="text-sm text-gray-600">Times: {med.times}</p>
                {med.next_dose && (
                  <p className="text-sm text-blue-600 font-medium" data-testid={`next-dose-${med.id}`}>Next: {med.next_dose}</p>
                )}
                {med.notes && <p className="text-sm text-gray-500 italic">{med.notes}</p>}
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => handleEdit(med)}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  data-testid={`edit-medication-${med.id}`}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button
                  onClick={() => handleDelete(med.id)}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:bg-red-50"
                  data-testid={`delete-medication-${med.id}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Medications;
