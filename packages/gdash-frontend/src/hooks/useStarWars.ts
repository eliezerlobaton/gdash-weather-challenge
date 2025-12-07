import { useState, useCallback } from 'react'
import { starWarsApi } from '@/lib/api/starwars.api'
import type { StarWarsEntity, StarWarsCategory } from '@/types/starwars.types'

interface UseStarWarsReturn {
  items: StarWarsEntity[]
  loading: boolean
  error: string | null
  page: number
  totalPages: number
  category: StarWarsCategory
  setCategory: (category: StarWarsCategory) => void
  search: (query: string) => Promise<void>
  loadPage: (page: number) => Promise<void>
  clear: () => void
  limit: number
  setLimit: (limit: number) => void
}

export function useStarWars(): UseStarWarsReturn {
  const [items, setItems] = useState<StarWarsEntity[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [limit, setLimitState] = useState(10)
  const [category, setCategoryState] = useState<StarWarsCategory>('characters')

  const loadPage = useCallback(async (pageNum: number, cat: StarWarsCategory = category, currentLimit: number = limit) => {
    try {
      setLoading(true)
      setError(null)

      const data = await starWarsApi.getEntities(cat, pageNum, currentLimit)
      setItems(data.data)
      setTotalPages(Math.ceil(data.info.total / data.info.limit))
      setPage(pageNum)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar itens')
    } finally {
      setLoading(false)
    }
  }, [category, limit])

  const setCategory = useCallback((newCategory: StarWarsCategory) => {
    setCategoryState(newCategory)
    setPage(1)
    setItems([])
    // Trigger load for new category
    loadPage(1, newCategory, limit)
  }, [limit, loadPage])

  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      loadPage(1, category, limit)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const results = await starWarsApi.searchEntities(category, query)

      if (results.length === 0) {
        setItems([])
        setTotalPages(0)
      } else if (results.length === 1) {
        const fullEntity = await starWarsApi.getEntity(category, results[0]._id)
        setItems([fullEntity])
        setTotalPages(1)
      } else {
        setItems(results)
        setTotalPages(1)
      }
    } catch {
      setError('Falha na busca')
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [category, loadPage, limit])


  const setLimit = useCallback((newLimit: number) => {
    setLimitState(newLimit)
    setPage(1)
    loadPage(1, category, newLimit)
  }, [category, loadPage])

  const clear = useCallback(() => {
    loadPage(1, category, limit)
  }, [loadPage, category, limit])

  return {
    items,
    loading,
    error,
    page,
    totalPages,
    category,
    setCategory,
    search,
    loadPage,
    clear,
    limit,
    setLimit,
  }
}
