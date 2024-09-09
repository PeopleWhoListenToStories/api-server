import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty, IsNumber, IsInt } from 'class-validator';

export class CreateUploadThunkDto {
  @ApiPropertyOptional({ description: '文件名称', example: '测试文件名称' })
  @IsOptional() // 标记为可选字段
  @IsString({ message: 'fileName must be a string if provided' }) // 当提供时必须是字符串
  fileName?: string;

  @ApiProperty({ description: '文件内容生成的Md5', example: '704c038c5819561509cd1c53b2391f2c' })
  @IsString({ message: 'fileMd5 must be a string' })
  @IsNotEmpty({ message: 'fileMd5不能为空' })
  fileMd5: string;

  @ApiProperty({ description: '文件大小 (字节)', example: 10485760 })
  @IsNotEmpty({ message: 'fileSize不能为空' })
  fileSize: string;

  @ApiProperty({ description: '当前分片的下标，从1开始', example: 1 })
  @IsNotEmpty({ message: 'chunkIndex不能为空' })
  chunkIndex: string;

  @ApiProperty({ description: '当前分片每片的大小', example: 1024 * 1024 * 1 })
  @IsNotEmpty({ message: 'chunkSize不能为空' })
  chunkSize: string;

  @ApiProperty({ description: '分片总片数', example: 10 })
  @IsNotEmpty({ message: 'chunkTotal不能为空' })
  chunkTotal: string;

  @ApiProperty({ description: '上传的文件', type: 'string', format: 'binary' })
  file: any;
}
