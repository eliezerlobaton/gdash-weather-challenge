import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';

@ApiTags('Autenticação')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({
    summary: 'Autenticar usuário no sistema',
    description:
      'Realiza a autenticação do usuário utilizando email e senha. ' +
      'Retorna um token JWT que deve ser usado no header Authorization (Bearer token) ' +
      'para acessar rotas protegidas da API.',
  })
  @ApiBody({
    description: 'Credenciais de acesso do usuário',
    schema: {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        email: {
          type: 'string',
          format: 'email',
          example: 'chanchito@chanco.com',
          description: 'Email cadastrado no sistema',
        },
        password: {
          type: 'string',
          format: 'password',
          example: '123456',
          description: 'Senha do usuário (mínimo 6 caracteres)',
          minLength: 6,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Login realizado com sucesso. Retorna token JWT e dados do usuário.',
    schema: {
      example: {
        access_token:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzUwODRhNGRlMGJjMDAwMTNhYTkyNzEiLCJlbWFpbCI6ImNoYW5jaGl0b0BjaGFuY28uY29tIiwiaWF0IjoxNzMzMzA2MTQwLCJleHAiOjE3MzMzOTI1NDB9.abc123',
        user: {
          id: '675084a4de0bc00013aa9271',
          name: 'Admin User',
          email: 'chanchito@chanco.com',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciais inválidas. Email ou senha incorretos.',
    schema: {
      example: {
        statusCode: 401,
        message: 'Credenciais inválidas',
        error: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Dados de entrada inválidos.',
    schema: {
      example: {
        statusCode: 400,
        message: ['email must be an email', 'password must be longer than or equal to 6 characters'],
        error: 'Bad Request',
      },
    },
  })
  async login(@Body() loginDto: { email: string; password: string }) {
    return this.authService.login(loginDto.email, loginDto.password);
  }
}
