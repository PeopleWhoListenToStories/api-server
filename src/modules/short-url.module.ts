import { Inject, Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ShortUrlController } from '~/controller/short-url.controller'
import { ShortLongMapEntity } from "~/entities/short-long-map.entity";
import { ShortUrlService } from '~/services/short-url.service';
import { UniqueCodeModule } from "./unique-code.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([ShortLongMapEntity]),
    forwardRef(() => UniqueCodeModule),
  ],
  providers: [ShortUrlService],
  exports: [ShortUrlService],
  controllers: [ShortUrlController],
})
export class ShortUrlModule {}