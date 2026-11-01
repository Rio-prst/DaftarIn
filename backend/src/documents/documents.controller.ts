import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response as ExpressResponse } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Response } from '../common/response/response';
import type { AuthenticatedUser } from '../common/types/authenticated-user';
import { UploadDocumentDto, UploadVersionDto } from './dto/upload-document.dto';
import {
  DOCUMENTS_SERVICE,
  type IDocumentsService,
} from './interfaces/documents.service.interface';

@Roles('citizen')
@Controller('preparations/:preparationId/documents')
export class DocumentsController {
  constructor(
    @Inject(DOCUMENTS_SERVICE)
    private readonly documentsService: IDocumentsService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @Param('preparationId', ParseUUIDPipe) preparationId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadDocumentDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const result = await this.documentsService.uploadDocument(
      preparationId,
      user.id,
      file,
      dto.document_type,
      dto.requirement_id,
      dto.display_name,
    );

    return new Response({
      data: result,
    });
  }

  @Get()
  async list(
    @Param('preparationId', ParseUUIDPipe) preparationId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const documents = await this.documentsService.listDocuments(
      preparationId,
      user.id,
    );

    return new Response({
      data: documents,
    });
  }

  @Get(':documentId')
  async getDetail(
    @Param('preparationId', ParseUUIDPipe) preparationId: string,
    @Param('documentId', ParseUUIDPipe) documentId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const detail = await this.documentsService.getDocumentDetail(
      preparationId,
      documentId,
      user.id,
    );

    return new Response({
      data: detail,
    });
  }

  @Post(':documentId/versions')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  async uploadNewVersion(
    @Param('preparationId', ParseUUIDPipe) preparationId: string,
    @Param('documentId', ParseUUIDPipe) documentId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadVersionDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const result = await this.documentsService.uploadNewVersion(
      preparationId,
      documentId,
      user.id,
      file,
      dto.display_name,
    );

    return new Response({
      data: result,
    });
  }

  @Get(':documentId/content')
  async getContent(
    @Param('preparationId', ParseUUIDPipe) preparationId: string,
    @Param('documentId', ParseUUIDPipe) documentId: string,
    @Query('redirect') redirect: string | undefined,
    @CurrentUser() user: AuthenticatedUser,
    @Res() res: ExpressResponse,
  ) {
    const signedUrl = await this.documentsService.getDocumentContentUrl(
      preparationId,
      documentId,
      user.id,
    );

    if (redirect === 'false') {
      return res.status(HttpStatus.OK).json(
        new Response({
          data: {
            url: signedUrl,
            expires_in_seconds: 300,
          },
        }),
      );
    }

    return res.redirect(HttpStatus.FOUND, signedUrl);
  }

  @Delete(':documentId')
  @HttpCode(HttpStatus.ACCEPTED)
  async delete(
    @Param('preparationId', ParseUUIDPipe) preparationId: string,
    @Param('documentId', ParseUUIDPipe) documentId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const result = await this.documentsService.deleteDocument(
      preparationId,
      documentId,
      user.id,
    );

    return new Response({
      data: result,
    });
  }
}
