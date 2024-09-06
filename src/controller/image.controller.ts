import { Controller, HttpCode, HttpStatus, Get, Query, UseInterceptors, ClassSerializerInterceptor, Res } from '@nestjs/common'
import { ApiTags, ApiResponse, ApiOperation, ApiConsumes, ApiQuery } from '@nestjs/swagger'
import { Response } from 'express'
import { ImageService } from '~/services/image.service'
import { ImageEntity } from '~/entities/image.entity'

@ApiTags('Image')
@Controller('image')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Get('fun-emoji/svg')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '获取fun-emoji svg类型' })
  @ApiConsumes('application/json')
  @ApiQuery({
    name: 'clip',
    required: false,
    example: true,
    description: '是否剪裁图像',
  })
  @ApiQuery({
    name: 'rotate',
    required: false,
    example: 0,
    description: '旋转角度',
  })
  @ApiQuery({
    name: 'flip',
    required: false,
    example: false,
    description: '是否水平翻转图像',
  })
  @ApiQuery({
    name: 'seed',
    required: false,
    example: 'Felix',
    description: '生成图像的随机种子',
  })
  @ApiQuery({
    name: 'scale',
    required: false,
    example: 50,
    description: '缩放比例',
  })
  @ApiQuery({
    name: 'radius',
    required: false,
    example: 0,
    description: '圆角半径',
  })
  @ApiQuery({
    name: 'size',
    required: false,
    example: 32,
    description: '图像大小',
  })
  @ApiQuery({
    name: 'translateY',
    required: false,
    example: 0,
    description: '垂直平移量',
  })
  @ApiQuery({
    name: 'backgroundColor',
    required: false,
    example: 'b6e3f4',
    description: '背景颜色，可以是["b6e3f4", "c0aede", "d1d4f9"]中的任何一个'
  })
  @ApiQuery({
    name: 'backgroundType',
    required: false,
    example: 'solid',
    description: '背景类型，可以是["gradientLinear", "solid"]中的任何一个'
  })
  @ApiQuery({
    name: 'backgroundRotation',
    required: false,
    example: 0,
    description: '背景旋转角度，可以是0到360的任何数值'
  })
  @ApiQuery({
    name: 'eyes',
    required: false,
    description: "眼睛类型 ['closed', 'closed2', 'crying', 'cute', 'glasses', 'love', 'pissed', 'plain', 'sad', 'shades', 'sleepClose', 'stars', 'tearDrop', 'wink', 'wink2']",
    example: 'closed',
  })
  @ApiQuery({
    name: 'mouth',
    required: false,
    description: "嘴巴类型 ['cute', 'drip', 'faceMask', 'kissHeart', 'lilSmile', 'pissed', 'plain', 'sad', 'shout', 'shy', 'sick', 'smileLol', 'smileTeeth', 'tongueOut', 'wideSmile']",
    example: 'cute',
  })
  @ApiResponse({ status: 200, description: '成功', type: Object, example: {} })
  @ApiResponse({ status: 403, description: '禁止访问' })
  @UseInterceptors(ClassSerializerInterceptor)
  async getFunEmojiSvg(
    @Query('clip') clip: boolean,
    @Query('rotate') rotate: number,
    @Query('flip') flip: boolean,
    @Query('seed') seed: string,
    @Query('scale') scale: number,
    @Query('radius') radius: number,
    @Query('size') size: number,
    @Query('translateY') translateY: number,
    @Query('backgroundColor') backgroundColor: string,
    @Query('backgroundType') backgroundType: string,
    @Query('backgroundRotation') backgroundRotation: number,
    @Query('eyes') eyes: string,
    @Query('mouth') mouth: string,
    @Res() res: Response,
  ) {
    // 设置响应头
    res.type('image/svg+xml')
    res.send(await this.imageService.getFunEmojiSvg({ clip, rotate, flip, seed, scale, radius, size, translateY, backgroundColor, backgroundType, backgroundRotation, eyes, mouth }))
  }
}
