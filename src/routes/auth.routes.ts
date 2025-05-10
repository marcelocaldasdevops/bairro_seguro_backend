import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import jwt from "jwt-simple";

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
// auth.routes.ts
router.get('/test-token', (req, res) => {
    const testPayload = { userId: 2 };
    const token = jwt.encode(testPayload, process.env.JWT_SECRET!);
    res.json({ token });
});
export const authRouter = router;