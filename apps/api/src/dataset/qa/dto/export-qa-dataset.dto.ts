import { IsNotEmpty } from 'class-validator';
import { ContextType } from '@/common/prisma/enum';
import { ApiProperty } from '@nestjs/swagger';

export class ExportQaDatasetDto {

  @ApiProperty({ description: '数据集类型'})
  @IsNotEmpty()
  contextType: ContextType;

  @ApiProperty({ description: '数据集文件格式'})
  @IsNotEmpty()
  fileFormat: string;

  @ApiProperty({ description: '数据集数据类型'})
  @IsNotEmpty()
  dataType: string;

  @ApiProperty({ description: '是否只导出已确认数据'})
  @IsNotEmpty()
  confirmedOnly: boolean;

  @ApiProperty({ description: '是否包含COT数据'})
  @IsNotEmpty()
  includeCOT: boolean;

  @ApiProperty({ description: '导出数据类型'})
  @IsNotEmpty()
  exportType: string;
}
