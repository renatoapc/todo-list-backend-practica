const request = require("supertest");
const app = require("../app");

test("GET /tasks sin token responde 401", async () => {
    const response = await request(app).get("/tasks");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: "Token requerido" });
});

test("GET /tasks con token válido responde lista de tareas del usuario", async () => {
    const email = `tasks${Date.now()}@example.com`;

    await request(app)
       .post("/auth/register")
       .send({
           name: "Tasks User",
           email,
           password: "123456"
       });

    const loginResponse = await request(app)
       .post("/auth/login")
       .send({
           email,
           password: "123456"
       });

    const token = loginResponse.body.token;

    const response = await request(app)
       .get("/tasks")
       .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
});

test("POST /tasks con token válido crea una tarea del usuario", async () => {
    const email = `createtask${Date.now()}@example.com`;

    await request(app)
       .post("/auth/register")
       .send({
        name: "Create Task User",
        email,
        password: "123456"
       });

    const loginResponse = await request(app)
       .post("/auth/login")
       .send({
        email,
        password: "123456"
       });

    const token = loginResponse.body.token;

    const response = await request(app)
       .post("/tasks")
       .set("Authorization", `Bearer ${token}`)
       .send({
           text: "Aprender tests con Supertest"
       });

    expect(response.status).toBe(201);
    expect(response.body.text).toBe("Aprender tests con Supertest");
    expect(response.body.done).toBe(false);
    expect(response.body).toHaveProperty("user_id");
});


test("POST /tasks duplicada del mismo usuario responde 409", async () => {
    const email = `duplicatetask${Date.now()}@example.com`;

    await request(app)
        .post("/auth/register")
        .send({
            name: "Duplicate Task User",
            email,
            password: "123456"
        });

    const loginResponse = await request(app)
        .post("/auth/login")
        .send({
            email,
            password: "123456"
        });

    const token = loginResponse.body.token;

    await request(app)
        .post("/tasks")
        .set("Authorization", `Bearer ${token}`)
        .send({
            text: "Tarea duplicada"
        });

    const response = await request(app)
        .post("/tasks")
        .set("Authorization", `Bearer ${token}`)
        .send({
            text: "Tarea duplicada"
        });

    expect(response.status).toBe(409);
    expect(response.body).toEqual({ message: "La tarea ya existe" });
});


test("POST /tasks permite mismo texto para usuarios distintos", async () => {
    const emailOne = `sameone${Date.now()}@example.com`;
    const emailTwo = `sametwo${Date.now()}@example.com`;

    await request(app)
       .post("/auth/register")
       .send({
           name: "Same Text User One",
           email: emailOne,
           password: "123456"
       });

    await request(app)
       .post("/auth/register")
       .send({
           name: "Same Text User Two",
           email: emailTwo,
           password: "123456"
       });

    const loginOne = await request(app)
       .post("/auth/login")
       .send({
           email: emailOne,
           password: "123456"
       });

    const loginTwo = await request(app)
       .post("/auth/login")
       .send({
           email: emailTwo,
           password: "123456"
       });

    const responseOne = await request(app)
       .post("/tasks")
       .set("Authorization", `Bearer ${loginOne.body.token}`)
       .send({
           text: "Mismo texto permitido"
       });

    const responseTwo = await request(app)
       .post("/tasks")
       .set("Authorization", `Bearer ${loginTwo.body.token}`)
       .send({
           text: "Mismo texto permitido"
       });

    expect(responseOne.status).toBe(201);
    expect(responseTwo.status).toBe(201);
    expect(responseOne.body.text).toBe("Mismo texto permitido");
    expect(responseTwo.body.text).toBe("Mismo texto permitido");
    expect(responseOne.body.user_id).not.toBe(responseTwo.body.user_id);
});

