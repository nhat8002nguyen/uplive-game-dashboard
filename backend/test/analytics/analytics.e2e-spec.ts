import * as http from "http";
import type { AddressInfo } from "net";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "src/app.module";
import { WrapResponseInterceptor } from "src/common/interceptors/wrap-response/wrap-response.interceptor";

describe("Analytics (e2e)", () => {
  let app: INestApplication;
  let serverPort: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    app.useGlobalInterceptors(new WrapResponseInterceptor());
    await app.init();
    // listen(0) picks a random available port and keeps it bound for the whole test suite
    await app.listen(0);
    serverPort = (app.getHttpServer().address() as AddressInfo).port;
  });

  afterAll(async () => {
    await app.close();
  });

  describe("POST /analytics", () => {
    it("201 with valid body", async () => {
      const res = await request(app.getHttpServer())
        .post("/analytics")
        .send({
          gameId: "game-1",
          gameName: "Super Game",
          playerId: "player-1",
          event: "match_start",
          value: 100,
        })
        .expect(201);

      expect(res.body.data).toBeDefined();
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.timestamp).toBeDefined();
      expect(res.body.data.gameId).toBe("game-1");
    });

    it("400 with missing required fields", async () => {
      await request(app.getHttpServer())
        .post("/analytics")
        .send({ gameId: "game-1" })
        .expect(400);
    });

    it("400 when value is not a number", async () => {
      await request(app.getHttpServer())
        .post("/analytics")
        .send({
          gameId: "game-1",
          gameName: "Super Game",
          playerId: "player-1",
          event: "match_start",
          value: "not-a-number",
        })
        .expect(400);
    });
  });

  describe("GET /analytics", () => {
    beforeAll(async () => {
      await request(app.getHttpServer()).post("/analytics").send({
        gameId: "game-e2e",
        gameName: "E2E Game",
        playerId: "player-e2e",
        event: "login",
        value: 1,
      });
      await request(app.getHttpServer()).post("/analytics").send({
        gameId: "game-e2e",
        gameName: "E2E Game",
        playerId: "player-e2e",
        event: "purchase",
        value: 9.99,
      });
    });

    it("200 returns array", async () => {
      const res = await request(app.getHttpServer())
        .get("/analytics")
        .expect(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it("filters by gameId", async () => {
      const res = await request(app.getHttpServer())
        .get("/analytics?gameId=game-e2e")
        .expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
      res.body.data.forEach((entry: any) => {
        expect(entry.gameId).toBe("game-e2e");
      });
    });

    it("filters by event", async () => {
      const res = await request(app.getHttpServer())
        .get("/analytics?event=purchase")
        .expect(200);

      res.body.data.forEach((entry: any) => {
        expect(entry.event).toBe("purchase");
      });
    });
  });

  describe("GET /analytics/summary", () => {
    it("200 returns summary shape", async () => {
      const res = await request(app.getHttpServer())
        .get("/analytics/summary")
        .expect(200);

      const summary = res.body.data;
      expect(typeof summary.total).toBe("number");
      expect(typeof summary.averageValue).toBe("number");
      expect(typeof summary.byEvent).toBe("object");
      expect(typeof summary.byGame).toBe("object");
    });

    it("applies gameId filter to summary", async () => {
      const res = await request(app.getHttpServer())
        .get("/analytics/summary?gameId=game-e2e")
        .expect(200);

      const summary = res.body.data;
      expect(summary.total).toBeGreaterThanOrEqual(2);
      expect(summary.byGame["game-e2e"]).toBeGreaterThanOrEqual(2);
    });
  });

  describe("GET /analytics/stream", () => {
    it("responds with 200 and Content-Type: text/event-stream", (done) => {
      const req = http.get(
        `http://127.0.0.1:${serverPort}/analytics/stream`,
        (res) => {
          expect(res.statusCode).toBe(200);
          expect(res.headers["content-type"]).toContain("text/event-stream");
          req.destroy();
          done();
        },
      );
      req.on("error", done);
    });

    it("pushes an SSE event when POST /analytics is called", (done) => {
      let resolved = false;
      let buffer = "";

      const req = http.get(
        `http://127.0.0.1:${serverPort}/analytics/stream`,
        (res) => {
          res.on("data", (chunk: Buffer) => {
            if (resolved) return;
            buffer += chunk.toString();
            if (!buffer.includes("data:")) return;

            // Extract the first data line
            const dataLine = buffer.split("\n").find((l) => l.startsWith("data:"));
            if (!dataLine) return;

            resolved = true;
            req.destroy();

            try {
              // WrapResponseInterceptor wraps SSE items in { data: ... } just like REST
              const parsed = JSON.parse(dataLine.slice("data:".length).trim());
              const entry = parsed.data ?? parsed;
              expect(entry.gameId).toBe("game-sse-e2e");
              done();
            } catch (err) {
              done(err);
            }
          });

          // Trigger a new entry after the SSE connection is established
          setTimeout(() => {
            request(app.getHttpServer())
              .post("/analytics")
              .send({
                gameId: "game-sse-e2e",
                gameName: "SSE Game",
                playerId: "player-sse",
                event: "match_start",
                value: 42,
              })
              .end();
          }, 150);
        },
      );

      req.on("error", (err) => {
        if (!resolved) done(err);
      });

      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          req.destroy();
          done(new Error("Timeout: no SSE event received"));
        }
      }, 3000);
    });
  });

  describe("GET /analytics/export", () => {
    beforeAll(async () => {
      await request(app.getHttpServer()).post("/analytics").send({
        gameId: "game-export",
        gameName: "Export Game",
        playerId: "player-export",
        event: "level_up",
        value: 5,
      });
    });

    it("format=csv returns 200 with text/csv and header row", async () => {
      const res = await request(app.getHttpServer())
        .get("/analytics/export?format=csv")
        .expect(200);

      expect(res.headers["content-type"]).toContain("text/csv");
      expect(res.headers["content-disposition"]).toContain("analytics.csv");

      const lines = (res.text as string).split("\n");
      expect(lines[0]).toBe("id,gameId,gameName,playerId,event,value,timestamp");
      expect(lines.length).toBeGreaterThan(1);
    });

    it("format=json returns 200 with application/json and attachment header", async () => {
      const res = await request(app.getHttpServer())
        .get("/analytics/export?format=json")
        .expect(200);

      expect(res.headers["content-type"]).toContain("application/json");
      expect(res.headers["content-disposition"]).toContain("analytics.json");

      const data = JSON.parse(res.text);
      expect(Array.isArray(data)).toBe(true);
    });

    it("default format (no format param) returns JSON", async () => {
      const res = await request(app.getHttpServer())
        .get("/analytics/export")
        .expect(200);

      expect(res.headers["content-type"]).toContain("application/json");
    });

    it("format=csv with gameId filter returns only matching rows", async () => {
      const res = await request(app.getHttpServer())
        .get("/analytics/export?format=csv&gameId=game-export")
        .expect(200);

      const lines = (res.text as string)
        .split("\n")
        .filter((l: string) => l.trim() !== "");
      // Header + at least one data row
      expect(lines.length).toBeGreaterThanOrEqual(2);
      // Every data row must contain game-export in the gameId column
      lines.slice(1).forEach((line: string) => {
        expect(line).toContain("game-export");
      });
    });
  });
});
