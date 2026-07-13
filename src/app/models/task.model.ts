export interface Task {
  id: string;
  title: string;
  completed: boolean;
  assignedPersonId?: string | null;
  assigned_person_id?: string | null;
}

