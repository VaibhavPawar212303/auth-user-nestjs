import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import * as bcrypt from 'bcryptjs';
import { IsNull } from 'typeorm'; 

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.userRepository.create({ ...createUserDto, password: hashedPassword });
    return await this.userRepository.save(user);
  }
  async findAll(): Promise<User[]> {
    return await this.userRepository.find({ where: { deleted_at: IsNull() } });
  }
  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id, deleted_at: IsNull() }, 
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }
  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    await this.userRepository.update(id, updateUserDto);
    const updatedUser = await this.userRepository.findOne({
      where: { id },
    });
    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return updatedUser;
  }
  async softDelete(id: number): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    await this.userRepository.update(id, { deleted_at: new Date() });
  }
  async hardDelete(id: number): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id }, 
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    await this.userRepository.delete(id);
  }
}
