const pool = require("../config/db");

afterAll(async () => {
    await pool.end();
});