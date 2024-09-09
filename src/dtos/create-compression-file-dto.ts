import { ApiBody, ApiParam, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class CreateCompressionFileDto {

  @ApiPropertyOptional({ description: '压缩阀值(1-100)', example: '70' })
  @IsString()
  quality?: string

  // 这里
  @ApiProperty({ type: 'string', format: 'binary' })
  file: File
}
