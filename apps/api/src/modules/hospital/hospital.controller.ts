import { Controller, Get, Query } from '@nestjs/common';
import { HospitalService } from './hospital.service.js';

@Controller('api/v1/hospitals')
export class HospitalController {
  constructor(private readonly hospitalService: HospitalService) {}

  @Get()
  async findByPincode(
    @Query('pincode') pincode: string,
    @Query('limit') limit = '10',
    @Query('offset') offset = '0',
  ) {
    const take = Math.min(parseInt(limit) || 10, 50);
    const skip = parseInt(offset) || 0;
    return this.hospitalService.findByPincode(pincode, take, skip);
  }

  @Get('count')
  async countByPincode(@Query('pincode') pincode: string) {
    return this.hospitalService.countByPincode(pincode);
  }

  @Get('nearby')
  async nearby(@Query('pincode') pincode: string) {
    const result = await this.hospitalService.countByPincode(pincode);
    return { hospitalCount: result.count };
  }

  @Get('locate')
  async locate(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('pincode') pincode?: string,
  ) {
    if (pincode) {
      const result = await this.hospitalService.countByPincode(pincode);
      return {
        pincode,
        hospitalCount: result.count,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
      };
    }
    return {
      error: 'Please provide a pincode query parameter',
      lat: parseFloat(lat),
      lng: parseFloat(lng),
    };
  }
}
