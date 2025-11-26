import { Router } from "express";
import {
  createShortUrl,
  getShortUrlDetails,
  redirectShortUrl,
} from "../controllers/url.controller.js";

const apiRouter = Router();
const redirectRouter = Router();

apiRouter.post("/", createShortUrl);
apiRouter.get("/:code", getShortUrlDetails);

redirectRouter.get("/:code", redirectShortUrl);

export { redirectRouter };
export default apiRouter;
