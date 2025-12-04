import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WeatherLog } from '../schemas/weather-log.schema';

@Injectable()
export class WeatherInsightsService {
  constructor(
    @InjectModel('WeatherLog') private weatherModel: Model<WeatherLog>,
  ) {}

  async generateInsights(): Promise<any> {
    const logs = await this.weatherModel
      .find()
      .limit(168)
      .sort({ createdAt: -1 })
      .exec();

    if (logs.length === 0) {
      return {
        message: 'Dados insuficientes para gerar insights',
        totalRecords: 0,
      };
    }

    const temps = logs.map((log) => log.current?.temperature ?? 0);
    const humidities = logs.map((log) => log.current?.humidity ?? 0);
    const windSpeeds = logs.map((log) => log.current?.wind_speed ?? 0);

    const avgTemp = temps.reduce((sum, temp) => sum + temp, 0) / temps.length;
    const avgHumidity =
      humidities.reduce((sum, hum) => sum + hum, 0) / humidities.length;
    const maxTemp = Math.max(...temps);
    const minTemp = Math.min(...temps);

    const condition = this.classifyWeatherCondition(avgTemp, avgHumidity, logs);
    const trend = this.detectTemperatureTrend(logs);
    const comfortScore = this.calculateComfortScore(
      avgTemp,
      avgHumidity,
      windSpeeds,
    );
    const alerts = this.generateWeatherAlerts(logs, avgTemp, avgHumidity);
    const patterns = this.detectWeatherPatterns(logs);
    const summary = this.generateTextualSummary(
      logs,
      avgTemp,
      avgHumidity,
      trend,
      condition,
    );

    return {
      summary: {
        totalRecords: logs.length,
        averageTemperature: Math.round(avgTemp * 10) / 10,
        averageHumidity: Math.round(avgHumidity * 10) / 10,
        maxTemperature: maxTemp,
        minTemperature: minTemp,
        temperatureTrend: trend,
        comfortScore: Math.round(comfortScore),
      },
      aiInsights: {
        condition,
        alerts,
        patterns,
        textualSummary: summary,
        recommendations: this.generateRecommendations(
          condition,
          alerts,
          comfortScore,
          patterns,
        ),
      },
      generatedAt: new Date().toISOString(),
    };
  }

  async refreshInsights(): Promise<any> {
    const result = (await this.generateInsights()) as Record<string, any>;
    return {
      message: 'Insights atualizados com sucesso',
      lastUpdated: new Date().toISOString(),
      ...result,
    };
  }

  private classifyWeatherCondition(
    avgTemp: number,
    avgHumidity: number,
    logs: WeatherLog[],
  ): string {
    const recentLogs = logs.slice(0, 24);
    const precipitationProb =
      recentLogs.reduce((sum, log) => {
        return sum + (log.analytics?.max_precipitation_prob || 0);
      }, 0) / recentLogs.length;

    if (precipitationProb > 70) return 'chuvoso';
    if (avgTemp > 35) return 'muito_quente';
    if (avgTemp > 28 && avgHumidity > 80) return 'quente_umido';
    if (avgTemp > 25) return 'quente';
    if (avgTemp < 5) return 'muito_frio';
    if (avgTemp < 15) return 'frio';
    if (avgHumidity > 85) return 'muito_umido';
    return 'agradavel';
  }

  private detectTemperatureTrend(logs: WeatherLog[]): string {
    if (logs.length < 48) return 'dados_insuficientes';

    const recent24h = logs.slice(0, 24);
    const previous24h = logs.slice(24, 48);

    const recentAvg =
      recent24h.reduce((sum, log) => sum + (log.current?.temperature ?? 0), 0) /
      recent24h.length;
    const previousAvg =
      previous24h.reduce(
        (sum, log) => sum + (log.current?.temperature ?? 0),
        0,
      ) / previous24h.length;

    const diff = recentAvg - previousAvg;

    if (diff > 3) return 'subindo_rapido';
    if (diff > 1) return 'subindo';
    if (diff < -3) return 'caindo_rapido';
    if (diff < -1) return 'caindo';
    return 'estavel';
  }

  private calculateComfortScore(
    avgTemp: number,
    avgHumidity: number,
    windSpeeds: number[],
  ): number {
    let score = 100;

    if (avgTemp < 18 || avgTemp > 26) {
      const tempPenalty = Math.abs(avgTemp - 22) * 3;
      score -= Math.min(tempPenalty, 40);
    }

    if (avgHumidity < 30 || avgHumidity > 70) {
      const humidityPenalty = Math.abs(avgHumidity - 50) * 1.5;
      score -= Math.min(humidityPenalty, 30);
    }

    const avgWind =
      windSpeeds.reduce((sum, wind) => sum + wind, 0) / windSpeeds.length;
    if (avgWind > 20 || avgWind < 2) {
      score -= 15;
    }

    return Math.max(0, Math.min(100, score));
  }

