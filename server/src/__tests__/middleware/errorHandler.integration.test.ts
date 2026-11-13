import { describe, expect, it } from "vitest";
import request from "supertest";

import app from "../../app.js";

describe("error handling (integration)", () => {
  it("returns 400 for malformed JSON instead of 500", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .set("Content-Type", "application/json")
      .send('{"email":"user@example.com","password":"SuperSecret@123"');

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      success: false,
      message: "Invalid JSON body",
    });
    expect(JSON.stringify(res.body)).not.toContain("SuperSecret@123");
    expect(res.body).not.toHaveProperty("stack");
  });

  it("returns 413 when the body exceeds the 1mb limit", async () => {
    const payload = JSON.stringify({ email: "x".repeat(1024 * 1024 + 32) });
    const res = await request(app)
      .post("/api/auth/login")
      .set("Content-Type", "application/json")
      .send(payload);

    expect(res.status).toBe(413);
    expect(res.body).toEqual({
      success: false,
      message: "Request body too large",
    });
  });

  it("returns 415 for an unsupported content encoding", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .set("Content-Type", "application/json")
      .set("Content-Encoding", "compress")
      .send('{"email":"user@example.com","password":"x"}');

    expect(res.status).toBe(415);
    expect(res.body).toEqual({
      success: false,
      message: "Unsupported content encoding",
    });
  });
});
