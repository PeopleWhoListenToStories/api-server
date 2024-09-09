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
import { FileThunkEntity } from '~/entities/chunk-file.entity'
import { CreateUploadThunkDto } from '~/dtos/create-upload-chunk-dto'

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

    @InjectRepository(FileThunkEntity)
    private readonly fileThunkRepository: Repository<FileThunkEntity>,

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

  /**
   * 初始化分片文件
   * @param fileName 文件名
   * @param fileMd5 文件MD5值
   * @returns Promise<any> 初始化结果
   * @throws HttpException 如果文件已存在，则抛出异常，提示勿重复上传
   */
  async initChunkFile(fileName: string, fileMd5: string, fileType: string, fileSize: number, chunkSize: number, chunkTotal?: number): Promise<any> {
    // Check if chunk file already exists
    const chunkFile = await this.fileThunkRepository.findOne({
      where: { fileMd5, flag: false },
      select: ['fileMd5', 'fileName', 'chunkIndex', 'chunkTotal'],
    })

    if (chunkFile) {
      return {
        fileMd5: chunkFile.fileMd5,
        fileName: chunkFile.fileName,
        chunkIndex: chunkFile.chunkIndex,
        chunkTotal: chunkFile.chunkTotal,
      }
    }

    // Initialize chunk with external service
    try {
      await this.ossClient.initChunk({ filename: fileName, md5: fileMd5 })

      // Create and save new FileThunkEntity
      const fileThunkInfo = this.createFileThunkEntity(fileMd5, fileName, fileType, fileSize, chunkSize, chunkTotal)

      return await this.fileThunkRepository.save(fileThunkInfo)
    } catch (err) {
      throw new HttpException('Error initializing chunk file', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  private createFileThunkEntity(fileMd5: string, fileName: string, fileType: string, fileSize: number, chunkSize: number, chunkTotal?: number): FileThunkEntity {
    const fileThunkInfo = new FileThunkEntity()
    fileThunkInfo.fileMd5 = fileMd5 || ''
    fileThunkInfo.fileName = fileName || ''
    fileThunkInfo.fileType = fileType || ''
    fileThunkInfo.fileSize = fileSize || 0
    fileThunkInfo.chunkSize = chunkSize || 0
    fileThunkInfo.fileUrl = '' // Initialize URL as empty
    fileThunkInfo.chunkIndex = 0 // Initial chunk index
    fileThunkInfo.chunkTotal = chunkTotal || 0 // Default to 0 if chunkTotal is not provided
    fileThunkInfo.flag = false // Initially not flagged
    fileThunkInfo.createTime = new Date() // Set creation time
    return fileThunkInfo
  }

  /**
   * 上传分片文件
   * @param file 上传的文件对象
   * @param fileInfo 创建上传分片所需的信息
   * @returns Promise<void> 无返回值
   */
  async uploadChunkFile(file: Express.Multer.File, fileInfo: CreateUploadThunkDto): Promise<any> {
    try {
      // Upload chunk to OSS
      await this.ossClient.uploadChunk(file, { md5: fileInfo.fileMd5, chunkIndex: fileInfo.chunkIndex })

      // Update the database with the new chunk index
      await this.fileThunkRepository.update({ fileMd5: fileInfo.fileMd5, flag: false }, { chunkIndex: Number(fileInfo.chunkIndex) })

      return {
        fileMd5: fileInfo.fileMd5,
        chunkIndex: Number(fileInfo.chunkIndex),
      }
    } catch (err) {
      // Handle errors
      throw new HttpException('Failed to upload chunk file', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  /**
   * 上传分片合并文件
   * @param fileName 文件名
   * @param fileMd5 文件MD5值
   * @returns 无返回值
   */
  async uploadChunkMergeFile(fileName: string, fileMd5: string) {
    try {
      // Merge chunks and get file URL
      const fileUrl = await this.ossClient.mergeChunk({ md5: fileMd5, filename: fileName })

      // Update file status to complete
      await this.fileThunkRepository.update({ fileMd5, flag: false }, { fileUrl, flag: true })

      // Retrieve the updated file info
      const fileRes = await this.fileThunkRepository.findOne({
        where: { fileMd5, flag: true },
      })

      if (!fileRes) {
        throw new HttpException('文件信息未找到', HttpStatus.NOT_FOUND)
      }

      // Create new FileEntity instance
      const newFile = new FileEntity()
      newFile.fileKey = generateRandomId(12)
      newFile.originalName = fileRes.fileName
      newFile.fileName = fileRes.fileName
      newFile.fileUrl = fileRes.fileUrl
      newFile.fileType = fileRes.fileType
      newFile.fileSize = fileRes.fileSize
      newFile.flag = false

      // Save the new file entity
      return await this.entityManager.save(FileEntity, newFile)
    } catch (err) {
      // Throw HTTP exception with the error message
      throw new HttpException(err.message || 'An unexpected error occurred', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}
