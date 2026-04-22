export interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
  /** YYYY-MM-DD 또는 미설정 */
  dueDate: string | null;
}

export interface ChecklistCategory {
  id: string;
  title: string;
  emoji: string;
  items: ChecklistItem[];
}
