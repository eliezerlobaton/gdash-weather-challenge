import { useState, useEffect } from 'react'
import { Search, User, ChevronLeft, ChevronRight, Rocket, PawPrint, Bot, MapPin, Building2, Dna } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useStarWars } from '@/hooks/useStarWars'
import { CharacterCard } from '@/components/starwars/CharacterCard'
import { CharacterDetailsModal } from '@/components/starwars/CharacterDetailsModal'
import type { StarWarsCategory, StarWarsEntity } from '@/types/starwars.types'

const CATEGORIES: { id: StarWarsCategory; label: string; icon: React.ElementType }[] = [
  { id: 'characters', label: 'Personagens', icon: User },
  { id: 'creatures', label: 'Criaturas', icon: PawPrint },
  { id: 'droids', label: 'Droids', icon: Bot },
  { id: 'locations', label: 'Locais', icon: MapPin },
  { id: 'organizations', label: 'Organizações', icon: Building2 },
  { id: 'species', label: 'Espécies', icon: Dna },
  { id: 'vehicles', label: 'Veículos', icon: Rocket },
]

export default function StarWarsPage() {
  const [query, setQuery] = useState('')
  const [selectedCharacter, setSelectedCharacter] = useState<StarWarsEntity | null>(null)
  const { items, loading, error, search, loadPage, page, totalPages, category, setCategory, limit, setLimit } = useStarWars()

  // Initial load
  useEffect(() => {
    loadPage(1)
  }, [loadPage]) // Run once on mount

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    await search(query)
  }

  const handleClear = () => {
    setQuery('')
    search('')
  }

  const handleCategoryChange = (value: string) => {
    setCategory(value as StarWarsCategory)
    setQuery('') // Clear search when switching categories
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Star Wars Databank</h1>
        <p className="mt-2 text-muted-foreground">Explore o universo Star Wars</p>
      </div>

      <Tabs value={category} onValueChange={handleCategoryChange} className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto h-auto p-2 gap-2 bg-transparent">
          {CATEGORIES.map((cat) => (
            <TabsTrigger
              key={cat.id}
              value={cat.id}
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2"
            >
              <cat.icon className="w-4 h-4 mr-2" />
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Search Form */}
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder={`Buscar em ${CATEGORIES.find(c => c.id === category)?.label}...`}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 bg-background"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? 'Buscando...' : 'Buscar'}
            </Button>
            {query && (
              <Button
                type="button"
                variant="outline"
                onClick={handleClear}
                disabled={loading}
              >
                Limpar
              </Button>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-[3/4] bg-muted animate-pulse" />
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-6 w-3/4 rounded bg-muted animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-4 w-full rounded bg-muted animate-pulse" />
                    <div className="h-4 w-2/3 rounded bg-muted animate-pulse" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="p-4 text-destructive bg-destructive/10 rounded-lg text-center">
          <p className="font-medium">Erro ao carregar dados</p>
          <p className="text-sm opacity-80">{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => loadPage(page)}
          >
            Tentar Novamente
          </Button>
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <User className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-lg font-medium text-foreground">Nenhum item encontrado</p>
            <p className="mt-1 text-sm text-muted-foreground">Tente buscar por outro nome</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {items.map((item) => (
              <CharacterCard
                key={item._id}
                character={item}
                onClick={() => setSelectedCharacter(item)}
              />
            ))}
          </div>

          <CharacterDetailsModal
            character={selectedCharacter}
            isOpen={!!selectedCharacter}
            onClose={() => setSelectedCharacter(null)}
          />

          {/* Pagination */}
          {!query && totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Itens por página:</span>
                <Select
                  value={limit.toString()}
                  onValueChange={(value) => setLimit(Number(value))}
                >
                  <SelectTrigger className="w-[70px]">
                    <SelectValue placeholder={limit.toString()} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => loadPage(page - 1)}
                  disabled={page === 1 || loading}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Anterior
                </Button>
                <span className="text-sm font-medium text-muted-foreground">
                  Página {page} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => loadPage(page + 1)}
                  disabled={page === totalPages || loading}
                >
                  Próxima
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
