import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { WeatherLog } from '../schemas/weather-log.schema';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface InsightsData {
  averageTemperature: number;
  maxTemperature: { value: number; city: string; date: Date };
  minTemperature: { value: number; city: string; date: Date };
  averageHumidity: number;
  maxWindSpeed: { value: number; city: string; date: Date };
  mostFrequentCondition: string;
  citiesCount: number;
  totalRecords: number;
  periodStart: Date;
  periodEnd: Date;
}

interface AIInsights {
  textualSummary: string;
  keyFindings: string[];
  recommendations: string[];
  forecast: string;
  healthImpact: string;
  activities: {
    recommended: string[];
    avoid: string[];
  };
  condition: string;
  alerts: string[];
  patterns: string[];
  source: string;
  model: string;
}

@Injectable()
export class WeatherInsightsService {
  private readonly logger = new Logger(WeatherInsightsService.name);
  private readonly genAI: GoogleGenerativeAI | null;
  private readonly modelName: string;

  constructor(
    @InjectModel('WeatherLog') private weatherModel: Model<WeatherLog>,
    private configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    this.modelName =
      this.configService.get<string>('GEMINI_MODEL') || 'gemini-2.5-flash-lite';

    if (!apiKey) {
      this.logger.warn('GEMINI_API_KEY não configurada, usando fallback');
      this.genAI = null;
    } else {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.logger.log(`Gemini configurado com modelo ${this.modelName}`);
    }
  }

  async generateInsightsWithAI(): Promise<AIInsights> {
    const logs = await this.weatherModel
      .find()
      .sort({ timestamp: -1 })
      .limit(100)
      .exec();

    if (logs.length === 0) {
      return this.getFallbackInsights();
    }

    const stats = this.calculateStats(logs);
    const prompt = this.buildPrompt(stats);

    try {
      if (!this.genAI) {
        throw new Error('GEMINI_API_KEY não configurada');
      }

      const model = this.genAI.getGenerativeModel({ model: this.modelName });

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 800,
        },
      });

      const aiResponse = result.response.text();

      return this.parseAIResponse(aiResponse, stats);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Erro ao gerar insights com Gemini: ${errorMessage}`);
      this.logger.warn('Usando insights de fallback');
      return this.getFallbackInsights();
    }
  }

  private calculateStats(logs: WeatherLog[]): InsightsData {
    const temperatures = logs.map((l) => l.current.temperature);
    const humidities = logs.map((l) => l.current.humidity);

    const avgTemp =
      temperatures.reduce((a, b) => a + b, 0) / temperatures.length;
    const avgHumidity =
      humidities.reduce((a, b) => a + b, 0) / humidities.length;

    const maxTempLog = logs.reduce((max, log) =>
      log.current.temperature > max.current.temperature ? log : max,
    );
    const minTempLog = logs.reduce((min, log) =>
      log.current.temperature < min.current.temperature ? log : min,
    );
    const maxWindLog = logs.reduce((max, log) =>
      log.current.wind_speed > max.current.wind_speed ? log : max,
    );

    const conditions = logs.map((l) => l.condition_classification || 'Unknown');
    const conditionCounts = conditions.reduce(
      (acc, c) => {
        acc[c] = (acc[c] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
    const mostFrequent = Object.entries(conditionCounts).sort(
      ([, a], [, b]) => b - a,
    )[0][0];

    const cities = new Set(logs.map((l) => l.location.city)).size;

    return {
      averageTemperature: Number(avgTemp.toFixed(1)),
      maxTemperature: {
        value: maxTempLog.current.temperature,
        city: maxTempLog.location.city,
        date: new Date(maxTempLog.timestamp),
      },
      minTemperature: {
        value: minTempLog.current.temperature,
        city: minTempLog.location.city,
        date: new Date(minTempLog.timestamp),
      },
      averageHumidity: Number(avgHumidity.toFixed(1)),
      maxWindSpeed: {
        value: maxWindLog.current.wind_speed,
        city: maxWindLog.location.city,
        date: new Date(maxWindLog.timestamp),
      },
      mostFrequentCondition: mostFrequent,
      citiesCount: cities,
      totalRecords: logs.length,
      periodStart: new Date(logs[logs.length - 1].timestamp),
      periodEnd: new Date(logs[0].timestamp),
    };
  }

  private buildPrompt(stats: InsightsData): string {
    return `Você é um analista meteorológico. Gere um relatório climático em JSON em português do Brasil.

