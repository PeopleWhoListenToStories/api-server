import { Inject, Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SettingModule } from "~/modules/setting.module";
import { FileEntity } from "~/entities/file.entity";
import { FileThunkEntity } from "~/entities/chunk-file.entity";
import { FileController } from '~/controller/file.controller'
import { FileService } from '~/services/file.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([FileEntity]),
    TypeOrmModule.forFeature([FileThunkEntity]),
    forwardRef(() => SettingModule),
  ],
  providers: [FileService],
  exports: [FileService],
  controllers: [FileController],
})
export class FileModule {}