import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsNumber, IsString } from "class-validator";
import { VALID_EVENTS, type AnalyticsEvent } from "../analytics.constants";

export class CreateAnalyticsDto {
  @ApiProperty({ example: "game-1" })
  @IsString()
  gameId: string;

  @ApiProperty({ example: "Dragon Quest" })
  @IsString()
  gameName: string;

  @ApiProperty({ example: "player-1" })
  @IsString()
  playerId: string;

  @ApiProperty({ enum: VALID_EVENTS, example: "match_start" })
  @IsIn(VALID_EVENTS)
  event: AnalyticsEvent;

  @ApiProperty({ example: 100 })
  @IsNumber()
  value: number;
}
