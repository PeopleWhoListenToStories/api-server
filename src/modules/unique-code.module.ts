import { Inject, Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UniqueCodeEntity } from "~/entities/unique-code.entity";
import { UniqueCodeService } from '~/services/unique-code.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UniqueCodeEntity]),
  ],
  providers: [UniqueCodeService],
  exports: [UniqueCodeService],
  controllers: [],
})
export class UniqueCodeModule {}