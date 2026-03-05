import { Injectable } from "@nestjs/common";
import type { MessageEvent } from "@nestjs/common";
import { Observable, Subject, map } from "rxjs";
import { v4 as uuidv4 } from "uuid";
import { CreateAnalyticsDto } from "./dto/create-analytics.dto";
import { AnalyticsQueryDto } from "./dto/analytics-query.dto";
import { AnalyticsEntry } from "./entities/analytics-entry.entity";

export interface AnalyticsSummary {
  total: number;
  averageValue: number;
  byEvent: Record<string, number>;
  byGame: Record<string, number>;
}

@Injectable()
export class AnalyticsService {
  private readonly entries: AnalyticsEntry[] = [];
  private readonly newEntry$ = new Subject<AnalyticsEntry>();

  create(dto: CreateAnalyticsDto): AnalyticsEntry {
    const entry: AnalyticsEntry = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      ...dto,
    };
    this.entries.push(entry);
    this.newEntry$.next(entry);
    return entry;
  }

  getStream(): Observable<MessageEvent> {
    return this.newEntry$.pipe(map((entry) => ({ data: entry })));
  }

  findAll(query: AnalyticsQueryDto): { entries: AnalyticsEntry[]; total: number } {
    const startMs = query.startDate ? new Date(query.startDate).getTime() : null;
    const endMs = query.endDate ? new Date(query.endDate).getTime() : null;
    const offset = query.offset ?? 0;

    const filtered = this.entries.filter((e) => {
      if (query.gameId && e.gameId !== query.gameId) return false;
      if (query.event && e.event !== query.event) return false;
      if (query.playerId && e.playerId !== query.playerId) return false;
      if (startMs && new Date(e.timestamp).getTime() < startMs) return false;
      if (endMs && new Date(e.timestamp).getTime() > endMs) return false;
      return true;
    });

    const total = filtered.length;
    const sorted = [...filtered].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
    const paginated = sorted.slice(offset);
    const entries = query.limit !== undefined ? paginated.slice(0, query.limit) : paginated;
    return { entries, total };
  }

  getSummary(query: Omit<AnalyticsQueryDto, "limit" | "offset">): AnalyticsSummary {
    const { entries } = this.findAll(query);
    const total = entries.length;
    const averageValue =
      total === 0 ? 0 : entries.reduce((sum, e) => sum + e.value, 0) / total;

    const byEvent: Record<string, number> = {};
    const byGame: Record<string, number> = {};

    for (const entry of entries) {
      byEvent[entry.event] = (byEvent[entry.event] ?? 0) + 1;
      byGame[entry.gameId] = (byGame[entry.gameId] ?? 0) + 1;
    }

    return { total, averageValue, byEvent, byGame };
  }
}
