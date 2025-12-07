import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { User } from "lucide-react"
import type { StarWarsEntity } from "@/types/starwars.types"

interface CharacterDetailsModalProps {
  character: StarWarsEntity | null
  isOpen: boolean
  onClose: () => void
}

export function CharacterDetailsModal({ character, isOpen, onClose }: CharacterDetailsModalProps) {
  if (!character) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{character.name}</DialogTitle>
          <DialogDescription>
            Detalhes do item selecionado
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="aspect-video relative overflow-hidden rounded-lg bg-muted">
            {character.image ? (
              <img
                src={character.image}
                alt={character.name}
                className="object-cover w-full h-full"
                onError={(e) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(character.name)}&background=random`
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-secondary">
                <User className="h-16 w-16 text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Descrição</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {character.description || 'Nenhuma descrição disponível.'}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
