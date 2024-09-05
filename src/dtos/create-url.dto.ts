import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateUrlDto {
  @IsNotEmpty({ message: 'url不能为空' })
  @IsUrl({}, { message: '请输入有效的网址' })
  @IsString({ message: 'url 类型必须为字符串' })
  @ApiProperty({ description: 'url 需要转换的连接' })
  url: string;
}
