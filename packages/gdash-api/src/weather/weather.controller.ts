import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { WeatherService } from './weather.service';
import { CreateWeatherLogDto } from './dto/create-weather-log.dto';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { WeatherInsightsService } from './weather-insights/weather-insights.service';

@ApiTags('Clima')
@Controller('weather')
export class WeatherController {
  constructor(
    private weatherService: WeatherService,
    private weatherInsightsService: WeatherInsightsService,
  ) { }

  @Post('logs')
  @ApiOperation({
    summary: 'Registrar novos dados climáticos',
    description:
      'Endpoint utilizado pelos workers para armazenar dados climáticos coletados. ' +
      'Recebe informações de temperatura, umidade, velocidade do vento e outras métricas climáticas. ' +
      'Este endpoint NÃO requer autenticação pois é acessado por serviços internos.',
  })
  @ApiBody({
    type: CreateWeatherLogDto,
    description: 'Dados climáticos a serem registrados',
    examples: {
      exemplo1: {
        summary: 'Dados climáticos completos',
        value: {
          location: 'Recife, Brazil',
          latitude: -8.0542,
          longitude: -34.8813,
          timestamp: '2025-12-04T10:00:00.000Z',
          temperature: 28.5,
          feelsLike: 30.2,
          humidity: 75,
          windSpeed: 12.3,
          windDirection: 135,
          pressure: 1013,
          condition: 'Parcialmente nublado',
          description:
            'Céu parcialmente nublado com possibilidade de chuva leve',
          icon: '02d',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Registro climático criado com sucesso',
    schema: {
      example: {
        _id: '675084a4de0bc00013aa9271',
        location: 'Recife, Brazil',
        temperature: 28.5,
        timestamp: '2025-12-04T10:00:00.000Z',
        createdAt: '2025-12-04T10:00:05.123Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos fornecidos',
  })
  async createLog(@Body() createWeatherLogDto: CreateWeatherLogDto) {
    return this.weatherService.createLog(createWeatherLogDto);
  }

  @Get('logs')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Listar registros climáticos com paginação',
    description:
      'Retorna uma lista paginada de todos os registros climáticos armazenados. ' +
      'Suporta filtros por data, localização e ordenação. ' +
      'Requer autenticação via token JWT.',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 100,
    description:
      'Quantidade máxima de registros por página (padrão: 100, máximo: 1000)',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
    description: 'Número da página para paginação (começa em 1)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de registros climáticos retornada com sucesso',
    schema: {
      example: {
        data: [
          {
            _id: '675084a4de0bc00013aa9271',
            location: 'Recife, Brazil',
            latitude: -8.0542,
            longitude: -34.8813,
            timestamp: '2025-12-04T10:00:00.000Z',
            temperature: 28.5,
            feelsLike: 30.2,
            humidity: 75,
            windSpeed: 12.3,
            condition: 'Parcialmente nublado',
            createdAt: '2025-12-04T10:00:05.123Z',
          },
        ],
        meta: {
          total: 1523,
          page: 1,
          limit: 100,
          totalPages: 16,
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Token JWT inválido ou ausente' })
  async getLogs(
    @Query('limit') limit = '100',
    @Query('page') page = '1',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const limitNum = parseInt(limit, 10);
    const pageNum = parseInt(page, 10);
    const skip = (pageNum - 1) * limitNum;

    const logs = await this.weatherService.getLogs(
      limitNum,
      skip,
      startDate,
      endDate,
    );
    const total = await this.weatherService.getTotalLogs(startDate, endDate);

    return {
      data: logs,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  @Get('insights')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Gerar insights climáticos com análise de dados',
    description:
      'Analisa os dados climáticos históricos e gera insights inteligentes incluindo: ' +
      'temperaturas médias, máximas e mínimas, padrões de umidade, tendências de vento, ' +
      'alertas climáticos e recomendações baseadas nos dados coletados. ' +
      'Utiliza algoritmos de análise para fornecer informações úteis.',
  })
  @ApiResponse({
    status: 200,
    description: 'Insights climáticos gerados com sucesso',
    schema: {
      example: {
        period: {
          start: '2025-11-04T00:00:00.000Z',
          end: '2025-12-04T00:00:00.000Z',
          days: 30,
        },
        temperature: {
          average: 27.8,
          max: 32.1,
          min: 23.5,
          trend: 'stable',
        },
        humidity: {
          average: 72,
          max: 95,
          min: 55,
        },
        wind: {
          averageSpeed: 12.5,
          dominantDirection: 'SE',
        },
        conditions: {
          mostCommon: 'Parcialmente nublado',
          distribution: {
            'Céu limpo': 12,
            'Parcialmente nublado': 15,
            Nublado: 3,
          },
        },
        alerts: ['Umidade acima de 80% nos últimos 5 dias'],
        recommendations: [
          'Período favorável para atividades ao ar livre',
          'Atenção para possíveis chuvas no final de semana',
        ],
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async getInsights(): Promise<any> {
    return this.weatherInsightsService.getInsights();
  }

  @Get('export.csv')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Exportar todos os dados climáticos em formato CSV',
    description:
      'Gera um arquivo CSV contendo todos os registros climáticos armazenados. ' +
      'Ideal para análise em planilhas ou importação em outras ferramentas. ' +
      'O arquivo é gerado dinamicamente e retornado para download.',
  })
  @ApiResponse({
    status: 200,
    description: 'Arquivo CSV gerado e pronto para download',
    content: {
      'text/csv': {
        schema: {
          type: 'string',
          example:
            'location,latitude,longitude,timestamp,temperature,humidity,windSpeed,condition\n' +
            '"Recife, Brazil",-8.0542,-34.8813,2025-12-04T10:00:00.000Z,28.5,75,12.3,"Parcialmente nublado"',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Token JWT não fornecido ou inválido',
  })
  async exportCSV(@Res() res: Response) {
    const csv = await this.weatherService.exportCSV();
    res.header('Content-Type', 'text/csv');
    res.header(
      'Content-Disposition',
      'attachment; filename="dados-climaticos.csv"',
    );
    res.send(csv);
  }

  @Get('export.xlsx')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Exportar todos os dados climáticos em formato Excel (XLSX)',
    description:
      'Gera um arquivo Excel (.xlsx) contendo todos os registros climáticos. ' +
      'O formato Excel permite melhor formatação, múltiplas planilhas e é compatível ' +
      'com Microsoft Excel, LibreOffice Calc e Google Sheets.',
  })
  @ApiResponse({
    status: 200,
    description: 'Arquivo Excel gerado e pronto para download',
    content: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Token JWT não fornecido ou inválido',
  })
  async exportXLSX(@Res() res: Response) {
    const buffer = await this.weatherService.exportXLSX();
    res.header(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.header(
      'Content-Disposition',
      'attachment; filename="dados-climaticos.xlsx"',
    );
    res.send(buffer);
  }

  @Get('insights/refresh')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar insights de clima' })
  @ApiResponse({ status: 200, description: 'Insights atualizados' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async refreshInsights(): Promise<any> {
    return this.weatherInsightsService.getInsights();
  }
}
