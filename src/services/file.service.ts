import { BadRequestException, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'
import * as lodash from 'lodash'
import * as sharp from 'sharp'
import { getOssClient } from '~/helpers/file.helper'
import { dateFormat } from '~/helpers/date.helper'
import { generateRandomId } from '~/helpers/shortid.herlper'
import { SettingService } from '~/services/setting.service'
import { FileEntity } from '~/entities/file.entity'

import { getConfig } from '~/config'
const config = getConfig()
const ossConfig = lodash.get(config, 'oss', null)

@Injectable()
export class FileService {
  private ossClient: any

  constructor(
    @InjectEntityManager()
    private entityManager: EntityManager,

    @InjectRepository(FileEntity)
    private readonly fileRepository: Repository<FileEntity>,
    private readonly settingService: SettingService,
    private readonly configService: ConfigService,
  ) {
    this.ossClient = getOssClient(configService)
  }

  /**
   * 上传文件
   * @param file
   */
  async uploadFile(file, unique, name): Promise<FileEntity> {
    // tslint:disable-next-line:no-console
    const { originalname, mimetype, size } = file
    const fileExt = mimetype.split('/')[1]
    const fileKey = `${ossConfig.prefix}/${dateFormat(new Date(), 'yyyy-MM-dd')}/${generateRandomId(10)}.${fileExt}`
    const filename = +unique === 1 ? `${generateRandomId(16)}.${fileExt}` : `${originalname}`
    const url = await this.ossClient.uploadFile(file, { filename, md5: fileKey })
    const newFile = new FileEntity()
    newFile.fileKey = fileKey
    newFile.originalName = name || originalname
    newFile.fileName = filename
    newFile.fileUrl = url
    newFile.fileType = mimetype
    newFile.fileSize = size
    newFile.flag = false
    return await this.entityManager.save(FileEntity, newFile)
  }

  /**
   * 获取所有文件
   */
  async findAll(queryParams): Promise<{ records: FileEntity[]; total: number }> {
    const query = this.fileRepository.createQueryBuilder('file').where({ flag: false }).orderBy('file.createTime', 'DESC')

    if (typeof queryParams === 'object') {
      const { page = 1, pageSize = 10, ...otherParams } = queryParams
      query.skip((+page - 1) * +pageSize)
      query.take(+pageSize)

      if (otherParams) {
        Object.keys(otherParams).forEach((key) => {
          query.andWhere(`file.${key} LIKE :${key}`).setParameter(`${key}`, `%${otherParams[key]}%`)
        })
      }
    }
    const [records = [], total = 0] = await query.getManyAndCount()
    return { records, total }
  }

  /**
   * 删除文件
   * @param fileKey
   */
  async deleteById(fileKey) {
    const target = await this.fileRepository.findOne({ where: { fileKey } })
    if (target && fileKey) {
      try {
        // 调用ossClient删除远程文件
        await this.ossClient.deleteFile(fileKey)
        // 更新数据库中文件的状态
        await this.fileRepository.update(target.id, { flag: true })
      } catch (error) {
        // 捕获删除失败的错误并抛出异常
        throw new HttpException('删除文件时出错，请重试', HttpStatus.INTERNAL_SERVER_ERROR)
      }
    } else {
      throw new HttpException('当前fileKey无效，无法进行操作', HttpStatus.BAD_REQUEST)
    }
  }

  /**
   * 压缩图片到指定大小（如 1MB）。
   * @param buffer 图片的二进制数据
   * @param quality - 图像质量 (1-100)
   * @returns 压缩后的图片 buffer
   */
  async compressImage(buffer: Buffer, quality: string): Promise<Buffer> {
    const _quality = Number(quality) || 70 // 初始图像质量
    let compressedBuffer = await this.resizeImage(buffer, _quality)

    return compressedBuffer
  }

  /**
   * 使用 sharp 进行图片压缩
   * @param buffer 原始图片 buffer
   * @param quality 图像质量
   * @returns 压缩后的图片 buffer
   */
  private async resizeImage(buffer: Buffer, quality: number): Promise<Buffer> {
    return sharp(buffer).jpeg({ quality }).toBuffer()
  }
}
