import { X } from 'lucide-react'
import type { WeatherFiltersParams } from '@/types/weather.types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Props {
  filters: WeatherFiltersParams
  setFilter: <K extends keyof WeatherFiltersParams>(
    key: K,
    value: WeatherFiltersParams[K]
  ) => void
  clearFilters: () => void
  hasActiveFilters: boolean
}

export function WeatherFilters({ filters, setFilter, clearFilters, hasActiveFilters }: Props) {
  return (
    <div className="mb-6 space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 items-end">
        {/* Limit per page */}
        <div>
          <label htmlFor="limit" className="mb-1 block text-sm font-medium text-foreground">
            Itens por página
          </label>
          <Select
            value={String(filters.limit || 10)}
            onValueChange={(value) => setFilter('limit', Number(value))}
          >
            <SelectTrigger className="bg-background border-input">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Start Date */}
        <div>
          <label htmlFor="startDate" className="mb-1 block text-sm font-medium text-foreground">
            Data Inicial
          </label>
          <Input
            id="startDate"
            type="date"
            value={filters.startDate || ''}
            onChange={(e) => setFilter('startDate', e.target.value)}
            className="bg-background border-input"
          />
        </div>

        {/* End Date */}
        <div>
          <label htmlFor="endDate" className="mb-1 block text-sm font-medium text-foreground">
            Data Final
          </label>
          <Input
            id="endDate"
            type="date"
            value={filters.endDate || ''}
            onChange={(e) => setFilter('endDate', e.target.value)}
            className="bg-background border-input"
          />
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <div>
            <Button
              variant="secondary"
              onClick={clearFilters}
              className="w-full gap-2"
            >
              <X className="h-4 w-4" />
              Limpar Filtros
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

