import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class SpeciesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.species.findMany({
      orderBy: { name: "asc" },
    });
  }

  async create(data: { name: string }) {
    return this.prisma.species.create({
      data,
    });
  }

  async update(id: number, data: { name: string }) {
    return this.prisma.species.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    return this.prisma.species.delete({
      where: { id },
    });
  }
}
