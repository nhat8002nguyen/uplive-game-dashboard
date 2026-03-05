import { Test, TestingModule } from "@nestjs/testing";
import { AnalyticsService } from "./analytics.service";

const ENTRY_DEFAULTS = {
  gameName: "Game A",
  event: "match_start" as const,
  value: 10,
};

function makeEntry(overrides: Partial<Parameters<AnalyticsService["create"]>[0]> = {}) {
  return { ...ENTRY_DEFAULTS, gameId: "game-1", playerId: "p1", ...overrides };
}

describe("AnalyticsService", () => {
  let service: AnalyticsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AnalyticsService],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create()", () => {
    it("assigns a uuid v4 id and ISO timestamp, then appends to the store", () => {
      const entry = service.create(makeEntry());

      expect(entry.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
      expect(new Date(entry.timestamp).toISOString()).toBe(entry.timestamp);
      expect(service.findAll({}).entries.length).toBe(1);
    });

    it("stores all provided fields", () => {
      const entry = service.create(makeEntry({ gameId: "game-2", gameName: "Another Game", playerId: "player-2", event: "purchase", value: 9.99 }));

      expect(entry.gameId).toBe("game-2");
      expect(entry.gameName).toBe("Another Game");
      expect(entry.playerId).toBe("player-2");
      expect(entry.event).toBe("purchase");
      expect(entry.value).toBe(9.99);
    });
  });

  describe("findAll()", () => {
    beforeEach(() => {
      service.create(makeEntry({ gameId: "game-1", playerId: "p1", event: "match_start", value: 10 }));
      service.create(makeEntry({ gameId: "game-1", playerId: "p2", event: "match_end", value: 20 }));
      service.create(makeEntry({ gameId: "game-2", gameName: "Game B", playerId: "p1", event: "purchase", value: 5 }));
      service.create(makeEntry({ gameId: "game-2", gameName: "Game B", playerId: "p3", event: "level_up", value: 1 }));
      service.create(makeEntry({ gameId: "game-3", gameName: "Game C", playerId: "p4", event: "login", value: 0 }));
    });

    it("with no filters returns all entries", () => {
      expect(service.findAll({}).entries.length).toBe(5);
    });

    it("filters by gameId", () => {
      const { entries } = service.findAll({ gameId: "game-1" });
      expect(entries.length).toBe(2);
      entries.forEach((e) => expect(e.gameId).toBe("game-1"));
    });

    it("filters by event", () => {
      const { entries } = service.findAll({ event: "purchase" });
      expect(entries.length).toBe(1);
      expect(entries[0].event).toBe("purchase");
    });

    it("filters by playerId", () => {
      const { entries } = service.findAll({ playerId: "p1" });
      expect(entries.length).toBe(2);
      entries.forEach((e) => expect(e.playerId).toBe("p1"));
    });

    it("filters by startDate and endDate", () => {
      const { entries: all } = service.findAll({});
      const { entries: result } = service.findAll({ startDate: all[0].timestamp, endDate: all[all.length - 1].timestamp });
      expect(result.length).toBeGreaterThanOrEqual(2);
    });

    it("applies limit", () => {
      expect(service.findAll({ limit: 2 }).entries.length).toBe(2);
    });

    it("applies offset", () => {
      const { entries: all } = service.findAll({});
      const { entries: result } = service.findAll({ offset: 2 });
      expect(result.length).toBe(3);
      expect(result[0].id).toBe(all[2].id);
    });

    it("applies limit and offset together", () => {
      const { entries: all } = service.findAll({});
      const { entries: result } = service.findAll({ limit: 2, offset: 1 });
      expect(result.length).toBe(2);
      expect(result[0].id).toBe(all[1].id);
    });
  });

  describe("getStream()", () => {
    it("emits a MessageEvent containing the created entry", (done) => {
      const sub = service.getStream().subscribe((event) => {
        expect(event.data).toEqual(expect.objectContaining({ gameId: "game-stream" }));
        sub.unsubscribe();
        done();
      });
      service.create(makeEntry({ gameId: "game-stream" }));
    });

    it("emits one event per create() call", (done) => {
      const received: any[] = [];
      const sub = service.getStream().subscribe((event) => {
        received.push(event.data);
        if (received.length === 2) {
          expect(received[0]).toEqual(expect.objectContaining({ gameId: "game-a" }));
          expect(received[1]).toEqual(expect.objectContaining({ gameId: "game-b" }));
          sub.unsubscribe();
          done();
        }
      });
      service.create(makeEntry({ gameId: "game-a" }));
      service.create(makeEntry({ gameId: "game-b" }));
    });
  });

  describe("getSummary()", () => {
    beforeEach(() => {
      service.create(makeEntry({ gameId: "game-1", playerId: "p1", event: "match_start", value: 10 }));
      service.create(makeEntry({ gameId: "game-1", playerId: "p2", event: "match_end", value: 20 }));
      service.create(makeEntry({ gameId: "game-2", gameName: "Game B", playerId: "p1", event: "purchase", value: 5 }));
    });

    it("computes total, averageValue, byEvent, and byGame correctly", () => {
      const summary = service.getSummary({});
      expect(summary.total).toBe(3);
      expect(summary.averageValue).toBeCloseTo((10 + 20 + 5) / 3);
      expect(summary.byEvent).toEqual({ match_start: 1, match_end: 1, purchase: 1 });
      expect(summary.byGame).toEqual({ "game-1": 2, "game-2": 1 });
    });

    it("returns zero averageValue when no entries match the filter", () => {
      const summary = service.getSummary({ gameId: "nonexistent" });
      expect(summary.total).toBe(0);
      expect(summary.averageValue).toBe(0);
    });

    it("respects filters when computing summary", () => {
      const summary = service.getSummary({ gameId: "game-1" });
      expect(summary.total).toBe(2);
      expect(summary.byGame["game-1"]).toBe(2);
      expect(summary.byGame["game-2"]).toBeUndefined();
    });
  });
});
