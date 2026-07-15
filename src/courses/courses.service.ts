import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { coursesMessagePatterns } from 'src/constants';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CoursesService implements OnApplicationBootstrap {
  private client: ClientProxy;
  private readonly logger = new Logger(CoursesService.name);
  
  constructor() {
    this.client = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        host: process.env.COURSES_MICROSERVICE_HOST || 'localhost',
        port: +(process.env.COURSES_MICROSERVICE_PORT || 3001),
      },
    });
  }
  
  async onApplicationBootstrap() {
    try {
      await this.client.connect();
      this.logger.log(`Successfully connected to Courses microservice at ${process.env.COURSES_MICROSERVICE_HOST}:${process.env.COURSES_MICROSERVICE_PORT}`);
    } catch {
      this.logger.error('Failed to connect to Courses microservice');
    }
  }

  async findAll() {
    return lastValueFrom(this.client.send({ cmd: coursesMessagePatterns.GET_ALL_COURSES }, {}));
  }

  async findOne(id: string) {
    return lastValueFrom(this.client.send({ cmd: coursesMessagePatterns.GET_ONE_COURSE }, { id }));
  }

  async create(data: CreateCourseDto) {
    return lastValueFrom(this.client.send({ cmd: coursesMessagePatterns.CREATE_COURSE }, data));
  }

  async update(id: string, data: UpdateCourseDto) {
    return lastValueFrom(this.client.send({ cmd: coursesMessagePatterns.UPDATE_COURSE }, { id, ...data }));
  }

  async remove(id: string) {
    return lastValueFrom(this.client.send({ cmd: coursesMessagePatterns.REMOVE_COURSE }, { id }));
  }
}