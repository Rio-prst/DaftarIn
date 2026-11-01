import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
} from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { Response } from '../common/response/response';
import { EvaluateServiceNeedsDto } from './dto/evaluate-needs.dto';
import {
  NEEDS_SERVICE,
  type INeedsService,
} from './interfaces/needs.service.interface';

@Controller()
export class NeedsController {
  constructor(
    @Inject(NEEDS_SERVICE)
    private readonly needsService: INeedsService,
  ) {}

  @Public()
  @Post('service-needs/evaluate')
  @HttpCode(HttpStatus.OK)
  async evaluateServiceNeeds(@Body() dto: EvaluateServiceNeedsDto) {
    const result = await this.needsService.evaluateNeeds({
      serviceId: dto.service_id,
      regionId: dto.region_id,
      questionnaireVersion: dto.questionnaire_version,
      answers: dto.answers.map((a) => ({
        questionId: a.question_id,
        value: a.value,
      })),
    });

    return new Response({
      data: result,
    });
  }

  @Public()
  @Post('needs/evaluate')
  @HttpCode(HttpStatus.OK)
  async evaluateNeedsAlias(@Body() dto: EvaluateServiceNeedsDto) {
    return this.evaluateServiceNeeds(dto);
  }
}
