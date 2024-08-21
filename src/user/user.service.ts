import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getUsers(): Promise<User[]> {
    return this.userRepository.createQueryBuilder('user').getMany();
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('user is not found');
    }
    return user;
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const { email, password } = createUserDto;
    const isUserExist = await this.userRepository.findOneBy({
      email,
    });
    if (isUserExist) {
      throw new ConflictException('User already exist');
    } else {
      const salt = await bcrypt.genSalt(11);
      const hashedPassword = await bcrypt.hash(password, salt);
      const user = this.userRepository.create(
        Object.assign(createUserDto, { password: hashedPassword }),
      );
      return await this.userRepository.save(user);
    }
  }

  async deleteUser(id: string): Promise<void> {
    const res = await this.userRepository.delete(id);
    if (res.affected === 0) {
      throw new NotFoundException('user is not exist');
    }
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.getUserById(id);
    const res = Object.assign(user, updateUserDto);
    return this.userRepository.save(res);
  }
}
