import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';

@ApiTags('Usuários')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Listar todos os usuários cadastrados',
    description:
      'Retorna uma lista completa de todos os usuários registrados no sistema. ' +
      'Requer autenticação. As senhas não são incluídas na resposta por segurança.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuários retornada com sucesso',
    schema: {
      example: [
        {
          _id: '675084a4de0bc00013aa9271',
          name: 'Admin User',
          email: 'chanchito@chanco.com',
          createdAt: '2025-12-01T10:00:00.000Z',
          updatedAt: '2025-12-01T10:00:00.000Z',
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'Não autorizado - Token JWT inválido ou ausente' })
  async findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Buscar usuário específico por ID',
    description:
      'Retorna os detalhes de um usuário específico baseado no seu ID do MongoDB. ' +
      'A senha não é incluída na resposta.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do MongoDB do usuário (formato: ObjectId de 24 caracteres hexadecimais)',
    example: '675084a4de0bc00013aa9271',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuário encontrado',
    schema: {
      example: {
        _id: '675084a4de0bc00013aa9271',
        name: 'Admin User',
        email: 'chanchito@chanco.com',
        createdAt: '2025-12-01T10:00:00.000Z',
        updatedAt: '2025-12-01T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado com o ID fornecido',
    schema: {
      example: {
        statusCode: 404,
        message: 'Usuário não encontrado',
        error: 'Not Found',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Criar novo usuário no sistema',
    description:
      'Registra um novo usuário na plataforma. ' +
      'O email deve ser único e a senha será armazenada de forma segura (hash bcrypt). ' +
      'Requer autenticação de um usuário existente.',
  })
  @ApiBody({
    description: 'Dados do novo usuário',
    schema: {
      type: 'object',
      required: ['name', 'email', 'password'],
      properties: {
        name: {
          type: 'string',
          example: 'João Silva',
          description: 'Nome completo do usuário',
          minLength: 3,
        },
        email: {
          type: 'string',
          format: 'email',
          example: 'joao@example.com',
          description: 'Email único do usuário (será usado para login)',
        },
        password: {
          type: 'string',
          format: 'password',
          example: 'senha123',
          description: 'Senha do usuário (mínimo 6 caracteres)',
          minLength: 6,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Usuário criado com sucesso',
    schema: {
      example: {
        _id: '675084a4de0bc00013aa9272',
        name: 'João Silva',
        email: 'joao@example.com',
        createdAt: '2025-12-04T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Email já cadastrado no sistema',
    schema: {
      example: {
        statusCode: 409,
        message: 'Email já está em uso',
        error: 'Conflict',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 400, description: 'Dados inválidos fornecidos' })
  async create(
    @Body() userData: { name: string; email: string; password: string },
  ) {
    return this.usersService.create(userData);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Atualizar dados de um usuário existente',
    description:
      'Permite atualizar nome, email ou senha de um usuário. ' +
      'Todos os campos são opcionais. Se a senha for alterada, será armazenada com hash bcrypt.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do MongoDB do usuário a ser atualizado',
    example: '675084a4de0bc00013aa9271',
  })
  @ApiBody({
    description: 'Dados a serem atualizados (todos opcionais)',
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          example: 'João Silva Atualizado',
          description: 'Novo nome do usuário',
        },
        email: {
          type: 'string',
          format: 'email',
          example: 'joao.novo@example.com',
          description: 'Novo email (deve ser único)',
        },
        password: {
          type: 'string',
          format: 'password',
          example: 'novasenha123',
          description: 'Nova senha (mínimo 6 caracteres)',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Usuário atualizado com sucesso',
    schema: {
      example: {
        _id: '675084a4de0bc00013aa9271',
        name: 'João Silva Atualizado',
        email: 'joao.novo@example.com',
        updatedAt: '2025-12-04T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  @ApiResponse({ status: 409, description: 'Email já está em uso por outro usuário' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async update(
    @Param('id') id: string,
    @Body() updateData: { name?: string; email?: string; password?: string },
  ) {
    return this.usersService.update(id, updateData);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Remover usuário do sistema',
    description:
      'Remove permanentemente um usuário da base de dados. ' +
      'Esta ação não pode ser desfeita. Use com cautela.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do MongoDB do usuário a ser removido',
    example: '675084a4de0bc00013aa9271',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuário removido com sucesso',
    schema: {
      example: {
        message: 'Usuário deletado com sucesso',
        deletedId: '675084a4de0bc00013aa9271',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async delete(@Param('id') id: string) {
    return this.usersService.delete(id);
  }
}
