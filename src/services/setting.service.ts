import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { SettingEntity } from '~/entities/setting.entity'

@Injectable()
export class SettingService {
  constructor(
    @InjectRepository(SettingEntity)
    private readonly settingRepository: Repository<SettingEntity>,
  ) {
    this.initI18n()
  }

  /**
   * 初始化时加载 i18n 配置
   */
  async initI18n() {
    // const items = await this.settingRepository.find()
    // const target = (items && items[0]) || ({} as Setting)
    // let data = {}
    // try {
    //   data = JSON.parse(target.i18n) || {}
    // } catch (e) {
    //   data = {}
    // }
    // target.i18n = JSON.stringify(merge({}, i18n, data))
    // await this.settingRepository.save(target)
  }

  /**
   *
   * 获取系统设置
   * @param user
   * @param innerInvoke
   * @param isAdmin
   */
  async findAll(innerInvoke = false, isAdmin = false): Promise<SettingEntity> {
    const data = await this.settingRepository.find()
    const res = data[0]
    if (!res) {
      return {} as SettingEntity
    }
    if (innerInvoke || isAdmin) {
      return res
    }
  }

  /**
   * 更新系统设置
   * @param id
   * @param setting
   */
  async update(setting: Partial<SettingEntity>): Promise<SettingEntity> {
    const old = await this.settingRepository.find()

    const updatedTag =
      old && old[0] ? await this.settingRepository.merge(old[0], setting) : await this.settingRepository.create(setting)
    return this.settingRepository.save(updatedTag)
  }
}
