import express from 'express';
import { register, login, verifyCode ,logout, profile } from '../controllers/user.controller.js';
import { auth } from '../middlewares/authmiddleware.js'

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/verify-code', verifyCode);
router.get('/profile', auth, profile);
router.post('/logout', auth, logout);

export default router;