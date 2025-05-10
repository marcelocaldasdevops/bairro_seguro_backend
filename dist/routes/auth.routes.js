"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const jwt_simple_1 = __importDefault(require("jwt-simple"));
const router = (0, express_1.Router)();
router.post('/register', auth_controller_1.AuthController.register);
router.post('/login', auth_controller_1.AuthController.login);
// auth.routes.ts
router.get('/test-token', (req, res) => {
    const testPayload = { userId: 2 };
    const token = jwt_simple_1.default.encode(testPayload, process.env.JWT_SECRET);
    res.json({ token });
});
exports.authRouter = router;
