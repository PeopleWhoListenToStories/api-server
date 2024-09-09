import { Inject, Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { HttpModule } from '@nestjs/axios'
import { ImageEntity } from "~/entities/image.entity";
import { ImageController } from '~/controller/image.controller'
import { ImageService } from '~/services/image.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ImageEntity]),
    HttpModule,
  ],
  providers: [ImageService],
  exports: [ImageService],
  controllers: [ImageController],
})
export class ImageModule {}