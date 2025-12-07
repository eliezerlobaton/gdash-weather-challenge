import { User } from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import type { StarWarsEntity } from '@/types/starwars.types'

interface Props {
  character: StarWarsEntity
  onClick?: () => void
}

export function CharacterCard({ character, onClick }: Props) {
  return (
    <Card
      className={`overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="aspect-[3/4] relative overflow-hidden bg-muted">
        {character.image ? (
          <img
            src={character.image}
            alt={character.name}
            className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
            onError={(e) => {
              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(character.name)}&background=random`
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-secondary">
            <User className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
      </div>
      <CardHeader>
        <CardTitle className="truncate text-center">{character.name}</CardTitle>
      </CardHeader>
    </Card>
  )
}
