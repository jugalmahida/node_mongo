import userRoute from '../routes/user.route.js';

export const setupRoutes = (app, version) => {
    app.use(`/api/${version}/users`, userRoute);
};