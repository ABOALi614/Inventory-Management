import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@wms.local' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'ChangeMe!123', format: 'password' })
  @IsString()
  @MinLength(1)
  password: string;
}

export class LoginResponseDto {
  @ApiProperty()
  access_token: string;

  @ApiProperty()
  user: {
    id: string;
    email: string;
    role: string;
  };
}
