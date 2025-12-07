import { useWeatherData } from '@/hooks/useWeatherData'
import { useWeatherFilters } from '@/hooks/useWeatherFilters'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { WeatherFilters } from '@/components/dashboard/WeatherFilters'
import { WeatherStats } from '@/components/dashboard/WeatherStats'
import { WeatherTable } from '@/components/dashboard/WeatherTable'
import { ExportButtons } from '@/components/dashboard/ExportButtons'

export default function DashboardPage() {
  const { filters, setFilter, clearFilters, hasActiveFilters } =
    useWeatherFilters()
  const { data, loading, error, page, totalPages } =
    useWeatherData(filters)

  if (loading && data.length === 0) {
    return <Spinner className="size-8" />
  }

  if (error) {
    return (
      <div className="p-4 text-destructive bg-destructive/10 rounded-lg">
        Erro: {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-foreground">
          Dashboard Meteorológico
        </h1>
        <ExportButtons filters={filters} />
      </div>

      <WeatherStats filters={filters} />

      <Card>
        <CardHeader>
          <CardTitle>Logs de Clima</CardTitle>
        </CardHeader>
        <CardContent>
          <WeatherFilters
            filters={filters}
            setFilter={setFilter}
            clearFilters={clearFilters}
            hasActiveFilters={hasActiveFilters}
          />

          <WeatherTable
            data={data}
            loading={loading}
            page={page}
            totalPages={totalPages}
            onPageChange={(newPage) => setFilter('page', newPage)}
          />
        </CardContent>
      </Card>
    </div>
  )
}
