export type TError = {
  field: string;
  message: string;
};

export type TResponse<T> = {
  content: T;
  errors?: TError[];
  message: string;
};

export type TPaginatedResponse<T> = TResponse<{
  entries: T[];
  totalData: number;
  totalPage: number;
}>;
