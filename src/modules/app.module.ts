import { Inject, Module, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Cron, ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { LoggerModule } from 'nestjs-pino';
// import { ServeStaticModule } from '@nestjs/serve-static'
import { AppController } from '~/controller/app.controller';
// import { SocketModule } from '~/socket/socket.module'
import { AppService } from '~/services/app.service';
import { getLogFileName, ONE_DAY } from '~/helpers/log.helper';
import { IS_PRODUCTION } from '~/helpers/env.helper';
import { getConfig } from '~/config';

import * as fs from 'fs-extra';
import * as path from 'path';
import pino from 'pino';

import { ShortUrlModule } from '~/modules/short-url.module'
import { ShortLongMapEntity } from '~/entities/short-long-map.entity'
import { UniqueCodeModule } from '~/modules/unique-code.module';
import { UniqueCodeEntity } from '~/entities/unique-code.entity'
import { FileModule } from '~/modules/file.module';
import { FileEntity } from '~/entities/file.entity'
import { SettingModule } from '~/modules/setting.module';
import { SettingEntity } from '~/entities/setting.entity';
import { ImageModule } from '~/modules/image.module';
import { ImageEntity } from '~/entities/image.entity';
import { FileThunkEntity } from '~/entities/chunk-file.entity'

const ENTITIES = [ShortLongMapEntity, UniqueCodeEntity, FileEntity, SettingEntity, ImageEntity, FileThunkEntity];

const MODULES = [ShortUrlModule, UniqueCodeModule, FileModule, SettingModule, ImageModule];

@Module({
  imports: [
    // ServeStaticModule.forRoot({
    //   rootPath: path.join(__dirname, '../', 'client/dist'),
    // }),
    ConfigModule.forRoot({
      cache: true,
      load: [getConfig],
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    IS_PRODUCTION &&
      LoggerModule.forRoot({
        pinoHttp: {
          stream: pino.destination({
            dest: `./logs/${getLogFileName(new Date())}`,
            minLength: 4096,
            mkdir: true,
            sync: false,
          }),
        },
      }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService): Promise<any> => ({
        type: 'mysql',
        entities: ENTITIES,
        keepConnectionAlive: true,
        ...(configService.get('db.mysql') as any),
      }),
    }),
    ...MODULES,
  ].filter(Boolean),
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor(
    @Inject(forwardRef(() => ConfigService))
    private readonly configService: ConfigService,
  ) {}

  /**
   * 每天早上9点，清理日志
   */
  @Cron('0 0 9 * * *')
  deleteLog() {
    let retainDays = this.configService.get('server.logRetainDays');
    const startDate = new Date(
      new Date().valueOf() - retainDays * ONE_DAY,
    ).valueOf();

    do {
      const filepath = path.join(
        __dirname,
        '../logs',
        getLogFileName(startDate, retainDays),
      );
      fs.removeSync(filepath);
      retainDays -= 1;
    } while (retainDays > 0);
  }
}
