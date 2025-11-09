from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
SECRET_KEY = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

security = HTTPBearer()

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ==================== MODELS ====================

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    age: Optional[int] = None
    gender: Optional[str] = None
    timezone: Optional[str] = "UTC"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    age: Optional[int] = None
    gender: Optional[str] = None
    timezone: Optional[str] = "UTC"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    timezone: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

class Medication(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    name: str
    dose: str
    frequency: str
    times: str
    notes: Optional[str] = None
    next_dose: Optional[str] = None
    reminder_enabled: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class MedicationCreate(BaseModel):
    name: str
    dose: str
    frequency: str
    times: str
    notes: Optional[str] = None
    next_dose: Optional[str] = None
    reminder_enabled: bool = True

class Meal(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    name: str
    calories: int
    image_url: Optional[str] = None
    meal_time: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class MealCreate(BaseModel):
    name: str
    calories: int
    image_url: Optional[str] = None

class WorkoutExercise(BaseModel):
    name: str
    sets: str
    reps: str
    instructions: str
    difficulty: str

class Workout(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    day: str  # Mon, Tue, Wed, etc.
    exercises: List[WorkoutExercise]
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class WorkoutCreate(BaseModel):
    day: str
    exercises: List[WorkoutExercise]

class Trip(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    destination: str
    start_date: str
    end_date: str
    timezone: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TripCreate(BaseModel):
    destination: str
    start_date: str
    end_date: str
    timezone: str

class NotificationPreferences(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    medication_reminders: bool = True
    daily_tips: bool = True
    travel_alerts: bool = True

class NotificationPreferencesUpdate(BaseModel):
    medication_reminders: Optional[bool] = None
    daily_tips: Optional[bool] = None
    travel_alerts: Optional[bool] = None

class Notification(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    type: str
    message: str
    read: bool = False
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Consultation(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    symptom: str
    duration: str
    severity: str
    conditions: List[str]
    medications_list: str
    allergies: str
    diagnosis: Optional[str] = None
    prescription: Optional[List[dict]] = None
    advice: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ConsultationCreate(BaseModel):
    symptom: str
    duration: str
    severity: str
    conditions: List[str]
    medications_list: str
    allergies: str

class PrescriptionUpdate(BaseModel):
    diagnosis: str
    prescription: List[dict]
    advice: str

# ==================== AUTH HELPERS ====================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        
        user_doc = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
        if user_doc is None:
            raise HTTPException(status_code=401, detail="User not found")
        
        if isinstance(user_doc.get('created_at'), str):
            user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
        
        return User(**user_doc)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/register", response_model=Token)
async def register(user_input: UserCreate):
    # Check if user exists
    existing = await db.users.find_one({"email": user_input.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password
    hashed_pw = hash_password(user_input.password)
    
    # Create user
    user_dict = user_input.model_dump(exclude={'password'})
    user_obj = User(**user_dict)
    
    doc = user_obj.model_dump()
    doc['password'] = hashed_pw
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.users.insert_one(doc)
    
    # Create default notification preferences
    prefs = NotificationPreferences(user_id=user_obj.id)
    await db.notification_preferences.insert_one(prefs.model_dump())
    
    # Create token
    access_token = create_access_token(data={"sub": user_obj.id})
    
    return Token(access_token=access_token, token_type="bearer", user=user_obj)

@api_router.post("/auth/login", response_model=Token)
async def login(credentials: UserLogin):
    user_doc = await db.users.find_one({"email": credentials.email})
    if not user_doc:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not verify_password(credentials.password, user_doc['password']):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if isinstance(user_doc.get('created_at'), str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    user_doc.pop('password')
    user_doc.pop('_id')
    user = User(**user_doc)
    
    access_token = create_access_token(data={"sub": user.id})
    
    return Token(access_token=access_token, token_type="bearer", user=user)

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@api_router.put("/auth/me", response_model=User)
async def update_me(user_update: UserUpdate, current_user: User = Depends(get_current_user)):
    update_data = {k: v for k, v in user_update.model_dump().items() if v is not None}
    
    if update_data:
        await db.users.update_one(
            {"id": current_user.id},
            {"$set": update_data}
        )
    
    updated_user = await db.users.find_one({"id": current_user.id}, {"_id": 0, "password": 0})
    if isinstance(updated_user.get('created_at'), str):
        updated_user['created_at'] = datetime.fromisoformat(updated_user['created_at'])
    
    return User(**updated_user)

# ==================== MEDICATION ROUTES ====================

@api_router.post("/medications", response_model=Medication)
async def create_medication(med_input: MedicationCreate, current_user: User = Depends(get_current_user)):
    med_dict = med_input.model_dump()
    med_obj = Medication(user_id=current_user.id, **med_dict)
    
    doc = med_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.medications.insert_one(doc)
    return med_obj

@api_router.get("/medications", response_model=List[Medication])
async def get_medications(current_user: User = Depends(get_current_user)):
    meds = await db.medications.find({"user_id": current_user.id}, {"_id": 0}).to_list(1000)
    
    for med in meds:
        if isinstance(med.get('created_at'), str):
            med['created_at'] = datetime.fromisoformat(med['created_at'])
    
    return meds

@api_router.put("/medications/{med_id}", response_model=Medication)
async def update_medication(med_id: str, med_input: MedicationCreate, current_user: User = Depends(get_current_user)):
    existing = await db.medications.find_one({"id": med_id, "user_id": current_user.id})
    if not existing:
        raise HTTPException(status_code=404, detail="Medication not found")
    
    update_data = med_input.model_dump()
    await db.medications.update_one(
        {"id": med_id},
        {"$set": update_data}
    )
    
    updated = await db.medications.find_one({"id": med_id}, {"_id": 0})
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    
    return Medication(**updated)

@api_router.delete("/medications/{med_id}")
async def delete_medication(med_id: str, current_user: User = Depends(get_current_user)):
    result = await db.medications.delete_one({"id": med_id, "user_id": current_user.id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Medication not found")
    return {"message": "Medication deleted"}

# ==================== MEAL ROUTES ====================

@api_router.post("/meals", response_model=Meal)
async def create_meal(meal_input: MealCreate, current_user: User = Depends(get_current_user)):
    meal_dict = meal_input.model_dump()
    meal_obj = Meal(user_id=current_user.id, **meal_dict)
    
    doc = meal_obj.model_dump()
    doc['meal_time'] = doc['meal_time'].isoformat()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.meals.insert_one(doc)
    return meal_obj

@api_router.get("/meals", response_model=List[Meal])
async def get_meals(current_user: User = Depends(get_current_user)):
    meals = await db.meals.find({"user_id": current_user.id}, {"_id": 0}).to_list(1000)
    
    for meal in meals:
        if isinstance(meal.get('meal_time'), str):
            meal['meal_time'] = datetime.fromisoformat(meal['meal_time'])
        if isinstance(meal.get('created_at'), str):
            meal['created_at'] = datetime.fromisoformat(meal['created_at'])
    
    return meals

@api_router.delete("/meals/{meal_id}")
async def delete_meal(meal_id: str, current_user: User = Depends(get_current_user)):
    result = await db.meals.delete_one({"id": meal_id, "user_id": current_user.id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Meal not found")
    return {"message": "Meal deleted"}

# ==================== WORKOUT ROUTES ====================

@api_router.post("/workouts", response_model=Workout)
async def create_workout(workout_input: WorkoutCreate, current_user: User = Depends(get_current_user)):
    workout_dict = workout_input.model_dump()
    workout_obj = Workout(user_id=current_user.id, **workout_dict)
    
    doc = workout_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.workouts.insert_one(doc)
    return workout_obj

@api_router.get("/workouts", response_model=List[Workout])
async def get_workouts(current_user: User = Depends(get_current_user)):
    workouts = await db.workouts.find({"user_id": current_user.id}, {"_id": 0}).to_list(1000)
    
    for workout in workouts:
        if isinstance(workout.get('created_at'), str):
            workout['created_at'] = datetime.fromisoformat(workout['created_at'])
    
    return workouts

@api_router.get("/workouts/{day}", response_model=Optional[Workout])
async def get_workout_by_day(day: str, current_user: User = Depends(get_current_user)):
    workout = await db.workouts.find_one({"user_id": current_user.id, "day": day}, {"_id": 0})
    
    if workout:
        if isinstance(workout.get('created_at'), str):
            workout['created_at'] = datetime.fromisoformat(workout['created_at'])
        return Workout(**workout)
    return None

# ==================== TRIP ROUTES ====================

@api_router.post("/trips", response_model=Trip)
async def create_trip(trip_input: TripCreate, current_user: User = Depends(get_current_user)):
    trip_dict = trip_input.model_dump()
    trip_obj = Trip(user_id=current_user.id, **trip_dict)
    
    doc = trip_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.trips.insert_one(doc)
    return trip_obj

@api_router.get("/trips", response_model=List[Trip])
async def get_trips(current_user: User = Depends(get_current_user)):
    trips = await db.trips.find({"user_id": current_user.id}, {"_id": 0}).to_list(1000)
    
    for trip in trips:
        if isinstance(trip.get('created_at'), str):
            trip['created_at'] = datetime.fromisoformat(trip['created_at'])
    
    return trips

@api_router.delete("/trips/{trip_id}")
async def delete_trip(trip_id: str, current_user: User = Depends(get_current_user)):
    result = await db.trips.delete_one({"id": trip_id, "user_id": current_user.id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Trip not found")
    return {"message": "Trip deleted"}

# ==================== NOTIFICATION ROUTES ====================

@api_router.get("/notifications/preferences", response_model=NotificationPreferences)
async def get_notification_preferences(current_user: User = Depends(get_current_user)):
    prefs = await db.notification_preferences.find_one({"user_id": current_user.id}, {"_id": 0})
    if not prefs:
        # Create default
        prefs = NotificationPreferences(user_id=current_user.id)
        await db.notification_preferences.insert_one(prefs.model_dump())
    return NotificationPreferences(**prefs)

@api_router.put("/notifications/preferences", response_model=NotificationPreferences)
async def update_notification_preferences(prefs_input: NotificationPreferencesUpdate, current_user: User = Depends(get_current_user)):
    update_data = {k: v for k, v in prefs_input.model_dump().items() if v is not None}
    
    if update_data:
        await db.notification_preferences.update_one(
            {"user_id": current_user.id},
            {"$set": update_data},
            upsert=True
        )
    
    prefs = await db.notification_preferences.find_one({"user_id": current_user.id}, {"_id": 0})
    return NotificationPreferences(**prefs)

@api_router.get("/notifications", response_model=List[Notification])
async def get_notifications(current_user: User = Depends(get_current_user)):
    notifications = await db.notifications.find({"user_id": current_user.id}, {"_id": 0}).sort("timestamp", -1).to_list(100)
    
    for notif in notifications:
        if isinstance(notif.get('timestamp'), str):
            notif['timestamp'] = datetime.fromisoformat(notif['timestamp'])
    
    return notifications

@api_router.post("/notifications/test")
async def send_test_notification(current_user: User = Depends(get_current_user)):
    notif = Notification(
        user_id=current_user.id,
        type="medication",
        message="🔔 Medication Reminder: Your dose is due in 2 hours."
    )
    
    doc = notif.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    await db.notifications.insert_one(doc)
    return {"message": "Test notification sent"}

# ==================== CONSULTATION ROUTES ====================

@api_router.post("/consultations", response_model=Consultation)
async def create_consultation(consult_input: ConsultationCreate, current_user: User = Depends(get_current_user)):
    consult_dict = consult_input.model_dump()
    consult_obj = Consultation(user_id=current_user.id, **consult_dict)
    
    doc = consult_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.consultations.insert_one(doc)
    return consult_obj

@api_router.get("/consultations", response_model=List[Consultation])
async def get_consultations(current_user: User = Depends(get_current_user)):
    consultations = await db.consultations.find({"user_id": current_user.id}, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    for consult in consultations:
        if isinstance(consult.get('created_at'), str):
            consult['created_at'] = datetime.fromisoformat(consult['created_at'])
    
    return consultations

@api_router.put("/consultations/{consult_id}/prescription", response_model=Consultation)
async def update_prescription(consult_id: str, prescription_input: PrescriptionUpdate, current_user: User = Depends(get_current_user)):
    existing = await db.consultations.find_one({"id": consult_id, "user_id": current_user.id})
    if not existing:
        raise HTTPException(status_code=404, detail="Consultation not found")
    
    update_data = prescription_input.model_dump()
    await db.consultations.update_one(
        {"id": consult_id},
        {"$set": update_data}
    )
    
    updated = await db.consultations.find_one({"id": consult_id}, {"_id": 0})
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    
    return Consultation(**updated)

# ==================== DASHBOARD STATS ====================

@api_router.get("/dashboard/stats")
async def get_dashboard_stats(current_user: User = Depends(get_current_user)):
    # Get today's date
    today = datetime.now(timezone.utc).date()
    
    # Count active medications
    active_meds = await db.medications.count_documents({"user_id": current_user.id})
    
    # Count today's meals and sum calories
    meals_today = await db.meals.find({"user_id": current_user.id}, {"_id": 0}).to_list(1000)
    today_meals = []
    total_calories = 0
    
    for meal in meals_today:
        if isinstance(meal.get('meal_time'), str):
            meal_time = datetime.fromisoformat(meal['meal_time'])
        else:
            meal_time = meal.get('meal_time')
        
        if meal_time and meal_time.date() == today:
            today_meals.append(meal)
            total_calories += meal.get('calories', 0)
    
    # Get next medication
    next_med = await db.medications.find_one(
        {"user_id": current_user.id, "reminder_enabled": True},
        {"_id": 0}
    )
    
    return {
        "active_medications": active_meds,
        "calories_today": total_calories,
        "meals_logged": len(today_meals),
        "next_medication": next_med,
        "health_tip": "Stay hydrated! Drink at least 8 glasses of water today."
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
