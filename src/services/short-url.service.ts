import { Inject, Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import { EntityManager } from 'typeorm'
import { ShortLongMapEntity } from '~/entities/short-long-map.entity'
import { UniqueCodeEntity } from '~/entities/unique-code.entity'
import { UniqueCodeService } from '~/services/unique-code.service'

@Injectable()
export class ShortUrlService {
  constructor(
    @InjectEntityManager()
    private entityManager: EntityManager,

    @Inject(UniqueCodeService)
    private uniqueCodeService: UniqueCodeService,
  ) {}

  /**
   * 通过code获取长链接
   * @param code code码
   * @returns 
   */
  async getLongUrl(code: string) {
    const map = await this.entityManager.findOneBy(ShortLongMapEntity, {
      shortUrl: code,
    })
    if (!map) {
      return null
    }
    return map.longUrl
  }

  /**
   * 通过长链接生成code
   * @param longUrl 长链接
   * @returns 
   */
  async generate(longUrl: string) {
    let uniqueCode = await this.entityManager.findOneBy(UniqueCodeEntity, {
      status: 0,
    })

    if (!uniqueCode) {
      uniqueCode = await this.uniqueCodeService.generateCode()
    }
    const map = new ShortLongMapEntity()
    map.shortUrl = uniqueCode.code
    map.longUrl = longUrl

    await this.entityManager.insert(ShortLongMapEntity, map)
    await this.entityManager.update(
      UniqueCodeEntity,
      {
        id: uniqueCode.id,
      },
      {
        status: 1,
      },
    )
    return uniqueCode.code
  }
}
