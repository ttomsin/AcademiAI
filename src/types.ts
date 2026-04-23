export type Rank = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Master' | 'Grandmaster';

export interface User {
  id: string;
  name: string;
  username: string; // Added username
  email: string;
  major: string; // Course of study
  points: number;
  streak: number;
  rank: Rank;
}

export interface Course {
  id: string;
  code: string;
  name: string;
}

export type TaskStatus = 'pending' | 'completed' | 'missed';

export interface Task {
  id: string;
  title: string;
  course: string; // Will store course code
  deadline: string; // ISO string
  scheduledFor: string; // ISO string
  status: TaskStatus;
  estimatedMinutes: number;
}

export type NotificationType = 'reminder' | 'warning' | 'motivation' | 'reward';

export interface AppNotification {
  id: string;
  message: string;
  type: NotificationType;
  timestamp: string; // ISO string
  read: boolean;
}

