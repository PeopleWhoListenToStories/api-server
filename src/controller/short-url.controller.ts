import { BadRequestException, ClassSerializerInterceptor, Controller, Get, HttpCode, HttpStatus, Inject, Param, Query, Redirect, Res, UseGuards, UseInterceptors } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Response } from 'express'
import { CreateUrlDto } from '~/dtos/create-url.dto'
import { ShortUrlService } from '~/services/short-url.service'

// import { JwtAuthGuard } from '~/guard/jwt-auth.guard';

@ApiTags('ShortUrl 模块')
@Controller('')
@ApiBearerAuth()
export class ShortUrlController {
  constructor(@Inject(ShortUrlService) private shortUrlService: ShortUrlService) {}

  /**
   * 通过url生成短链code
   * @param req
   * @param url
   * @returns code 短链code
   */
  @ApiOperation({ summary: '通过url生成短链code' })
  @ApiResponse({ status: 200, description: '通过url生成短链code' })
  @ApiQuery({ type: CreateUrlDto, name: 'url', description: '长链url地址' })
  @Get('/')
  // @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @HttpCode(HttpStatus.OK)
  async generateShortUrl(@Query('url') longUrl: string) {
    return this.shortUrlService.generate(longUrl)
  }

  /**
   * @description 通过code获取重定向到长链url地址
   * @param code 短链code
   * @returns
   */
  @ApiOperation({ summary: '通过code获取重定向到长链url地址' })
  @ApiResponse({ status: 200, description: '通过code获取重定向到长链url地址' })
  @Get('/:code')
  // @Redirect('https://docs.nestjs.com', 302)
  // @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @HttpCode(HttpStatus.OK)
  async jump(@Param('code') code, @Res() res: Response) {
    const longUrl = await this.shortUrlService.getLongUrl(code)
    if (!longUrl) {
      throw new BadRequestException('短链不存在')
    }
    return res.redirect(`${longUrl}`)
  }
}