  private generateWeatherAlerts(
    logs: WeatherLog[],
    avgTemp: number,
    avgHumidity: number,
  ): string[] {
    const alerts: string[] = [];
    const recentLogs = logs.slice(0, 12);

    if (avgTemp > 35)
      alerts.push('🔥 Calor extremo - Evite exposição prolongada ao sol');
    if (avgTemp < 5) alerts.push('🧊 Frio intenso - Vista roupas adequadas');
    if (avgHumidity > 85)
      alerts.push('💧 Umidade muito alta - Sensação de abafamento');
    if (avgHumidity < 20) alerts.push('🏜️ Ar muito seco - Hidrate-se bem');

    const highPrecipProb = recentLogs.some(
      (log) => (log.analytics?.max_precipitation_prob || 0) > 80,
    );
    if (highPrecipProb)
      alerts.push('🌧️ Alta probabilidade de chuva nas próximas horas');

    const tempVariation =
      Math.max(...recentLogs.map((l) => l.current?.temperature ?? 0)) -
      Math.min(...recentLogs.map((l) => l.current?.temperature ?? 0));
    if (tempVariation > 10) alerts.push('🌡️ Variação brusca de temperatura');

    const avgWind =
      recentLogs.reduce((sum, log) => sum + (log.current?.wind_speed ?? 0), 0) /
      recentLogs.length;
    if (avgWind < 5 && avgHumidity > 70)
      alerts.push('🌫️ Baixa ventilação pode afetar qualidade do ar');

    return alerts;
  }

  private detectWeatherPatterns(logs: WeatherLog[]): string[] {
    const patterns: string[] = [];
    const recentLogs = logs.slice(0, 72);

    const rainHours = recentLogs.filter((log) => {
      const precipitationProb: number =
        log.analytics?.max_precipitation_prob || 0;
      return precipitationProb > 60;
    }).length;

    if (rainHours >= 12) {
      patterns.push(
        `Padrão de chuva: ${Math.round((rainHours / 72) * 100)}% das últimas 72h com alta probabilidade de chuva`,
      );
    }

    const tempChanges: number[] = [];
    for (let i = 1; i < recentLogs.length; i++) {
      const diff = Math.abs(
        (recentLogs[i - 1].current?.temperature ?? 0) -
          (recentLogs[i].current?.temperature ?? 0),
      );
      if (diff > 3) {
        tempChanges.push(diff);
      }
    }

    if (tempChanges.length > 5) {
      patterns.push(
        `Padrão de variação térmica: ${tempChanges.length} mudanças significativas de temperatura nas últimas 72h`,
      );
    }

    const highHumidityHours = recentLogs.filter(
      (log) => (log.current?.humidity ?? 0) > 80,
    ).length;
    if (highHumidityHours > 24) {
      patterns.push(
        `Padrão de alta umidade: ${highHumidityHours} horas com umidade acima de 80%`,
      );
    }

    return patterns;
  }

  private generateTextualSummary(
    logs: WeatherLog[],
    avgTemp: number,
    avgHumidity: number,
    trend: string,
    condition: string,
  ): string {
    const days = Math.ceil(logs.length / 24);
    const trendText = {
      subindo_rapido: 'com tendência de aquecimento rápido',
      subindo: 'com leve tendência de aquecimento',
      caindo_rapido: 'com tendência de resfriamento rápido',
      caindo: 'com leve tendência de resfriamento',
      estavel: 'com temperaturas estáveis',
      dados_insuficientes: '',
    };

    const conditionText = {
      muito_quente: 'muito quente',
      quente_umido: 'quente e úmido',
      quente: 'quente',
      agradavel: 'agradável',
      frio: 'frio',
      muito_frio: 'muito frio',
      chuvoso: 'chuvoso',
      muito_umido: 'muito úmido',
    };

    return `Nos últimos ${days} dias, a temperatura média foi de ${Math.round(avgTemp)}°C com umidade de ${Math.round(avgHumidity)}%. O clima está ${conditionText[condition] || condition} ${trendText[trend] || ''}.`;
  }

  private generateRecommendations(
    condition: string,
    alerts: string[],
    comfortScore: number,
    patterns: string[],
  ): string[] {
    const recommendations: string[] = [];

    if (comfortScore < 30) {
      recommendations.push(
        'Condições climáticas desconfortáveis - planeje atividades internas',
      );
    } else if (comfortScore > 80) {
      recommendations.push(
        'Excelentes condições climáticas - ideal para atividades ao ar livre',
      );
    }

    if (condition === 'muito_quente') {
      recommendations.push('Use protetor solar e mantenha-se hidratado');
    }

    if (condition === 'chuvoso') {
      recommendations.push('Leve guarda-chuva e evite áreas alagáveis');
    }

    if (condition === 'frio' || condition === 'muito_frio') {
      recommendations.push('Vista roupas em camadas e proteja extremidades');
    }

    if (patterns.some((p) => p.includes('chuva'))) {
      recommendations.push('Prepare-se para dias chuvosos consecutivos');
    }

    if (patterns.some((p) => p.includes('variação'))) {
      recommendations.push(
        'Espere variações térmicas - vista roupas em camadas',
      );
    }

    if (alerts.some((a) => a.includes('umidade'))) {
      recommendations.push(
        'Cuide de problemas respiratórios devido à alta umidade',
      );
    }

    return recommendations;
  }
}
