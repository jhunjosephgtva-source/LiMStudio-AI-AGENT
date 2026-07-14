export type ProcessRecord = {
  id: string;
  title: string;
  category: string | null;
  content: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ChatTurn = {
  role: "user" | "assistant";
  content: string;
  sources?: string[]; // process titles cited
};
