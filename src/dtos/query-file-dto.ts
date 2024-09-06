import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl } from 'class-validator'

export class QueryFileDto {
  @IsOptional()
  // @IsNumber({}, { message: 'page 类型必须为数字' })
  @ApiPropertyOptional({ description: 'page 分页起始页数', example: 1 })
  page?: number

  @IsOptional()
  // @IsNumber({}, { message: 'pageSize 类型必须为数字' })
  @ApiPropertyOptional({ description: 'pageSize 分页起始条数', example: 10 })
  pageSize?: number

  @IsOptional()
  @IsString({ message: 'fileKey 类型必须为字符串' })
  @ApiPropertyOptional({ description: '文件的fileKey' })
  fileKey?: string

  @IsOptional()
  @IsString({ message: 'fileName 类型必须为字符串' })
  @ApiPropertyOptional({ description: '文件的fileName' })
  fileName?: string

  @IsOptional()
  @IsString({ message: 'originalName 类型必须为字符串' })
  @ApiPropertyOptional({ description: '文件的originalName' })
  originalName?: string

  @IsOptional()
  @IsString({ message: 'createTime 类型必须为字符串' })
  @ApiPropertyOptional({ description: '文件的createTime' })
  createTime?: string
}
