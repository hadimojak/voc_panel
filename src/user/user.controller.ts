import { Controller, Patch } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('user')
@ApiTags('Auth')
export class UserController {
  constructor(private userService: UserService) {}

//   @Patch('update')
//   @ApiOperation({ summary: 'Update username or email' })
//   @ApiBody({ type: LoginDto })
//   @ApiResponse({
//     status: 200,
//     description: 'Login successful, returns access and refresh tokens',
//   })
//   @ApiResponse({
//     status: 401,
//     description: 'Invalid credentials',
//   })
//   login(@Body() dto: LoginDto) {
//     return this.authService.login(dto);
//   }
//TODO: add pathc route for hcange username and email 
// also have to add route fro change password
}
