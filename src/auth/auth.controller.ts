import { Body, Controller, Post, HttpCode, HttpStatus, UseGuards, Request } from '@nestjs/common';
import { ForgortPasswordDTO, RefreshTokenDTO, ResetPasswordDTO, SignInDTO, SignUpDTO, VerifyEmailDTO } from './auth.dto';
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
    return this.authService.refresh(refreshTokenDTO);
  }

  @HttpCode(HttpStatus.OK)
  @Post('verify-email')
  verifyEmail(@Body() verifyEmailDTO: VerifyEmailDTO) {
    return this.authService.verifyEmail(verifyEmailDTO);
  }

  @HttpCode(HttpStatus.OK)
  @Post('forgot-password')
  forgotPassword(@Body() forgotPasswordDTO: ForgortPasswordDTO) {
    return this.authService.forgotPassword(forgotPasswordDTO.email);
  }

  @HttpCode(HttpStatus.OK)
  @Post('reset-password')
  resetPassword(@Body() resetPasswordDTO: ResetPasswordDTO) {
    return this.authService.resetPassword(resetPasswordDTO);
  }
}