test("GET /tasks no devuelve tareas de otros usuarios", async () => {
    const emailOne = `privateone${Date.now()}@example.com`;
    const emailTwo = `privatetwo${Date.now()}@example.com`;

    await request(app)
       .post("/auth/register")
       .send({
           name: "Private User One",
           email: emailOne,
           password: "123456"
       });

    await request(app)
       .post("/auth/register")
       .send({
           name: "Private User Two",
           email: emailTwo,
           password: "123456"
       });

    const loginOne = await request(app)
       .post("/auth/login")
       .send({
           email: emailOne,
           password: "123456"
       });

    const loginTwo = await request(app)
       .post("/auth/login")
       .send({
           email: emailTwo,
           password: "123456"
       });

    await request(app)
       .post("/tasks")
       .set("Authorization", `Bearer ${loginOne.body.token}`)
       .send({
           text: "Tarea privada del usuario uno"
       });

    const response = await request(app)
       .get("/tasks")
       .set("Authorization", `Bearer ${loginTwo.body.token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
});


test("PUT /tasks/:id no permite actualizar tareas de otro usuario", async () => {
    const emailOne = `updateone${Date.now()}@example.com`;
    const emailTwo = `updatetwo${Date.now()}@example.com`;

    await request(app)
        .post("/auth/register")
        .send({
            name: "Update User One",
            email: emailOne,
            password: "123456"
        });

    await request(app)
        .post("/auth/register")
        .send({
            name: "Update User Two",
            email: emailTwo,
            password: "123456"
        });

    const loginOne = await request(app)
        .post("/auth/login")
        .send({
            email: emailOne,
            password: "123456"
        });

    const loginTwo = await request(app)
        .post("/auth/login")
        .send({
            email: emailTwo,
            password: "123456"
        });

    const taskResponse = await request(app)
        .post("/tasks")
        .set("Authorization", `Bearer ${loginOne.body.token}`)
        .send({
            text: "Tarea que no debe tocar otro usuario"
        });

    const response = await request(app)
        .put(`/tasks/${taskResponse.body.id}`)
        .set("Authorization", `Bearer ${loginTwo.body.token}`)
        .send({
            done: true
        });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: "Tarea no encontrada" });
});

test("DELETE /tasks/:id no permite eliminar tareas de otro usuario", async () => {
    const emailOne = `deleteone${Date.now()}@example.com`;
    const emailTwo = `deletetwo${Date.now()}@example.com`;

    await request(app)
        .post("/auth/register")
        .send({
            name: "Delete User One",
            email: emailOne,
            password: "123456"
        });

    await request(app)
        .post("/auth/register")
        .send({
            name: "Delete User Two",
            email: emailTwo,
            password: "123456"
        });

    const loginOne = await request(app)
        .post("/auth/login")
        .send({
            email: emailOne,
            password: "123456"
        });

    const loginTwo = await request(app)
        .post("/auth/login")
        .send({
            email: emailTwo,
            password: "123456"
        });

    const taskResponse = await request(app)
        .post("/tasks")
        .set("Authorization", `Bearer ${loginOne.body.token}`)
        .send({
            text: "Tarea que no debe borrar otro usuario"
        });

    const response = await request(app)
        .delete(`/tasks/${taskResponse.body.id}`)
        .set("Authorization", `Bearer ${loginTwo.body.token}`);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: "Tarea no encontrada" });
});


test("PUT /tasks/:id con done no booleano responde 400", async () => {
    const email = `invaliddone${Date.now()}@example.com`;

    await request(app)
        .post("/auth/register")
        .send({
            name: "Invalid Done User",
            email,
            password: "123456"
        });

    const loginResponse = await request(app)
        .post("/auth/login")
        .send({
            email,
            password: "123456"
        });

    const taskResponse = await request(app)
        .post("/tasks")
        .set("Authorization", `Bearer ${loginResponse.body.token}`)
        .send({
            text: "Validar done"
        });

    const response = await request(app)
        .put(`/tasks/${taskResponse.body.id}`)
        .set("Authorization", `Bearer ${loginResponse.body.token}`)
        .send({
            done: "true"
        });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: "done debe ser booleano" });
});

test("POST /tasks con texto vacío responde 400", async () => {
    const email = `emptytext${Date.now()}@example.com`;

    await request(app)
        .post("/auth/register")
        .send({
            name: "Empty Text User",
            email,
            password: "123456"
        });

    const loginResponse = await request(app)
        .post("/auth/login")
        .send({
            email,
            password: "123456"
        });

    const response = await request(app)
        .post("/tasks")
        .set("Authorization", `Bearer ${loginResponse.body.token}`)
        .send({
            text: "   "
        });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: "El texto es obligatorio" });
});