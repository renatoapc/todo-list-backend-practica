const request = require("supertest");
const app = require("../app");

test("GET /health responde status ok", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
});