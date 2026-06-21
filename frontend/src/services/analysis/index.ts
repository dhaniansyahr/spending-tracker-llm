import { http, HttpError } from "#/integrations/http";
import type { TResponse } from "#/utils/response";
import type { TVerdictRequest, TVerdictResponse } from "./type";

const BASE_PATH = "/api/analysis";

function getError(err: unknown): Error {
  if (err instanceof HttpError) return err;
  if (err instanceof Error) return err;
  return new Error("An unexpected error occurred.");
}

const getVerdict = () => ({
  mutationFn: async (data: TVerdictRequest) => {
    try {
      const response = await http.post<TResponse<TVerdictResponse>>(
        `${BASE_PATH}/verdict`,
        data,
      );
      return response.content;
    } catch (err) {
      throw getError(err);
    }
  },
});

export { getVerdict };
