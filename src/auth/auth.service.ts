import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { JwtPayload } from './jwtPayload';
import { ConfigService } from '@nestjs/config';
import { loginUserDto } from './dto/login-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async signUp(createUserDto: CreateUserDto): Promise<{ token: string }> {
    const { email, password } = createUserDto;
    const isUserExist = await this.userRepository.findOneBy({ email });

    if (isUserExist) {
      throw new ConflictException('user is already exist');
    }

    const salt = await bcrypt.genSalt(11);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await this.userService.createUser(
      Object.assign(createUserDto, { password: hashedPassword }),
    );

    const payload: JwtPayload = { sub: user.id, userName: user.userName };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET_KEY'),
    });
    return { token };
  }

  async logIn(loginUserDto: loginUserDto): Promise<{ token: string }> {
    const { email, password } = loginUserDto;
    const user = await this.userRepository.findOneBy({ email });
    if (!user) {
      throw new NotFoundException('Wrong credentials');
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      throw new NotFoundException('Wrong credentials');
    }
    const payload: JwtPayload = { sub: user.id, userName: user.userName };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET_KEY'),
    });
    return { token };
  }
}
