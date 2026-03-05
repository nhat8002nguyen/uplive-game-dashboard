import { Type } from "class-transformer";
import { IsIn, IsInt, IsISO8601, IsOptional, IsString, Min } from "class-validator";
import { VALID_EVENTS } from "../analytics.constants";

export class AnalyticsQueryDto {
  @IsOptional()
  @IsString()
  gameId?: string;

  @IsOptional()
  @IsIn(VALID_EVENTS)
  event?: string;

  @IsOptional()
  @IsString()
  playerId?: string;

  @IsOptional()
  @IsISO8601()
  startDate?: string;

  @IsOptional()
  @IsISO8601()
  endDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;
}

export class ExportQueryDto extends AnalyticsQueryDto {
  @IsOptional()
  @IsIn(["csv", "json"])
  format?: "csv" | "json";
}
