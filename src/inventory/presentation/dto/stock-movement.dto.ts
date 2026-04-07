import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LedgerReferenceKind } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class AddStockDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  productId: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  locationId: string;

  @ApiProperty({ example: 12.5, description: 'Quantity to add (inbound)' })
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @IsPositive()
  quantity: number;

  @ApiPropertyOptional({ enum: LedgerReferenceKind, default: LedgerReferenceKind.MANUAL })
  @IsOptional()
  @IsEnum(LedgerReferenceKind)
  referenceKind?: LedgerReferenceKind;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(128)
  referenceId?: string;

  @ApiPropertyOptional({
    description: 'Optional idempotency key; must be unique per movement when set',
  })
  @IsOptional()
  @IsString()
  @MaxLength(128)
  idempotencyKey?: string;
}

export class RemoveStockDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  productId: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  locationId: string;

  @ApiProperty({ example: 4, description: 'Quantity to remove (outbound)' })
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @IsPositive()
  quantity: number;

  @ApiPropertyOptional({ enum: LedgerReferenceKind, default: LedgerReferenceKind.MANUAL })
  @IsOptional()
  @IsEnum(LedgerReferenceKind)
  referenceKind?: LedgerReferenceKind;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(128)
  referenceId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(128)
  idempotencyKey?: string;
}

export class StockMovementResultDto {
  @ApiProperty()
  stockPositionId: string;

  @ApiProperty({ description: 'Current cached on-hand quantity after movement' })
  quantityOnHand: string;

  @ApiProperty()
  version: number;

  @ApiProperty()
  ledgerEntryId: string;
}
