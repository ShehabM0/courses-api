import { Body, Controller, Post, HttpCode, HttpStatus, UseGuards, Request } from '@nestjs/common';
import { RefreshTokenDTO, SignInDTO, SignUpDTO } from './auth.dto';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  create(@Body() createUserDTO: SignUpDTO) {
    return this.authService.signUp(createUserDTO);
  }

  @HttpCode(HttpStatus.OK) // default: 201 Created.
  @Post('login')
  signIn(@Body() signInDTO: SignInDTO) {
    return this.authService.signIn(signInDTO.email, signInDTO.password);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @Post('logout')
  logout(@Request() req) {
    const accessToken = req.headers.authorization?.split(' ')[1];
    return this.authService.logout(accessToken);
  }

  @Post('refresh')
  refresh(@Body() refreshTokenDTO: RefreshTokenDTO) {
    return this.authService.refresh(refreshTokenDTO.refreshToken);
  }
}
