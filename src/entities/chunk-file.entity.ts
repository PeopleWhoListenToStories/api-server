import { ApiProperty } from '@nestjs/swagger';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { IsNotEmpty } from 'class-validator'; // Import class-validator

@Entity('file_thunk')
export class FileThunkEntity {
  
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @IsNotEmpty({ message: '文件的Md5不能为空' }) // Add non-null validation
  @Column({ type: 'varchar', length: 200, comment: '文件的Md5', nullable: false })
  fileMd5: string;

  @ApiProperty()
  @IsNotEmpty({ message: '文件的fileUrl不能为空' }) // Add non-null validation
  @Column({ type: 'varchar', length: 1000, comment: '文件的fileUrl', nullable: false })
  fileUrl: string;

  @ApiProperty()
  @IsNotEmpty({ message: '文件名称不能为空' }) // Add non-null validation
  @Column({ type: 'varchar', length: 200, comment: '文件名称', nullable: false })
  fileName: string;

  @ApiProperty()
  @IsNotEmpty({ message: '文件大小不能为空' }) // Add non-null validation
  @Column({ type: 'int', comment: '文件大小', nullable: false })
  fileSize: number;

  @ApiProperty()
  @IsNotEmpty({ message: '文件类型不能为空' }) // Add non-null validation
  @Column({ type: 'varchar', length: 200, comment: '文件类型', nullable: false })
  fileType: string;

  @ApiProperty()
  @IsNotEmpty({ message: '分片进度不能为空' }) // Add non-null validation
  @Column({ type: 'int', comment: '分片进度-下标', nullable: false })
  chunkIndex: number;

  @ApiProperty()
  @IsNotEmpty({ message: '分片大小不能为空' }) // Add non-null validation
  @Column({ type: 'int', comment: '分片大小', nullable: false })
  chunkSize: number;

  @ApiProperty()
  @IsNotEmpty({ message: '分片总数不能为空' }) // Add non-null validation
  @Column({ type: 'int', comment: '分片总数', nullable: false })
  chunkTotal: number;

  @ApiProperty()
  @Column({ type: 'boolean', comment: '是否删除', default: false })
  flag: boolean;

  @ApiProperty()
  @CreateDateColumn()
  createTime: Date;
}
