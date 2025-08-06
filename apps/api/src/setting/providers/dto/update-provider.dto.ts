import { IsString } from 'class-validator';
import { BaseDto } from '@/common/dto/base.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProviderDto extends BaseDto {

    @ApiProperty({ description: 'id' })
    @IsString()
    id: string;

    @ApiProperty({ description: '接口地址' })
    @IsString()
    apiUrl: string;

    @ApiProperty({ description: '接口密钥' })
    @IsString()
    apiKey: string;

}
