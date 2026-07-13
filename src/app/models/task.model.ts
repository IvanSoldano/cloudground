export interface Task {
  id: string;
  title: string;
  completed: boolean;
<<<<<<< HEAD
  assignedPersonId?: string | null;
  assigned_person_id?: string | null;
=======
  plannedStartDate?: string;
  plannedEndDate?: string;
  assigneeId?: string;
  raci_category?: number;
}

export interface TaskLog {
  id: string;
  taskId: string;
  fieldChanged: string;
  oldValue: string;
  newValue: string;
  justification: string;
  timestamp: string;
>>>>>>> 44ffd9146989b7a3a3f5ca631341274d1aa4daac
}

