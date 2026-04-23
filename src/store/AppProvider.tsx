import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Task, AppNotification, Rank, Course } from '../types';
import { addDays, subDays, isBefore, isAfter, format, parseISO } from 'date-fns';

interface AppState {
  user: User | null;
  tasks: Task[];
  notifications: AppNotification[];
  courses: Course[];
  login: (email: string, password?: string) => void;
  signup: (name: string, email: string, password: string, major: string) => void;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  addTask: (task: Omit<Task, 'id' | 'status' | 'scheduledFor'>) => void;
  completeTask: (id: string) => void;
  markNotificationRead: (id: string) => void;
  getRankFromPoints: (points: number) => Rank;
  addCourse: (course: Omit<Course, 'id'>) => void;
  removeCourse: (id: string) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

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

  const seedMockData = (name: string, email: string, major: string) => {
    const today = new Date();
    setUser({
      id: 'mock-user-1',
      name,
      username: email.split('@')[0],
      email,
      major,
      points: 150,
      streak: 3,
      rank: 'Silver',
    });

    setCourses([
      { id: 'c1', code: 'CSC 452', name: 'Artificial Intelligence' },
      { id: 'c2', code: 'MTH 301', name: 'Linear Algebra' },
      { id: 'c3', code: 'BIO 101', name: 'Intro to Biology' }
    ]);

    setTasks([
      {
        id: '1',
        title: 'Read chapter 4 & 5',
        course: 'BIO 101',
        deadline: addDays(today, 2).toISOString(),
        scheduledFor: today.toISOString(),
        status: 'pending',
        estimatedMinutes: 60,
      },
      {
        id: '2',
        title: 'Write Essay Outline',
        course: 'CSC 452',
        deadline: addDays(today, 5).toISOString(),
        scheduledFor: addDays(today, 1).toISOString(),
        status: 'pending',
        estimatedMinutes: 45,
      },
      {
        id: '3',
        title: 'Math Problem Set 3',
        course: 'MTH 301',
        deadline: subDays(today, 1).toISOString(),
        scheduledFor: subDays(today, 2).toISOString(),
        status: 'missed',
        estimatedMinutes: 90,
      }
    ]);

    setNotifications([
      {
        id: 'n1',
        message: 'You missed Math Problem Set 3, it has been rescheduled for tomorrow.',
        type: 'warning',
        timestamp: today.toISOString(),
        read: false,
      },
      {
        id: 'n2',
        message: 'You have a 3-day streak! Keep it up.',
        type: 'motivation',
        timestamp: subDays(today, 1).toISOString(),
        read: true,
      }
    ]);
  };

  const login = (email: string, password?: string) => {
    // In a real app we would verify login, here we just hydrate mock data
    seedMockData('Alex Rivera', email, 'Computer Science');
  };

  const signup = (name: string, email: string, password: string, major: string) => {
    // In a real app we'd create the user, here we hydrate empty/starter state
    const today = new Date();
    setUser({
      id: 'mock-user-new',
      name,
      username: email.split('@')[0],
      email,
      major,
      points: 0,
      streak: 0,
      rank: 'Bronze',
    });
    setCourses([]);
    setTasks([]);
    setNotifications([
      {
        id: 'n1',
        message: `Welcome to AcademiAI, ${name.split(' ')[0]}! Add your first course to get started.`,
        type: 'motivation',
        timestamp: today.toISOString(),
        read: false,
      }
    ]);
  };

  const logout = () => {
    setUser(null);
    setTasks([]);
    setNotifications([]);
    setCourses([]);
  };

  const updateProfile = (data: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...data });
      addNotification({
        message: 'Profile updated successfully!',
        type: 'reward'
      });
    }
  };

  const addCourse = (courseInput: Omit<Course, 'id'>) => {
    const newCourse = {
      ...courseInput,
      id: Math.random().toString(36).substr(2, 9),
    };
    setCourses(prev => [...prev, newCourse]);
  };

  const removeCourse = (id: string) => {
    setCourses(prev => prev.filter(c => c.id !== id));
  };

  const addTask = (taskInput: Omit<Task, 'id' | 'status' | 'scheduledFor'>) => {
    // Simulate AI scheduling logic
    const now = new Date();
    const deadlineDate = parseISO(taskInput.deadline);
    let scheduledDate = addDays(now, 1);
    
    if (isAfter(deadlineDate, now)) {
      const diffTime = Math.abs(deadlineDate.getTime() - now.getTime());
      scheduledDate = new Date(now.getTime() + diffTime / 2);
    }
    
    const newTask: Task = {
      ...taskInput,
      id: Math.random().toString(36).substr(2, 9),
      status: 'pending',
      scheduledFor: scheduledDate.toISOString(),
    };
    
    setTasks(prev => [...prev, newTask]);

    addNotification({
      message: `I scheduled "${taskInput.title}" for ${format(scheduledDate, 'EEEE, MMM do')}.`,
      type: 'motivation',
    });
  };

  const completeTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'completed' } : t));
    
    if (user) {
      const newPoints = user.points + 20;
      setUser({
        ...user,
        points: newPoints,
        rank: getRankFromPoints(newPoints),
        streak: user.streak + 1
      });
      
      addNotification({
        message: `Nice! You earned 20 points. You now have a ${user.streak + 1}-day streak!`,
        type: 'reward'
      });
    }
  };

  const addNotification = (n: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: AppNotification = {
      ...n,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <AppContext.Provider value={{ 
      user, tasks, notifications, courses, 
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

