import { IsEmail, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty({ message: 'Username is required' })
  @IsString()
  username!: string;

  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Email must be valid' })
  email!: string;

  @IsNotEmpty({ message: 'First name is required' })
  @IsString()
  first_name!: string;

  @IsOptional()
  @IsString()
  middle_name?: string;

  @IsNotEmpty({ message: 'Last name is required' })
  @IsString()
  last_name!: string;
}