const request = require("supertest");
const app = require("../app");

test("POST /auth/register crea un usuario", async () => {
    const response = await request(app)
    .post("/auth/register")
    .send({
        name: "Test User",
        email: `test${Date.now()}@example.com`,
        password: "123456"
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.name).toBe("Test User");
    expect(response.body).toHaveProperty("email");
    expect(response.body).not.toHaveProperty("password_hash");
});

test("POST /auth/login devuelve token y usuario", async () => {
    const email = `login${Date.now()}@example.com`;

    await request(app)
       .post("/auth/register")
       .send({
           name: "Login User",
           email,
           password: "123456"
       });

    const response = await request(app)
       .post("/auth/login")
       .send({
           email,
           password: "123456"
       });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
    expect(response.body.user).toHaveProperty("id");
    expect(response.body.user.name).toBe("Login User");
    expect(response.body.user.email).toBe(email);
    expect(response.body.user).not.toHaveProperty("password_hash");
});

test("POST /auth/login con usuario inexistente responde 401", async () => {
    const response = await request(app)
       .post("/auth/login")
       .send({
        email: `noexiste${Date.now()}@example.com`,
        password: "123456"
       });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: "Credenciales inválidas" });
});

test("POST /auth/login con password incorrecto responde 401", async () => {
    const email = `wrongpass${Date.now()}@example.com`;

    await request(app)
       .post("/auth/register")
       .send({
           name: "Wrong Password User",
           email,
           password: "123456"
       });

    const response = await request(app)
       .post("/auth/login")
       .send({
           email,
           password: "wrong-password"
       });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: "Credenciales inválidas" });
});