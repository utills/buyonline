import { Controller, Get, Query } from '@nestjs/common';
import { HospitalService } from './hospital.service.js';

@Controller('api/v1/hospitals')
export class HospitalController {
  constructor(private readonly hospitalService: HospitalService) {}

  @Get()
  async findByPincode(@Query('pincode') pincode: string) {
    return this.hospitalService.findByPincode(pincode);
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
  ) {
    // In production, reverse-geocode lat/lng to pincode
    // For dev, return a default pincode with hospital count
    const defaultPincode = '400001';
    const result = await this.hospitalService.countByPincode(defaultPincode);
    return {
      pincode: defaultPincode,
      hospitalCount: result.count,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
    };
  }
}
