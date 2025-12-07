import { useState } from 'react'
import { FileText, FileSpreadsheet } from 'lucide-react'
import { weatherApi } from '@/lib/api/weather.api'
import type { WeatherFiltersParams } from '@/types/weather.types'
import { Button } from '@/components/ui/button'

interface Props {
  filters: WeatherFiltersParams
}

export function ExportButtons({ filters }: Props) {
  const [loading, setLoading] = useState<'csv' | 'xlsx' | null>(null)

  const handleExport = async (format: 'csv' | 'xlsx') => {
    try {
      setLoading(format)
      const blob = format === 'csv'
        ? await weatherApi.exportCSV(filters)
        : await weatherApi.exportXLSX(filters)

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `weather-logs-${new Date().toISOString().split('T')[0]}.${format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error(`Error exporting ${format}:`, error)
      alert(`Erro ao exportar arquivo ${format.toUpperCase()}`)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex w-full md:w-auto gap-2">
      <Button
        onClick={() => handleExport('csv')}
        disabled={loading !== null}
        className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 text-white gap-2"
      >
        {loading === 'csv' ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : (
          <FileText className="h-4 w-4" />
        )}
        <span className="hidden sm:inline">Exportar</span> CSV
      </Button>

      <Button
        onClick={() => handleExport('xlsx')}
        disabled={loading !== null}
        className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white gap-2"
      >
        {loading === 'xlsx' ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : (
          <FileSpreadsheet className="h-4 w-4" />
        )}
        <span className="hidden sm:inline">Exportar</span> XLSX
      </Button>
    </div>
  )
}
