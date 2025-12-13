import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import {
	ApiBearerAuth,
	ApiOperation,
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RoutinesService } from './routines.service';
import { UpdateMyRoutineDto } from './dto/update-my-routine.dto';

@ApiTags('routines')
@Controller('api')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RoutinesController {
	constructor(private readonly routinesService: RoutinesService) {}

	// 6. GET /api/me/routine
	@Get('me/routine')
	@ApiOperation({ summary: "Get the current user's routine template" })
	@ApiResponse({ status: 200, description: 'Routine template' })
	getMyRoutine(@CurrentUser() user: any) {
		return this.routinesService.getMyRoutine(user?.sub);
	}

	// 7. PUT /api/me/routine
	@Put('me/routine')
	@ApiOperation({ summary: "Overwrite the current user's routine template" })
	@ApiResponse({ status: 200, description: 'Updated routine template' })
	updateMyRoutine(
		@Body() dto: UpdateMyRoutineDto,
		@CurrentUser() user: any,
	) {
		return this.routinesService.updateMyRoutine(user?.sub, dto);
	}

	// 8. GET /api/group/routine
	@Get('group/routine')
	@ApiOperation({ summary: 'Get routines for all members in the current group' })
	@ApiResponse({ status: 200, description: 'Group routines' })
	getGroupRoutine(@CurrentUser() user: any) {
		return this.routinesService.getGroupRoutine(user?.sub);
	}
}
