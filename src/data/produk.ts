export type Produk = { id: string; nama: string; harga: number; fileKey: string }
export const PRODUK: Produk[] = [
  { id: 'template-1', nama: 'Template Undangan Digital', harga: 49000, fileKey: 'template-1.zip' },
  { id: 'template-2', nama: 'Template Kartu Nama', harga: 29000, fileKey: 'template-2.zip' },
]
export const cariProduk = (id: string) => PRODUK.find(p => p.id === id)
