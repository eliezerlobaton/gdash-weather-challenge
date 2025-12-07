import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { MapPin, Thermometer, Wind, Droplets, Calendar, Activity } from "lucide-react"
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { WeatherLog } from "@/types/weather.types"

interface WeatherDetailsDialogProps {
  log: WeatherLog | null
  isOpen: boolean
  onClose: () => void
}

export function WeatherDetailsDialog({ log, isOpen, onClose }: WeatherDetailsDialogProps) {
  if (!log) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            {log.city}
          </DialogTitle>
          <DialogDescription>
            {log.country || 'Localização detalhada'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-background rounded-full shadow-sm">
                <Thermometer className="h-4 w-4 text-orange-500" />
              </div>
              <span className="text-sm font-medium">Temperatura</span>
            </div>
            <span className="text-lg font-bold">{log.temperature?.toFixed(1)}°C</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-background rounded-full shadow-sm">
                <Droplets className="h-4 w-4 text-blue-500" />
              </div>
              <span className="text-sm font-medium">Humidade</span>
            </div>
            <span className="font-bold">{log.humidity}%</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-background rounded-full shadow-sm">
                <Wind className="h-4 w-4 text-cyan-500" />
              </div>
              <span className="text-sm font-medium">Vento</span>
            </div>
            <span className="font-bold">{log.windSpeed?.toFixed(1)} km/h</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-background rounded-full shadow-sm">
                <Activity className="h-4 w-4 text-purple-500" />
              </div>
              <span className="text-sm font-medium">Condição</span>
            </div>
            <span className="font-bold capitalize">{log.condition}</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-background rounded-full shadow-sm">
                <Calendar className="h-4 w-4 text-green-500" />
              </div>
              <span className="text-sm font-medium">Data</span>
            </div>
            <span className="text-sm font-medium">
              {format(new Date(log.timestamp), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
