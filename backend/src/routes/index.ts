import { Context, Hono } from "hono";
import { spendingRoute } from "./Spending.js";
import { analysisRoute } from "./Analysis.js";
import { storageRoute } from "./Storage.js";
import { response_success, response_not_found } from "@/shared/utils/response.utils.js";

const router = new Hono();

router.route("/spendings", spendingRoute);
router.route("/analysis", analysisRoute);
router.route("/storage", storageRoute);

router.get("/health", (c: Context) => response_success(c, { status: "ok" }));
router.all("*", (c: Context) => response_not_found(c));

export default router;
