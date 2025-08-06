import { IsString } from 'class-validator';
import { BaseDto } from '@/common/dto/base.dto';
import { ApiProperty } from '@nestjs/swagger';

export class SaveParserConfigDto extends BaseDto {

    @ApiProperty({ description: '服务id' })
    @IsString()
    serviceId: string;

    @ApiProperty({ description: '服务名称' })
    @IsString()
    serviceName: string;

    @ApiProperty({ description: '服务apiUrl' })
    @IsString()
    apiUrl: string;

    @ApiProperty({ description: '服务apiKey' })
    @IsString()
    apiKey: string;

}
