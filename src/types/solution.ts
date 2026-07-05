export type SolutionStep = {
  order: number;
  heading: string;
  detail: string;
};

export type SolutionRecord = {
  id: number;
  problem: string;
  title: string;
  steps: SolutionStep[];
  image?: string | null;
  topic?: string | null;
  difficulty?: string | null;
  bookmarked: boolean;
  hints?: string[] | null;
  createdAt: string;
};

export type SolutionPayload = {
  problem: string;
  image?: string | null;
  topic?: string | null;
};