Dados Climáticos:
Temperatura: ${stats.averageTemperature}°C
Umidade: ${stats.averageHumidity}%
Vento: ${stats.maxWindSpeed.value} km/h

Retorne APENAS JSON válido em português:
{
"textualSummary": "Resumo breve do clima em português",
"keyFindings": ["observação 1", "observação 2"],
"recommendations": ["dica 1", "dica 2"],
"forecast": "previsão de tendência",
"healthImpact": "impacto na saúde",
"activities": {"recommended": ["atividade 1"], "avoid": ["evitar 1"]},
"condition": "${stats.mostFrequentCondition}",
"alerts": [],
"patterns": []
}`;
  }

  private parseAIResponse(aiResponse: string, stats: InsightsData): AIInsights {
    try {
      // Remove markdown code blocks se existirem
      const cleanResponse = aiResponse
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '');

      // Busca JSON completo na resposta (com chaves balanceadas)
      const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Resposta não contém JSON válido');
      }

      const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>;

      return {
        textualSummary:
          (parsed.textualSummary as string) || 'Análise não disponível',
        keyFindings: Array.isArray(parsed.keyFindings)
          ? (parsed.keyFindings as string[])
          : [],
        recommendations: Array.isArray(parsed.recommendations)
          ? (parsed.recommendations as string[])
          : [],
        forecast: (parsed.forecast as string) || 'Previsão não disponível',
        healthImpact: (parsed.healthImpact as string) || 'Impacto não avaliado',
        activities: {
          recommended:
            (parsed.activities as { recommended?: string[] })?.recommended ||
            [],
          avoid: (parsed.activities as { avoid?: string[] })?.avoid || [],
        },
        condition: (parsed.condition as string) || stats.mostFrequentCondition,
        alerts: Array.isArray(parsed.alerts) ? (parsed.alerts as string[]) : [],
        patterns: Array.isArray(parsed.patterns)
          ? (parsed.patterns as string[])
          : [],
        source: 'gemini',
        model: this.modelName,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Erro ao parsear resposta da IA: ${errorMessage}`);
      return this.getFallbackInsights();
    }
  }

  private getFallbackInsights(): AIInsights {
    return {
      textualSummary:
        'Insights de IA temporariamente indisponíveis (limite de requisições ou erro de conexão). Dados estatísticos básicos estão sendo exibidos.',
      keyFindings: [
        'Serviço de IA temporariamente indisponível',
        'Usando análise básica de dados',
        'Tente novamente em alguns minutos',
      ],
      recommendations: [
        'Aguarde alguns minutos antes de solicitar novos insights',
        'Os dados climáticos continuam sendo coletados normalmente',
      ],
      forecast: 'Previsão indisponível',
      healthImpact: 'Análise de impacto na saúde indisponível',
      activities: {
        recommended: [],
        avoid: [],
      },
      condition: 'Dados insuficientes',
      alerts: ['IA offline - usando fallback'],
      patterns: [],
      source: 'fallback',
      model: this.modelName || 'none',
    };
  }

  async getInsights() {
    const aiInsights = await this.generateInsightsWithAI();
    const logs = await this.weatherModel
      .find()
      .sort({ timestamp: -1 })
      .limit(100)
      .exec();
    const stats = this.calculateStats(logs);

    return {
      ...stats,
      ai: aiInsights,
      generatedAt: new Date(),
    };
  }
}
