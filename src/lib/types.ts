export interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
  /** YYYY-MM-DD 또는 미설정 */
  dueDate: string | null;
  /** 업체명·가격·연락처 등 자유 메모 */
  memo: string;
}

export interface ChecklistCategory {
  id: string;
  title: string;
  emoji: string;
  items: ChecklistItem[];
}
