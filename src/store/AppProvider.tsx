import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Task, AppNotification, Rank, Course } from '../types';
import { addDays, subDays, isBefore, isAfter, format, parseISO } from 'date-fns';
import { api, setAuthToken, clearAuthToken, getAuthToken } from '../lib/api';

interface AppState {
  user: User | null;
  tasks: Task[];
  notifications: AppNotification[];
  courses: Course[];
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  signup: (name: string, email: string, password: string, major: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  addTask: (task: Omit<Task, 'id' | 'status' | 'scheduled_start'>) => Promise<void>;
  completeTask: (id: number) => Promise<void>;
  markNotificationRead: (id: number) => Promise<void>;
  getRankFromPoints: (points: number) => Rank;
  addCourse: (course: Omit<Course, 'id'>) => Promise<void>;
  removeCourse: (id: number) => Promise<void>;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInitialData = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        setIsLoading(false);
        return;
      }
      const [u, tObj, nObj, c] = await Promise.all([
        api.getMe(),
        api.getTasks(),
        api.getNotifications(),
        api.getCourses()
      ]);
      setUser({ ...u, rank: u.level });
      setTasks(Array.isArray(tObj) ? tObj : tObj?.data || []);
      setNotifications(Array.isArray(nObj) ? nObj : nObj?.data || []);
      setCourses(c || []);
    } catch (e) {
      console.error('Failed fetching data:', e);
      clearAuthToken();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Calculate Rank based on Points
  const getRankFromPoints = (points: number): Rank => {
    if (points >= 2000) return 'Grandmaster';
    if (points >= 1500) return 'Master';
    if (points >= 1000) return 'Diamond';
    if (points >= 600) return 'Platinum';
    if (points >= 300) return 'Gold';
    if (points >= 100) return 'Silver';
    return 'Bronze';
  };

  const login = async (email: string, password?: string) => {
    try {
      const res = await api.login({ email, password: password || 'password' });
      if (res.access_token) {
        setAuthToken(res.access_token);
        await fetchInitialData();
      }
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const signup = async (name: string, email: string, password: string, major: string) => {
    try {
      const res = await api.register({ name, email, password, major });
      if (res.access_token) {
        setAuthToken(res.access_token);
        await fetchInitialData();
      }
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const logout = () => {
    clearAuthToken();
    setUser(null);
    setTasks([]);
    setNotifications([]);
    setCourses([]);
  };

  const updateProfile = (data: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...data }); // Assuming backend doesn't have an update endpoint yet
      /* addNotification({
        message: 'Profile updated locally!',
        type: 'achievement'
      }); */
    }
  };

  const addCourse = async (courseInput: Omit<Course, 'id'>) => {
    try {
      const newCourse = await api.createCourse(courseInput);
      setCourses(prev => [...prev, newCourse]);
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const removeCourse = async (id: number) => {
    try {
      await api.deleteCourse(id);
      setCourses(prev => prev.filter(c => c.id !== id));
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const addTask = async (taskInput: Omit<Task, 'id' | 'status' | 'scheduled_start'>) => {
    try {
      const res = await api.createTask({
        title: taskInput.title,
        course_id: taskInput.course_id,
        deadline: taskInput.deadline,
        estimated_duration_mins: taskInput.estimated_duration_mins,
        type: taskInput.type || 'assignment',
      });
      // Refresh tasks
      const newTasks = await api.getTasks();
      setTasks(Array.isArray(newTasks) ? newTasks : newTasks?.data || []);
      
      const scheduledDateStr = res?.scheduled_start;
      if (scheduledDateStr) {
         addNotification({
          message: `I scheduled "${taskInput.title}" for ${format(parseISO(scheduledDateStr), 'EEEE, MMM do')}.`,
          type: 'achievement' as any,
        });
      }
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const completeTask = async (id: number) => {
    try {
       await api.completeTask(id);
       
       const [tObj, gamification] = await Promise.all([
          api.getTasks(),
          api.getGamificationProfile()
       ]);
       
       setTasks(Array.isArray(tObj) ? tObj : tObj?.data || []);
       
       if (user && gamification) {
         setUser({
           ...user,
           points: gamification.points,
           rank: gamification.level,
           streak: gamification.streak
         });
       }
    } catch (e) {
      console.error(e);
    }
  };

  const addNotification = (n: Omit<AppNotification, 'id' | 'created_at' | 'is_read'>) => {
    const newNotif: AppNotification = {
      ...n,
      id: Math.floor(Math.random() * 10000),
      created_at: new Date().toISOString(),
      is_read: false,
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationRead = async (id: number) => {
    try {
       await api.readNotification(id);
       setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (e) {
       console.error(e);
    }
  };

  return (
    <AppContext.Provider value={{ 
      user, tasks, notifications, courses, isLoading,
      login, signup, logout, updateProfile,
      addTask, completeTask, markNotificationRead, getRankFromPoints,
      addCourse, removeCourse
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useAppStore = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppStore must be used within an AppProvider');
  }
  return context;
};

