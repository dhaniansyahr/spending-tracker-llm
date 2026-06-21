import type { ServiceResponse } from "@/shared/entities/service.entity.js";
import { Context } from "hono";
import { TypedResponse } from "hono/types";
import { StatusCode } from "hono/utils/http-status";

export const response_handler = (
  c: Context,
  status: StatusCode,
  content: unknown = null,
  message = "",
  errors: unknown[] = []
): TypedResponse => {
  c.status(status);
  return c.json({ content, message, errors });
};

export const response_success = (
  c: Context,
  content: unknown = null,
  message = "Success"
): TypedResponse => response_handler(c, 200, content, message);

export const response_created = (
  c: Context,
  content: unknown = null,
  message = "Created"
): TypedResponse => response_handler(c, 201, content, message);

export const response_bad_request = (
  c: Context,
  message = "Bad Request",
  errors: unknown[] = []
): TypedResponse => response_handler(c, 400, undefined, message, errors);

export const response_not_found = (
  c: Context,
  message = "Not Found"
): TypedResponse => response_handler(c, 404, undefined, message);

export const response_unprocessable_entity = (
  c: Context,
  message = "Unprocessable Entity"
): TypedResponse => response_handler(c, 422, undefined, message);

export const response_internal_server_error = (
  c: Context,
  message = "Internal Server Error"
): TypedResponse => response_handler(c, 500, undefined, message);

export const handleServiceErrorWithResponse = (
  c: Context,
  res: ServiceResponse<any>
): TypedResponse => {
  switch (res.err?.code) {
    case 400:
      return response_bad_request(c, res.err.message);
    case 404:
      return response_not_found(c, res.err.message);
    case 422:
      return response_unprocessable_entity(c, res.err.message);
    case 401:
      return response_handler(c, 401, undefined, res.err.message);
    default:
      return response_internal_server_error(c, res.err?.message);
  }
};
