const authService = require("../services/authService");

const register = async (req, res) => {
    const { name, email, password } = req.body;

    if (
        !name || name.trim() === "" || 
        !email || email.trim() === "" || 
        !password || password.trim() === "" 
    ) {
        return res.status(400).json({ message: "name, email y password son obligatorios" });
    }

    try {
        const result = await authService.register(
            name.trim(), 
            email.trim().toLowerCase(), 
            password)

        if (result.error === "EMAIL_ALREADY_EXISTS") {
            return res.status(409).json({ message: "El email ya está registrado" });
        }

        res.status(201).json(result.user);
    } catch (error) {
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    if (
        typeof email !== "string" || email.trim() === "" ||
        typeof password !== "string" || password.trim() === "" 
    ) {
        return res.status(400).json({ message: "email y password son obligatorios" });
    }

    try {
        const result = await authService.login(
            email.trim().toLowerCase(),
            password
        );

        if (result.error === "INVALID_CREDENTIALS") {
            return res.status(401).json({ message: "Credenciales inválidas" });
        }

        res.json(result);
    } catch (error) {
        console.error("Error en POST /auth/login:", error?.stack || error?.message || String(error));
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

module.exports = {
    register,
    login
};