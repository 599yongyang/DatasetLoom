import { BaseDto } from '@/common/dto/base.dto';
import { IsArray, IsNotEmpty, IsNumber, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateImageChunkDto extends BaseDto {

    @ApiProperty({ description: '图像标识' })
    @IsString()
    @IsNotEmpty()
    imageId: string;

    @ApiProperty({ description: '图像块信息' })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ImageChunkDto)
    annotations: ImageChunkDto[];

}

class ImageChunkDto {

    @ApiProperty({ description: '图像块ID' })
    @IsString()
    @IsNotEmpty()
    id: string;

    @ApiProperty({ description: '图像块X坐标' })
    @IsNumber()
    x: number;

    @ApiProperty({ description: '图像块Y坐标' })
    @IsNumber()
    y: number;

    @ApiProperty({ description: '图像块宽度' })
    @IsNumber()
    width: number;

    @ApiProperty({ description: '图像块高度' })
    @IsNumber()
    height: number;

    @ApiProperty({ description: '图像块名称' })
    @IsString()
    @IsNotEmpty()
    label: string;
}
