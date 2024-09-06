import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SettingService } from '~/services/setting.service'
import { SettingController } from '~/controller/setting.controller'
import { SettingEntity } from '~/entities/setting.entity'

@Module({
  imports: [TypeOrmModule.forFeature([SettingEntity])],
  exports: [SettingService],
  providers: [SettingService],
  controllers: [SettingController],
})
export class SettingModule {}
