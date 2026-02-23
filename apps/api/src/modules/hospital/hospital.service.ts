import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class HospitalService {
  constructor(private readonly prisma: PrismaService) {}

  async findByPincode(pincode: string, take = 10, skip = 0) {
    return this.prisma.hospital.findMany({
      where: {
        pincode,
        isActive: true,
        isNetworkHospital: true,
      },
      orderBy: { name: 'asc' },
      take,
      skip,
    });
  }

  async countByPincode(pincode: string) {
    // First try exact match
    let count = await this.prisma.hospital.count({
      where: {
        pincode,
        isActive: true,
        isNetworkHospital: true,
      },
    });

    // If no exact match, find nearby by first 3 digits (same area)
    if (count === 0) {
      const prefix = pincode.slice(0, 3);
      count = await this.prisma.hospital.count({
        where: {
          pincode: { startsWith: prefix },
          isActive: true,
          isNetworkHospital: true,
        },
      });
    }

    return { pincode, count };
  }
}
