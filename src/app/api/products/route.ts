import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import { join } from 'path'

const DB_PATH = join(process.cwd(), 'db.json')

export async function GET() {
  const file = await fs.readFile(DB_PATH, 'utf-8')
  const { products } = JSON.parse(file)
  return NextResponse.json(products)
}

export async function POST(request: Request) {
  const body = await request.json()
  const file = await fs.readFile(DB_PATH, 'utf-8')
  const db = JSON.parse(file)
  const newProd = { id: Date.now(), ...body }
  db.products.push(newProd)
  // opcional: persista no arquivo
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2))
  return NextResponse.json(newProd, { status: 201 })
}
