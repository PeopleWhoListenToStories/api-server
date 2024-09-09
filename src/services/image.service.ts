import { BadRequestException, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { HttpService } from '@nestjs/axios'
import { EntityManager } from 'typeorm'
import * as sharp from 'sharp'
import { ImageEntity } from '~/entities/image.entity'
import { createAvatar } from '~/helpers/dicebear/core'
import * as funEmoji from '~/helpers/dicebear/fun-emoji'
import { generateRandomIndex } from '~/helpers/shortid.herlper'
import { firstValueFrom } from 'rxjs'
import { getRandomBackground } from '~/helpers/color.helper'

@Injectable()
export class ImageService {
  constructor(
    @InjectEntityManager()
    private entityManager: EntityManager,

    private readonly httpService: HttpService,

    @InjectRepository(ImageEntity)
    private readonly imageService?: ImageService,
  ) {}

  async getFunEmojiSvg({ eyes, mouth, clip, rotate, flip, seed = 'Felix', scale = 50, radius, size, translateY, backgroundColor, backgroundType, backgroundRotation }) {
    eyes = eyes || ['closed', 'closed2', 'crying', 'cute', 'glasses', 'love', 'pissed', 'plain', 'sad', 'shades', 'sleepClose', 'stars', 'tearDrop', 'wink', 'wink2'][generateRandomIndex(15)]
    mouth =
      mouth || ['cute', 'drip', 'faceMask', 'kissHeart', 'lilSmile', 'pissed', 'plain', 'sad', 'shout', 'shy', 'sick', 'smileLol', 'smileTeeth', 'tongueOut', 'wideSmile'][generateRandomIndex(15)]

    // 动态添加有值的属性
    const additionalParams = {
      ...(rotate !== undefined && { rotate }),
      ...(flip !== undefined && { flip }),
      ...(seed && { seed }),
      ...(scale && { scale }),
      ...(radius !== undefined && { radius }),
      ...(size && { size }),
      ...(clip !== undefined && { clip }),
      ...(translateY !== undefined && { translateY }),
      ...(backgroundColor && { backgroundColor: [backgroundColor] }),
      ...(backgroundType && { backgroundType: ['gradientLinear', backgroundType] }),
      ...(backgroundRotation && { backgroundRotation: [backgroundRotation, 360] }),
    }
    return createAvatar(funEmoji, {
      randomizeIds: false,
      eyes: [eyes],
      mouth: [mouth],
      ...additionalParams,
    }).toString()
  }

  // 裁剪本地上传的图片
  async cropImage(file: Express.Multer.File, width: number, height: number): Promise<Buffer> {
    if (!file) {
      throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST)
    }

    return sharp(file.buffer).resize(width, height).toBuffer()
  }

  // 裁剪远程图片
  async cropImageFromUrl(imageUrl: string, width: number, height: number, quality: number): Promise<Buffer> {
    if (!imageUrl) {
      return sharp({
        create: {
          width,
          height,
          channels: 4,
          background: getRandomBackground(),
        },
      })
        .png()
        .resize({ width, height })
        .toBuffer()
    }
    const response = await firstValueFrom(this.httpService.get(imageUrl, { responseType: 'arraybuffer' }))

    // 检查响应是否为空，或者 Content-Type 是否不是图片
    const contentType = response.headers['content-type']
    if (!response || !response.data || !contentType.startsWith('image')) {
      throw new HttpException('Invalid image URL or unsupported content type', HttpStatus.BAD_REQUEST)
    }
    const imageBuffer = Buffer.from(response.data) // 从 arraybuffer 转为 Buffer

    return sharp(imageBuffer)
      .resize({ width, height, fit: sharp.fit.cover, position: sharp.strategy.entropy })
      .jpeg({
        quality,
        chromaSubsampling: '4:4:4',
      })
      .toBuffer()
  }
}
