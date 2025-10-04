export type Category = 'jobb' | 'familj' | 'hälsa';

export interface Task {
  id: string;
  title: string;
  description?: string;
  time?: string;
  category: Category;
  urgent?: boolean;
  completed?: boolean;
  progress?: number; //0-100
  dueDate?: string;
}

export interface CategoryStyle {
  bg: string;
  borderColor: string;
  textColor: string;
  shadowColor: string;
  badgeBg: string;
  pattern: string;
}
