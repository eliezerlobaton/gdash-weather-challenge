import { useEffect, useState, useMemo, useCallback } from 'react'
import { TrendingUp, TrendingDown, Droplet, Wind, Sparkles, Lightbulb, RefreshCw } from 'lucide-react'
import { weatherApi } from '@/lib/api/weather.api'
import type { WeatherFiltersParams, WeatherInsights } from '@/types/weather.types'


interface Props {
  filters: WeatherFiltersParams
}

export function WeatherStats({ filters }: Props) {
  const [insights, setInsights] = useState<WeatherInsights | null>(null)
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const insightFilters = useMemo(() => ({
    ...filters,
    page: undefined,
    limit: undefined
  }), [filters])

  const loadInsights = useCallback(async () => {
    try {
      setLoading(true)
      const data = await weatherApi.getInsights(insightFilters)
      setInsights(data)
    } catch (error) {
      console.error('Error loading insights:', error)
    } finally {
      setLoading(false)
    }
  }, [insightFilters])

  useEffect(() => {
    loadInsights()
  }, [loadInsights])

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true)
      const data = await weatherApi.refreshInsights()
      setInsights(data)
    } catch (error) {
      console.error('Error refreshing insights:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass-card h-32 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  if (!insights) return null

  const { statistics } = insights

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Análise e Estatísticas</h2>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing || loading}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors text-sm font-medium"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Atualizando...' : 'Atualizar Insights'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 🤖 Resumo IA */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Sparkles className="h-24 w-24 text-foreground" />
          </div>
          <div className="flex items-start gap-4 relative z-10">
            <div className="p-3 rounded-lg bg-purple-500/20 text-purple-600 dark:text-purple-400">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-foreground mb-2">Análise de IA</h3>
              <p className="text-foreground/80 leading-relaxed">{insights.summary}</p>
            </div>
          </div>
        </div>

        {/* 📈 Tendências */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp className="h-24 w-24 text-foreground" />
          </div>
          <div className="flex items-start gap-4 relative z-10">
            <div className="p-3 rounded-lg bg-blue-500/20 text-blue-600 dark:text-blue-400">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-foreground mb-2">Tendências</h3>
              <p className="text-foreground/80 leading-relaxed">{insights.temperatureTrends}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 📊 Estatísticas */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: 'Temp. Média',
            value: `${statistics?.averageTemperature?.toFixed(1) ?? 'N/A'}°C`,
            icon: Droplet,
            color: 'text-blue-600 dark:text-blue-400',
            bg: 'bg-blue-500/20',
            border: 'border-blue-200 dark:border-blue-500/20'
          },
          {
            label: 'Temp. Máxima',
            value: `${statistics?.maxTemperature?.toFixed(1) ?? 'N/A'}°C`,
            icon: TrendingUp,
            color: 'text-red-600 dark:text-red-400',
            bg: 'bg-red-500/20',
            border: 'border-red-200 dark:border-red-500/20'
          },
          {
            label: 'Temp. Mínima',
            value: `${statistics?.minTemperature?.toFixed(1) ?? 'N/A'}°C`,
            icon: TrendingDown,
            color: 'text-cyan-600 dark:text-cyan-400',
            bg: 'bg-cyan-500/20',
            border: 'border-cyan-200 dark:border-cyan-500/20'
          },
          {
            label: 'Humidade',
            value: `${statistics?.averageHumidity?.toFixed(0) ?? 'N/A'}%`,
            icon: Wind,
            color: 'text-purple-600 dark:text-purple-400',
            bg: 'bg-purple-500/20',
            border: 'border-purple-200 dark:border-purple-500/20'
          },
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className={`rounded-xl border bg-card text-card-foreground shadow-sm p-6 hover:scale-105 transition-transform duration-300`}
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
              <p className="text-3xl font-bold text-foreground">{stat.value}</p>
            </div>
          )
        })}
      </div>

      {/* 💡 Recomendações */}
      {insights.recommendations.length > 0 && (
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400">
              <Lightbulb className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-foreground mb-3">Recomendações</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {insights.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    <span className="text-foreground/80 text-sm">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500 text-right">
        Gerado por {insights.modelUsed}
      </div>
    </div>
  )
}
