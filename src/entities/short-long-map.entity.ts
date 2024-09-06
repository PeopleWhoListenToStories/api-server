import { ApiProperty } from '@nestjs/swagger'
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('short_long_map')
export class ShortLongMapEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number

  @ApiProperty()
  @Column({ length: 10, comment: '压缩码' })
  shortUrl: string

  @ApiProperty()
  @Column({ length: 1000, comment: '原始 url' })
  longUrl: string

  @ApiProperty()
  @CreateDateColumn()
  createTime: Date
}
