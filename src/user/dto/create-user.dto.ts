import { IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  userName: string;
  @IsNotEmpty()
  name: string;
  @IsNotEmpty()
  surname: string;
  @IsNotEmpty()
  email: string;
  @IsNotEmpty()
  password: string;
}
