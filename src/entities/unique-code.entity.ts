import { ApiProperty } from '@nestjs/swagger'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { UniqueCodeStatusEnum } from '~/enums/unique-code.enum';

@Entity('unique_code')
export class UniqueCodeEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number

  @Column({ length: 10, comment: 'code码' })
  @ApiProperty()
  code: string

  @Column({
    type: 'enum',
    enum: UniqueCodeStatusEnum,
    default: UniqueCodeStatusEnum.Unused,
    comment: '状态, 0 未使用、1 已使用',
  })
  public status: UniqueCodeStatusEnum;

}
