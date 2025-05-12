'use client'

import { useEffect, useState, useRef } from 'react'
import { ShoppingBag, Plus, Search } from 'lucide-react'

// Modelagem de produto
type Product = {
  id: number
  name: string
  category: string
  price: number
  description: string
  imageUrl: string
}

// Novo produto para formulário (price como string para permitir entrada vazia)
type NewProduct = {
  name: string
  price: string
  description: string
  imageFile: File | null
}

export default function Home() {
  // Estado de dados
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  // Estado do formulário
  const [newProduct, setNewProduct] = useState<NewProduct>({
    name: '',
    price: '',
    description: '',
    imageFile: null
  })
  const [preview, setPreview] = useState<string>('')

  // Filtros, ordenação e paginação
  const [filterName, setFilterName] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [sortField, setSortField] = useState<'name' | 'price'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  // Ref para input file
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Carregar produtos mock
  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then((data: Product[]) => {
        setProducts(data)
        setLoading(false)
      })
      .catch(console.error)
  }, [])

  // Resetar página ao mudar filtros/ordenação
  useEffect(() => {
    setCurrentPage(1)
  }, [filterName, minPrice, maxPrice, sortField, sortOrder])

  // Dropzone
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      setNewProduct(np => ({ ...np, imageFile: file }))
      setPreview(URL.createObjectURL(file))
    }
  }

  // File picker
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setNewProduct(np => ({ ...np, imageFile: file }))
      setPreview(URL.createObjectURL(file))
    }
    e.target.value = ''
  }

  // Converter File para base64
  const getBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

  // Adicionar produto
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    let imageUrl = ''
    if (newProduct.imageFile) {
      imageUrl = await getBase64(newProduct.imageFile)
    }
    const body = {
      name: newProduct.name,
      price: Number(newProduct.price),
      description: newProduct.description,
      imageUrl,
      category: ''
    }
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    const created: Product = await res.json()
    setProducts(prev => [...prev, created])
    setNewProduct({ name: '', price: '', description: '', imageFile: null })
    setPreview('')
  }

  // Filtrar e ordenar
  const filtered = products
    .filter(p =>
      p.name.toLowerCase().includes(filterName.toLowerCase()) &&
      (minPrice === '' || p.price >= Number(minPrice)) &&
      (maxPrice === '' || p.price <= Number(maxPrice))
    )
    .sort((a, b) => {
      if (sortField === 'name') {
        return sortOrder === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name)
      }
      return sortOrder === 'asc' ? a.price - b.price : b.price - a.price
    })

  // Paginação
  const lastIndex = currentPage * itemsPerPage
  const firstIndex = lastIndex - itemsPerPage
  const currentItems = filtered.slice(firstIndex, lastIndex)
  const totalPages = Math.ceil(filtered.length / itemsPerPage)

  // Loading spinner
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="text-2xl font-bold text-gray-800">MyStore</div>
          <div className="flex-grow mx-8 max-w-xl">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar produtos..."
                className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-100 border-transparent focus:ring-2 focus:ring-primary/20 transition"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            </div>
          </div>
          <div className="relative">
            <ShoppingBag className="text-gray-700 hover:text-primary transition cursor-pointer" size={24} />
            <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">0</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {/* Formulário */}
        <form onSubmit={handleAdd} className="bg-white shadow-lg rounded-xl p-6 mb-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <input
            type="text"
            placeholder="Nome do Produto"
            required
            value={newProduct.name}
            onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 transition"
          />
          <input
            type="number"
            placeholder="Preço"
            required
            value={newProduct.price}
            onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 transition"
          />
          <input
            type="text"
            placeholder="Descrição"
            required
            value={newProduct.description}
            onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 transition"
          />

          {/* Dropzone */}
          <div
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="col-span-full md:col-span-2 lg:col-span-1 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition flex items-center justify-center"
          >
            {preview ? (
              <img src={preview} alt="Preview" className="max-h-40 object-cover rounded-lg" />
            ) : (
              <div className="flex flex-col items-center text-gray-500">
                <Plus className="w-10 h-10 mb-2" />
                <span>Arraste a imagem ou clique aqui</span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <button
            type="submit"
            className="col-span-full bg-primary text-blue-700 py-3 rounded-lg flex items-center justify-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Adicionar Produto</span>
          </button>
        </form>

        {/* Filtros */}
        <div className="mb-8 flex flex-wrap gap-4 items-center justify-between bg-white p-4 rounded-lg shadow-md">
          <div className="flex flex-wrap gap-4">
            <input
              type="text"
              placeholder="Buscar por nome"
              value={filterName}
              onChange={e => setFilterName(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 transition"
            />
            <input
              type="number"
              placeholder="Preço mínimo"
              value={minPrice}
              onChange={e => setMinPrice(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 transition"
            />
            <input
              type="number"
              placeholder="Preço máximo"
              value={maxPrice}
              onChange={e => setMaxPrice(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 transition"
            />
          </div>
          <div className="flex gap-4">
            <select
              value={sortField}
              onChange={e => setSortField(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 transition"
            >
              <option value="name">Ordenar por Nome</option>
              <option value="price">Ordenar por Preço</option>
            </select>
            <select
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 transition"
            >
              <option value="asc">Ascendente</option>
              <option value="desc">Descendente</option>
            </select>
          </div>
        </div>

        {/* Listagem com Paginação */}
        {currentItems.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-500 text-lg">Nenhum produto encontrado.</p>
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {currentItems.map(p => (
              <div
                key={p.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden transform transition hover:-translate-y-2"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={p.imageUrl || undefined}
                    alt={p.name}
                    className="w-full h-56 object-cover transition transform hover:scale-110"
                  />
                  <button className="absolute bottom-2 right-2 bg-primary text-white p-2 rounded-full hover:bg-blue-700 transition">
                    <ShoppingBag size={20} />
                  </button>
                </div>
                <div className="p-4">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">{p.name}</h2>
                  <p className="text-sm text-gray-500 mb-2">{p.category}</p>
                  <p className="text-primary font-bold text-lg mb-2">R$ {p.price.toFixed(2)}</p>
                  <p className="text-sm text-gray-600 line-clamp-2">{p.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Navegação de páginas */}
        {totalPages > 1 && (
          <nav className="flex justify-center mt-8 space-x-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded ${
                  currentPage === i + 1
                    ? 'bg-primary text-white'
                    : 'bg-white border border-gray-300'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </nav>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white shadow-t-md py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="text-gray-600">© 2024 MyStore. Todos os direitos reservados.</div>
          <div className="flex space-x-4">
            <a href="#" className="text-gray-500 hover:text-primary">Contato</a>
            <a href="#" className="text-gray-500 hover:text-primary">Sobre</a>
            <a href="#" className="text-gray-500 hover:text-primary">Política de Privacidade</a>
          </div>
        </div>
      </footer>
    </div>
  )
}