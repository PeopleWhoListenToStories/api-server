import { ApiProperty } from '@nestjs/swagger'
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('file')
export class FileEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number
  
  @ApiProperty()
  @Column({ type: 'varchar', length: 200, comment: '文件的key' })
  fileKey: string

  @ApiProperty()
  @Column({ type: 'varchar', length: 200, comment: '文件路径' })
  fileUrl: string

  @ApiProperty()
  @Column({ type: 'varchar', length: 200, comment: '文件名称' })
  fileName: string

  @ApiProperty()
  @Column({ type: 'varchar', length: 200, comment: '原文件名称' })
  originalName: string

  @ApiProperty()
  @Column({ type: 'int', comment: '文件大小' })
  fileSize: number

  @ApiProperty()
  @Column({ type: 'varchar', length: 200, comment: '文件类型' })
  fileType: string

  @ApiProperty()
  @Column({ type: 'boolean', comment: '是否删除' })
  flag: boolean

  @ApiProperty()
  @CreateDateColumn()
  createTime: Date
}