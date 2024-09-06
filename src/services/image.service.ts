import { BadRequestException, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { EntityManager } from 'typeorm'
import { ImageEntity } from '~/entities/image.entity'
import { createAvatar } from '~/helpers/dicebear/core'
import * as funEmoji from '~/helpers/dicebear/fun-emoji'
import { generateRandomIndex } from '~/helpers/shortid.herlper'

@Injectable()
export class ImageService {
  constructor(
    @InjectEntityManager()
    private entityManager: EntityManager,

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
}
