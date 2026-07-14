export interface WikiPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  author_id: number | null;
  author_name?: string;
  created_at: string;
  updated_at: string;
  history?: WikiHistory[];
}

export interface WikiHistory {
  id: string;
  page_id: string;
  content: string;
  author_id: number | null;
  author_name?: string;
  created_at: string;
}
