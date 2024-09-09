import { ApiBody, ApiParam, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class CreateImageUploadFileDto {
  @ApiPropertyOptional({ description: '图片的宽度', example: 100 })
  @IsString()
  width?: number

  @ApiPropertyOptional({ description: '图片的高度', example: 100 })
  @IsString()
  height?: number

  @ApiProperty({ type: 'string', format: 'binary' })
  file: File
}
