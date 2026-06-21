export type TVerdictRequest = {
  dateFrom: string;
  dateTo: string;
};

export type TVerdictResponse = {
  verdict: string;
  insights: [string, string, string];
  recommendations: [string, string, string];
  totalAmount: number;
  byCategory: Record<string, number>;
};
