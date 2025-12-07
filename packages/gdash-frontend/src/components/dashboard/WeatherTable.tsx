import { useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, MapPin, Calendar } from 'lucide-react'
import type { WeatherLog } from '@/types/weather.types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { WeatherDetailsDialog } from './WeatherDetailsDialog'

interface Props {
  data: WeatherLog[]
  loading: boolean
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function WeatherTable({ data, loading, page, totalPages, onPageChange }: Props) {
  const [selectedLog, setSelectedLog] = useState<WeatherLog | null>(null)

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="py-12 text-center">
        <MapPin className="mx-auto h-12 w-12 text-muted-foreground" />
        <p className="mt-4 text-lg font-medium text-foreground">Nenhum log encontrado</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Tente ajustar os filtros ou aguarde a coleta de novos dados
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="rounded-md border bg-card text-card-foreground shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-muted/50">
                <TableHead className="font-bold text-foreground whitespace-nowrap">Localização</TableHead>
                <TableHead className="font-bold text-foreground whitespace-nowrap">Temperatura</TableHead>
                <TableHead className="font-bold text-foreground whitespace-nowrap hidden md:table-cell">Humidade</TableHead>
                <TableHead className="font-bold text-foreground whitespace-nowrap hidden md:table-cell">Vento</TableHead>
                <TableHead className="font-bold text-foreground whitespace-nowrap hidden md:table-cell">Data/Hora</TableHead>
                <TableHead className="font-bold text-foreground whitespace-nowrap md:hidden w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((log) => (
                <TableRow
                  key={log._id}
                  className="hover:bg-muted cursor-pointer md:cursor-default"
                  onClick={() => setSelectedLog(log)}
                >
                  <TableCell className="whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-muted text-foreground">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{log.city}</p>
                        {log.country && (
                          <p className="text-sm text-foreground/80">{log.country}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <span className="text-lg font-bold text-foreground">
                      {log.temperature?.toFixed(1) ?? 'N/A'}°C
                    </span>
                  </TableCell>
                  <TableCell className="min-w-[150px] hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 rounded-full bg-secondary overflow-hidden border border-border">
                        <div
                          className="h-full bg-blue-600 dark:bg-blue-400 rounded-full"
                          style={{ width: `${Math.min(log.humidity || 0, 100)}%` }}
                        />
                      </div>
                      <span className="font-medium text-foreground">{log.humidity ?? 'N/A'}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap hidden md:table-cell">
                    <span className="font-medium text-foreground">{log.windSpeed?.toFixed(1) ?? 'N/A'} km/h</span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap hidden md:table-cell">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground/80">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(log.timestamp), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </div>
                  </TableCell>
                  <TableCell className="md:hidden">
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <WeatherDetailsDialog
        log={selectedLog}
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border pt-4">
          <div className="text-sm text-muted-foreground">
            Página {page} de {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
              className="gap-1"
            >
              Próxima
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
