import { Body, ClassSerializerInterceptor, Controller, Delete, Get, HttpCode, HttpException, HttpStatus, Inject, Param, Post, Query, Res, UploadedFile, UseInterceptors } from '@nestjs/common'
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger'
import { FileInterceptor } from '@nestjs/platform-express'
import { Response } from 'express'
import { FileService } from '~/services/file.service'
import { FileSize } from '~/constant'
import { CreateUploadFileDto } from '~/dtos/create-upload-file-dto'
import { QueryFileDto } from '~/dtos/query-file-dto'
import { CreateCompressionFileDto } from '~/dtos/create-compression-file-fto'
// import { JwtAuthGuard } from '~/guard/jwt-auth.guard';

@ApiTags('File 模块')
@Controller('/file')
@ApiBearerAuth()
export class FileController {
  constructor(@Inject(FileService) private fileService: FileService) {}

  /**
   * 上传文件
   * @param file
   */
  @Post('upload')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '上传文件' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: '文件上传成功', type: File })
  @ApiResponse({ status: 403, description: '禁止访问' })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: FileSize,
      },
    }),
  )
  uploadFile(@UploadedFile() file, @Body() fileInfo: CreateUploadFileDto) {
    const { unique, name } = fileInfo || {}
    return this.fileService.uploadFile(file, unique, name)
  }

  @Post('compression')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '压缩文件' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: '压缩文件成功', type: File })
  @ApiResponse({ status: 403, description: '禁止访问' })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: FileSize,
      },
    }),
  )
  async compression(@UploadedFile() file, @Body() fileInfo: CreateCompressionFileDto, @Res() res: Response) {
    if (!file) {
      throw new HttpException('文件不存在', HttpStatus.INTERNAL_SERVER_ERROR)
    }
    try {
      const { quality } = fileInfo || {}
      // 调用压缩服务，将图片压缩到指定大小
      const compressedBuffer = await this.fileService.compressImage(file.buffer, quality)
      // 返回压缩后的图片
      res.set({
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `attachment; filename=${file.originalname}`,
      })
      res.send(compressedBuffer)
    } catch (error) {
      // 捕获错误并返回响应
      if (!res.headersSent) {
        // 确保在发送响应头之前捕获错误
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: 'Error compressing image',
          error: error.message,
        })
      }
    }
  }

  /**
   * 获取所有文件
   */
  @Get('all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '获取所有文件' })
  @ApiConsumes('application/json')
  @ApiResponse({ status: 200, description: '获取所有文件成功', type: Object, example: {} })
  @ApiResponse({ status: 403, description: '禁止访问' })
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(ClassSerializerInterceptor)
  findAll(@Query() queryParam: QueryFileDto) {
    return this.fileService.findAll(queryParam)
  }

  /**
   * 删除文件
   * @param fileKey
   */
  @Delete(':fileKey')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '删除文件' })
  @ApiConsumes('application/json')
  @ApiParam({ name: 'fileKey', description: '文件的fileKey' })
  @ApiResponse({ status: 200, description: '删除文件成功', type: Object, example: {} })
  @ApiResponse({ status: 403, description: '禁止访问' })
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(ClassSerializerInterceptor)
  // @Roles('admin')
  // @UseGuards(JwtAuthGuard)
  deleteById(@Param('fileKey') fileKey) {
    return this.fileService.deleteById(fileKey)
  }

  /**
   * 分块初始化文件
   */
  @Get('initChunkFile')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '分块初始化' })
  @ApiConsumes('application/json')
  @ApiQuery({ name: 'fileMd5', description: '文件生成的md5' })
  @ApiResponse({ status: 200, description: '分块初始化成功', type: Object, example: {} })
  @ApiResponse({ status: 403, description: '禁止访问' })
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(ClassSerializerInterceptor)
  async initChunkFile(fileMd5: string) {
    // return await this.fileService.initChunkFile(file)
  }

  /**
   * 分块上传文件
   */
  @Post('uploadChunkFile')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '分块上传文件' })
  @ApiConsumes('application/json')
  @ApiQuery({ name: 'fileMd5', description: '文件生成的md5' })
  @ApiResponse({ status: 200, description: '分块上传文件成功', type: Object, example: {} })
  @ApiResponse({ status: 403, description: '禁止访问' })
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(ClassSerializerInterceptor)
  async uploadChunkFile(fileMd5: string) {
    // return await this.fileService.uploadChunkFile(file)
  }

  /**
   * 分块上传完成合并文件
   */
  @Post('uploadChunkMergeFile')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '分块上传完成合并文件' })
  @ApiConsumes('application/json')
  @ApiQuery({ name: 'fileMd5', description: '文件生成的md5' })
  @ApiResponse({ status: 200, description: '分块上传完成合并文件成功', type: Object, example: {} })
  @ApiResponse({ status: 403, description: '禁止访问' })
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(ClassSerializerInterceptor)
  async uploadChunkMergeFile(fileMd5: string) {
    // return await this.fileService.uploadChunkMergeFile(file)
  }
}
