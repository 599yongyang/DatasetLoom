import {Module} from '@nestjs/common';
import {ParserConfigService} from './parser-config.service';
import {ParserConfigController} from './parser-config.controller';
import {PrismaModule} from "@/common/prisma/prisma.module";

@Module({
    imports: [PrismaModule],
    controllers: [ParserConfigController],
    providers: [ParserConfigService],
})
export class ParserConfigModule {
}
