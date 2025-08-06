import {
    Body,
    Controller,
    Patch,
    UploadedFile,
    UseInterceptors
} from '@nestjs/common';
import { UsersService } from '@/users/users.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ResponseUtil } from '@/utils/response.util';
import { SetPasswordDto } from '@/users/dto/set-password.dto';
import { User } from '@/auth/decorators/user.decorator';
import { verify } from 'argon2';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('用户')
@Controller('user')
export class UsersController {
    constructor(private readonly usersService: UsersService) {
    }

    @Patch()
    @ApiOperation({ summary: '修改消息' })
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(@UploadedFile() file: Express.Multer.File, @Body() body: {
        name: string
    }, @User('id') userId: string) {
        const data = await this.usersService.updateInfo(userId, file, body.name);
        return ResponseUtil.success({ name: data.name, avatar: data.avatar });
    }

    @ApiOperation({ summary: '修改密码' })
    @Patch('set-password')
    async updatePassword(@Body() setPasswordDto: SetPasswordDto, @User('id') userId: string) {
        const { password, newPassword, confirmNewPassword } = setPasswordDto;

        if (newPassword !== confirmNewPassword) {
            throw ResponseUtil.badRequest('New passwords do not match');
        }
        const user = await this.usersService.getInfoById(userId);
        if (!user) {
            throw ResponseUtil.error('Not Found');
        }
        const isPasswordMatched = await verify(user.password, password);
        if (!isPasswordMatched) {
            throw ResponseUtil.error('Incorrect password');
        }
        await this.usersService.updatePassword(user.id, newPassword);
        return ResponseUtil.success();
    }
}
