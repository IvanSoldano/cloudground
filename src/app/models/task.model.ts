export interface Task {
  id: string;
  title: string;
  completed: boolean;
  plannedStartDate?: string;
  plannedEndDate?: string;
  assigneeId?: string;
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
