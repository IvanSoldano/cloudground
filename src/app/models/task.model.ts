export interface Task {
  id: string;
  title: string;
  completed: boolean;
  assignedPersonId?: string | null;
  assigned_person_id?: string | null;
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
}

