import { http, HttpError } from "#/integrations/http";
import { serializeQueryParams, type TQueryParams } from "#/utils/request";
import type { TResponse, TPaginatedResponse } from "#/utils/response";
import type {
  TSpending,
  TSpendingRequest,
  TAnalyzeTextRequest,
  TAnalyzeReceiptRequest,
} from "./type";

export type TLLMSpendingOutput = {
  title: string;
  amount: number;
  category: TSpending["category"];
  note?: string;
  date?: string;
};

const BASE_PATH = "/api/spendings";
const QUERY_KEY = (key?: string | TQueryParams | Record<string, unknown>) =>
  ["spendings", key] as const;

function getError(err: unknown): Error {
  if (err instanceof HttpError) return err;
  if (err instanceof Error) return err;
  return new Error("An unexpected error occurred.");
}

const getAll = (params?: TQueryParams) => ({
  queryKey: QUERY_KEY(params),
  queryFn: async () => {
    try {
      const response = await http.getAll<TPaginatedResponse<TSpending>>(
        BASE_PATH,
        {
          params: params ? serializeQueryParams(params) : undefined,
        },
      );
      return response.content;
    } catch (err) {
      throw getError(err);
    }
  },
});

const getById = (id: string) => ({
  queryKey: QUERY_KEY(id),
  queryFn: async () => {
    try {
      const response = await http.get<TResponse<TSpending>>(
        `${BASE_PATH}/${id}`,
      );
      return response.content;
    } catch (err) {
      throw getError(err);
    }
  },
  enabled: !!id,
});

const create = () => ({
  mutationFn: async (data: TSpendingRequest) => {
    try {
      const response = await http.post<TResponse<TSpending>>(BASE_PATH, data);
      return response.content;
    } catch (err) {
      throw getError(err);
    }
  },
});

const update = () => ({
  mutationFn: async ({ id, data }: { id: string; data: TSpendingRequest }) => {
    try {
      const response = await http.put<TResponse<TSpending>>(
        `${BASE_PATH}/${id}`,
        data,
      );
      return response.content;
    } catch (err) {
      throw getError(err);
    }
  },
});

const remove = () => ({
  mutationFn: async ({ id }: { id: string }) => {
    try {
      const response = await http.delete<TResponse<TSpending>>(
        `${BASE_PATH}/${id}`,
      );
      return response.content;
    } catch (err) {
      throw getError(err);
    }
  },
});

const analyzeText = () => ({
  mutationFn: async (data: TAnalyzeTextRequest) => {
    try {
      const response = await http.post<TResponse<TLLMSpendingOutput>>(
        `${BASE_PATH}/analyze-text`,
        data,
      );
      return response.content;
    } catch (err) {
      throw getError(err);
    }
  },
});

const analyzeReceipt = () => ({
  mutationFn: async (data: TAnalyzeReceiptRequest) => {
    try {
      const response = await http.post<TResponse<TLLMSpendingOutput>>(
        `${BASE_PATH}/analyze-receipt`,
        data,
      );
      return response.content;
    } catch (err) {
      throw getError(err);
    }
  },
});

export {
  getAll,
  getById,
  create,
  update,
  remove,
  analyzeText,
  analyzeReceipt,
  QUERY_KEY,
};
