import { IsString } from 'class-validator';
import { BaseDto } from '@/common/dto/base.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProviderDto extends BaseDto {


    @ApiProperty({ description: '图标' })
    @IsString()
    icon: string;

    @ApiProperty({ description: '名称' })
    @IsString()
    name: string;

    @ApiProperty({ description: '接口类型' })
    @IsString()
    interfaceType: string;

    @ApiProperty({ description: '接口地址' })
    @IsString()
    apiUrl: string;

    @ApiProperty({ description: '接口密钥' })
    @IsString()
    apiKey: string;

}
