import {Controller, Get} from '@nestjs/common';
import {AppService} from './app.service';
import {Public} from './auth/decorators/public.decorator';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {
    }

    @Get()
    @Public()
    status(): string {
        return 'DatasetLoom-API Server is running!';
    }
}
