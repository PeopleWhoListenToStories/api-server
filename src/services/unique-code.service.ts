import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EntityManager } from 'typeorm';

import { generateRandomId } from '~/helpers/shortid.herlper';
import { UniqueCodeEntity } from '~/entities/unique-code.entity';
import { UniqueCodeStatusEnum } from '~/enums/unique-code.enum';

@Injectable()
export class UniqueCodeService {
  constructor(
    @InjectEntityManager()
    private entityManager: EntityManager,

  ) {}

  /**
   * @description 生产随机code
   * @returns
   */
  // @Cron(CronExpression.EVERY_5_SECONDS)
  async generateCode() {
    let str = generateRandomId(6);

    const uniqueCode = await this.entityManager.findOneBy(UniqueCodeEntity, {
      code: str,
    });

    if (!uniqueCode) {
      const code = new UniqueCodeEntity();
      code.code = str;
      code.status = UniqueCodeStatusEnum.Unused;

      return await this.entityManager.save(UniqueCodeEntity, code);
    } else {
      return this.generateCode();
    }
  }

  /**
   * @description 每周日0点生成10个code
   */
  @Cron(CronExpression.EVERY_WEEK)
  async batchGenerateCode() {
    for (let i = 0; i < 10; i++) {
      this.generateCode();
    }
  }
}
