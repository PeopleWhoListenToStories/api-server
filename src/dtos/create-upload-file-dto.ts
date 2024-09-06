import { ApiBody, ApiParam, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class CreateUploadFileDto {
  @ApiPropertyOptional({ description: '文件名称', example: '测试文件名称' })
  @IsString()
  name?: string

  @ApiPropertyOptional({ description: '是否唯一', example: '0' })
  @IsString()
  unique?: string

  // 这里
  @ApiProperty({ type: 'string', format: 'binary' })
  file: File
}
