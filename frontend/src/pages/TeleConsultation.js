import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API, AuthContext } from '../App';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Separator } from '../components/ui/separator';
import { toast } from 'sonner';
import { Video, Mic, PhoneOff, MessageCircle, Send, FileText, Download, Mail, Camera } from 'lucide-react';

const TeleConsultation = () => {
  const { user } = useContext(AuthContext);
  const [step, setStep] = useState('assessment'); // assessment, consent, consultation, prescription
  const [consentGiven, setConsentGiven] = useState(false);
  const [consultationId, setConsultationId] = useState(null);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'doctor', message: 'Hello! How can I help you today?', time: '10:00 AM' },
    { sender: 'patient', message: 'I have been experiencing headaches recently.', time: '10:01 AM' },
    { sender: 'doctor', message: 'I see. How long have you been experiencing these headaches?', time: '10:02 AM' },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [muted, setMuted] = useState(false);
  
  // Assessment form
  const [assessmentForm, setAssessmentForm] = useState({
    symptom: '',
    duration: '',
    severity: '',
    conditions: [],
    medications: '',
    allergies: ''
  });

  // Prescription data
  const [prescription, setPrescription] = useState(null);

  const handleAssessmentSubmit = (e) => {
    e.preventDefault();
    // Show consent modal
    setStep('consent');
  };

  const handleConsentAccept = async () => {
    if (!consentGiven) {
      toast.error('Please accept the terms to continue');
      return;
    }
    
    try {
      // Create consultation
      const response = await axios.post(`${API}/consultations`, {
        symptom: assessmentForm.symptom,
        duration: assessmentForm.duration,
        severity: assessmentForm.severity,
        conditions: assessmentForm.conditions,
        medications_list: assessmentForm.medications,
        allergies: assessmentForm.allergies
      });
      setConsultationId(response.data.id);
      toast.success('Consultation started');
      setStep('consultation');
    } catch (error) {
      toast.error('Failed to start consultation');
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    setChatMessages([...chatMessages, {
      sender: 'patient',
      message: newMessage,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    }]);
    toast.success('Message sent (demo)');
    setNewMessage('');
  };

  const handleGeneratePrescription = () => {
    setPrescription({
      patient_name: user?.name || 'Patient',
      symptoms: assessmentForm.symptom,
      diagnosis: 'Tension Headache',
      medications: [
        { name: 'Ibuprofen 400mg', dosage: 'Twice daily', duration: '7 days' },
        { name: 'Paracetamol 500mg', dosage: 'As needed', duration: '5 days' }
      ],
      advice: 'Rest well, stay hydrated, and avoid stress. Follow up in 1 week if symptoms persist.'
    });
    setStep('prescription');
  };

  const handleEndCall = () => {
    toast.info('Call ended');
    setStep('assessment');
    // Reset form
    setAssessmentForm({
      symptom: '',
      duration: '',
      severity: '',
      conditions: [],
      medications: '',
      allergies: ''
    });
    setConsultationId(null);
  };

  const handleDownloadPrescription = () => {
    toast.success('Prescription downloaded (demo)');
  };

  const handleEmailPrescription = () => {
    toast.success('Prescription emailed (demo)');
  };

  return (
    <div className="p-8 space-y-8" data-testid="tele-consultation-page">
      <div>
        <h1 className="text-4xl font-bold text-gray-800" data-testid="tele-consultation-title">Telemedicine Suite</h1>
        <p className="text-gray-600 mt-2">Complete virtual consultation with healthcare professionals</p>
      </div>

      {/* Step 1: Symptom Pre-Assessment Form */}
      {step === 'assessment' && (
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl p-8 shadow-lg" data-testid="assessment-form">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Symptom Pre-Assessment</h2>
            <form onSubmit={handleAssessmentSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="symptom">Primary Symptom</Label>
                <Select value={assessmentForm.symptom} onValueChange={(value) => setAssessmentForm({ ...assessmentForm, symptom: value })} required>
                  <SelectTrigger data-testid="symptom-select">
                    <SelectValue placeholder="Select symptom" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="headache">Headache</SelectItem>
                    <SelectItem value="fever">Fever</SelectItem>
                    <SelectItem value="cough">Cough</SelectItem>
                    <SelectItem value="fatigue">Fatigue</SelectItem>
                    <SelectItem value="pain">Body Pain</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Select value={assessmentForm.duration} onValueChange={(value) => setAssessmentForm({ ...assessmentForm, duration: value })} required>
                  <SelectTrigger data-testid="duration-select">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-2days">1-2 days</SelectItem>
                    <SelectItem value="3-7days">3-7 days</SelectItem>
                    <SelectItem value="1-2weeks">1-2 weeks</SelectItem>
                    <SelectItem value="over2weeks">Over 2 weeks</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Severity</Label>
                <RadioGroup value={assessmentForm.severity} onValueChange={(value) => setAssessmentForm({ ...assessmentForm, severity: value })} required data-testid="severity-radio-group">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="mild" id="mild" data-testid="severity-mild" />
                    <Label htmlFor="mild">Mild</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="moderate" id="moderate" data-testid="severity-moderate" />
                    <Label htmlFor="moderate">Moderate</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="severe" id="severe" data-testid="severity-severe" />
                    <Label htmlFor="severe">Severe</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>Chronic Conditions</Label>
                <div className="space-y-2" data-testid="chronic-conditions-checkboxes">
                  {['Diabetes', 'Hypertension', 'Asthma', 'Heart Disease', 'None'].map((condition) => (
                    <div key={condition} className="flex items-center space-x-2">
                      <Checkbox
                        id={condition}
                        checked={assessmentForm.conditions.includes(condition)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setAssessmentForm({ ...assessmentForm, conditions: [...assessmentForm.conditions, condition] });
                          } else {
                            setAssessmentForm({ ...assessmentForm, conditions: assessmentForm.conditions.filter(c => c !== condition) });
                          }
                        }}
                        data-testid={`condition-${condition.toLowerCase().replace(/\s/g, '-')}`}
                      />
                      <Label htmlFor={condition}>{condition}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="medications">Current Medications</Label>
                <Textarea
                  id="medications"
                  placeholder="List any medications you're currently taking"
                  value={assessmentForm.medications}
                  onChange={(e) => setAssessmentForm({ ...assessmentForm, medications: e.target.value })}
                  data-testid="medications-textarea"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="allergies">Allergies</Label>
                <Textarea
                  id="allergies"
                  placeholder="List any allergies"
                  value={assessmentForm.allergies}
                  onChange={(e) => setAssessmentForm({ ...assessmentForm, allergies: e.target.value })}
                  data-testid="allergies-textarea"
                />
              </div>

              <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-teal-500 text-white" data-testid="continue-button">
                Continue →
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Step 2: Consent Modal */}
      <Dialog open={step === 'consent'} onOpenChange={(open) => !open && setStep('assessment')}>
        <DialogContent className="max-w-2xl" data-testid="consent-modal">
          <DialogHeader>
            <DialogTitle>Telemedicine Consent & Privacy</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-bold text-gray-800 mb-2">Important Information</h3>
              <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
                <li>This is a remote consultation and may have limitations compared to in-person visits</li>
                <li>Your medical information will be kept confidential and secure</li>
                <li>This service is not for emergencies. Call 911 for urgent medical needs</li>
                <li>The doctor may recommend an in-person visit if needed</li>
                <li>You have the right to end the consultation at any time</li>
              </ul>
            </div>
            <div className="flex items-start space-x-2">
              <Checkbox
                id="consent"
                checked={consentGiven}
                onCheckedChange={setConsentGiven}
                data-testid="consent-checkbox"
              />
              <Label htmlFor="consent" className="text-sm">
                I have read and agree to the terms. I understand the limitations of telemedicine and consent to this virtual consultation.
              </Label>
            </div>
            <Button
              onClick={handleConsentAccept}
              className="w-full bg-gradient-to-r from-blue-500 to-teal-500 text-white"
              disabled={!consentGiven}
              data-testid="start-consultation-button"
            >
              Start Consultation
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Step 3: Consultation Room */}
      {step === 'consultation' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" data-testid="consultation-room">
          {/* Left Column - Video */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Video Consultation</h2>
              
              {/* Doctor Video */}
              <div className="bg-gradient-to-br from-blue-100 to-teal-100 rounded-xl h-64 flex items-center justify-center mb-4" data-testid="doctor-video">
                <div className="text-center">
                  <Video className="w-16 h-16 text-blue-600 mx-auto mb-2" />
                  <p className="text-gray-700 font-medium">Dr. Smith</p>
                  <p className="text-sm text-gray-600">Video Feed (Demo)</p>
                </div>
              </div>

              {/* Patient Video */}
              <div className="bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl h-48 flex items-center justify-center mb-4" data-testid="patient-video">
                <div className="text-center">
                  <Camera className="w-12 h-12 text-purple-600 mx-auto mb-2" />
                  <p className="text-gray-700 font-medium">You</p>
                  <p className="text-sm text-gray-600">Your Video (Demo)</p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex justify-center space-x-4">
                <Button
                  onClick={() => {
                    setMuted(!muted);
                    toast.info(muted ? 'Unmuted (demo)' : 'Muted (demo)');
                  }}
                  variant="outline"
                  className="space-x-2"
                  data-testid="mute-button"
                >
                  <Mic className="w-4 h-4" />
                  <span>{muted ? 'Unmute' : 'Mute'}</span>
                </Button>
                <Button
                  onClick={handleEndCall}
                  variant="destructive"
                  className="space-x-2"
                  data-testid="end-call-button"
                >
                  <PhoneOff className="w-4 h-4" />
                  <span>End Call</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column - Chat */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg" data-testid="chat-interface">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Chat</h2>
              
              {/* Chat Messages */}
              <div className="space-y-3 mb-4 h-96 overflow-y-auto" data-testid="chat-messages">
                {chatMessages.map((msg, index) => (
                  <div key={index} className={`flex ${msg.sender === 'patient' ? 'justify-end' : 'justify-start'}`} data-testid={`chat-message-${index}`}>
                    <div className={`max-w-xs p-3 rounded-lg ${
                      msg.sender === 'patient'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      <p className="text-sm">{msg.message}</p>
                      <p className={`text-xs mt-1 ${
                        msg.sender === 'patient' ? 'text-blue-100' : 'text-gray-500'
                      }`}>{msg.time}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="flex space-x-2">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  data-testid="chat-input"
                />
                <Button onClick={handleSendMessage} data-testid="send-message-button">
                  <Send className="w-4 h-4" />
                </Button>
              </div>

              <Separator className="my-4" />

              <Button
                onClick={handleGeneratePrescription}
                className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white"
                data-testid="generate-prescription-button"
              >
                <FileText className="w-4 h-4 mr-2" />
                Generate Prescription
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: e-Prescription */}
      {step === 'prescription' && prescription && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-8 shadow-lg" data-testid="prescription-section">
            <div className="border-b border-gray-200 pb-4 mb-6">
              <h2 className="text-3xl font-bold text-gray-800">e-Prescription</h2>
              <p className="text-gray-600 mt-1">OneBioCircle Telemedicine</p>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-gray-800 mb-2">Patient Information</h3>
                <p className="text-gray-700" data-testid="prescription-patient-name">Name: {prescription.patient_name}</p>
                <p className="text-gray-700">Date: {new Date().toLocaleDateString()}</p>
              </div>

              <Separator />

              <div>
                <h3 className="font-bold text-gray-800 mb-2">Symptoms</h3>
                <p className="text-gray-700" data-testid="prescription-symptoms">{prescription.symptoms}</p>
              </div>

              <Separator />

              <div>
                <h3 className="font-bold text-gray-800 mb-2">Diagnosis</h3>
                <p className="text-gray-700" data-testid="prescription-diagnosis">{prescription.diagnosis}</p>
              </div>

              <Separator />

              <div>
                <h3 className="font-bold text-gray-800 mb-2">Prescribed Medications</h3>
                <div className="space-y-3" data-testid="prescription-medications">
                  {prescription.medications.map((med, index) => (
                    <div key={index} className="bg-blue-50 p-4 rounded-lg">
                      <p className="font-medium text-gray-800" data-testid={`medication-name-${index}`}>{med.name}</p>
                      <p className="text-sm text-gray-600">Dosage: {med.dosage}</p>
                      <p className="text-sm text-gray-600">Duration: {med.duration}</p>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-bold text-gray-800 mb-2">Medical Advice</h3>
                <p className="text-gray-700" data-testid="prescription-advice">{prescription.advice}</p>
              </div>

              <div className="flex space-x-4 pt-6">
                <Button
                  onClick={handleDownloadPrescription}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-teal-500 text-white"
                  data-testid="download-prescription-button"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Prescription
                </Button>
                <Button
                  onClick={handleEmailPrescription}
                  variant="outline"
                  className="flex-1"
                  data-testid="email-prescription-button"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Email Prescription
                </Button>
              </div>

              <Button
                onClick={() => {
                  setStep('assessment');
                  setPrescription(null);
                  setConsultationId(null);
                  toast.success('Consultation completed');
                }}
                variant="outline"
                className="w-full"
                data-testid="return-dashboard-button"
              >
                Return to Dashboard
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeleConsultation;
