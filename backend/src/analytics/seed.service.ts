import { Injectable } from "@nestjs/common";
import { VALID_EVENTS } from "./analytics.constants";
import { AnalyticsService } from "./analytics.service";

const GAMES = [
  { gameId: "game-1", gameName: "Dragon Quest" },
  { gameId: "game-2", gameName: "Space Shooter" },
  { gameId: "game-3", gameName: "City Builder" },
  { gameId: "game-4", gameName: "Racing Legends" },
] as const;

const PLAYERS = ["player-1", "player-2", "player-3", "player-4", "player-5"] as const;

@Injectable()
export class SeedService {
  constructor(private readonly analyticsService: AnalyticsService) {}

  seed() {
    const { entries } = this.analyticsService.findAll({});
    if (entries.length > 0) return;

    for (let i = 0; i < 20; i++) {
      const game = GAMES[i % GAMES.length];
      const event = VALID_EVENTS[i % VALID_EVENTS.length];
      const playerId = PLAYERS[i % PLAYERS.length];
      const value = Math.round(Math.random() * 1000 * 100) / 100;

      this.analyticsService.create({
        gameId: game.gameId,
        gameName: game.gameName,
        playerId,
        event,
        value,
      });
    }
  }
}
