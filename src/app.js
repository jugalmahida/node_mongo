import express from 'express';

const app = express();

app.listen(process.env.PORT, () => {
    console.log(`Server Running at ${process.env.PORT}`);
});

export default app;