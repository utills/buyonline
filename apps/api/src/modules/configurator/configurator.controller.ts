import { Controller, Get, Put, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ConfiguratorService } from './configurator.service.js';
import { SaveConfigDto } from './dto/save-config.dto.js';
import type { GetConfigResponse } from './interfaces/configurator.interfaces.js';

@Controller('api/v1/configurator')
export class ConfiguratorController {
  constructor(private readonly configuratorService: ConfiguratorService) {}

  @Get('config')
  async getConfig(): Promise<GetConfigResponse | { config: null }> {
    const result = await this.configuratorService.getConfig();
    if (!result) return { config: null };
    return result;
  }

  @Put('config')
  async saveConfig(@Body() dto: SaveConfigDto): Promise<GetConfigResponse> {
    return this.configuratorService.saveConfig(dto.config);
  }

  @Post('reset')
  @HttpCode(HttpStatus.OK)
  async resetConfig(): Promise<{ message: string }> {
    return this.configuratorService.resetConfig();
  }
}
