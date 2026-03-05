import { Body, Controller, Get, Post, Query, Res, Sse } from "@nestjs/common";
import type { MessageEvent } from "@nestjs/common";
import type { Response } from "express";
import { Observable } from "rxjs";
import { ApiTags } from "@nestjs/swagger";
import { AnalyticsService } from "./analytics.service";
import { AnalyticsQueryDto, ExportQueryDto } from "./dto/analytics-query.dto";
import { CreateAnalyticsDto } from "./dto/create-analytics.dto";
import { AnalyticsEntry } from "./entities/analytics-entry.entity";

const CSV_HEADER = "id,gameId,gameName,playerId,event,value,timestamp";

function escapeCsvField(value: string | number): string {
  const str = String(value);
  return /[",\n\r]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

function toCsv(entries: AnalyticsEntry[]): string {
  const rows = entries.map((e) =>
    [e.id, e.gameId, e.gameName, e.playerId, e.event, e.value, e.timestamp]
      .map(escapeCsvField)
      .join(","),
  );
  return [CSV_HEADER, ...rows].join("\n");
}

@ApiTags("analytics")
@Controller("analytics")
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post()
  create(@Body() createAnalyticsDto: CreateAnalyticsDto) {
    return this.analyticsService.create(createAnalyticsDto);
  }

  @Sse("stream")
  stream(): Observable<MessageEvent> {
    return this.analyticsService.getStream();
  }

  @Get("summary")
  getSummary(@Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getSummary(query);
  }

  @Get("export")
  export(@Query() query: ExportQueryDto, @Res() res: Response) {
    const { format = "json", limit: _l, offset: _o, ...filters } = query;
    const { entries } = this.analyticsService.findAll(filters);

    if (format === "csv") {
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", 'attachment; filename="analytics.csv"');
      res.send(toCsv(entries));
    } else {
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Content-Disposition", 'attachment; filename="analytics.json"');
      res.send(JSON.stringify(entries));
    }
  }

  @Get()
  findAll(@Query() query: AnalyticsQueryDto) {
    return this.analyticsService.findAll(query);
  }
}
