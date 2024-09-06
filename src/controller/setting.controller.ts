import { Controller, Post, Body, Request, UseGuards, HttpCode, HttpStatus, Get } from '@nestjs/common'
// import { JwtService } from '@nestjs/jwt'
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger'
import { SettingService } from '~/services/setting.service'
import { SettingEntity } from '~/entities/setting.entity'

@ApiTags('Setting')
@Controller('setting')
// @UseGuards(RolesGuard)
export class SettingController {
  constructor(
    private readonly settingService: SettingService,
    // private readonly jwtService: JwtService,
  ) {}

  /**
   * 更新设置
   * @param tag
   */
  @ApiOperation({
    summary: '更新配置',
  })
  @ApiResponse({ status: 200, description: '更新设置', type: [SettingEntity] })
  @Post()
  update(@Body() setting) {
    return this.settingService.update(setting)
  }

  /**
   * 获取设置
   */
  @ApiOperation({
    summary: '获取设置',
  })
  @Get('/')
  @HttpCode(HttpStatus.OK)
  async findAll(@Request() req): Promise<SettingEntity> {
    let token = req.headers.authorization

    if (/Bearer/.test(token)) {
      // 不需要 Bearer，否则验证失败
      token = token.split(' ').pop()
    }

    try {
      const isAdmin = false
      return this.settingService.findAll(false, isAdmin)
    } catch (e) {
      return this.settingService.findAll(false, false)
    }
  }
}
