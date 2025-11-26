import userRoute from "../routes/user.route.js";
import urlRoute, { redirectRouter } from "../routes/url.route.js";

export const setupRoutes = (app, version) => {
  app.use(`/api/${version}/users`, userRoute);
  app.use(`/api/${version}/urls`, urlRoute);
  app.use("/r", redirectRouter);
};
