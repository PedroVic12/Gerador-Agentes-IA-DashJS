import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card } from './ui/card'
import { Pencil, Trash2 } from 'lucide-react'

// Initialize Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL as string,
  import.meta.env.VITE_SUPABASE_ANON_KEY as string
)

interface Item {
  id: number
  name: string
}

export function CRUDPage() {
  const [items, setItems] = useState<Item[]>([])
  const [newItemName, setNewItemName] = useState('')

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    const { data, error } = await supabase.from('items').select('*')
    if (error) {
      console.error('Error fetching items:', error)
      return
    }
    setItems(data || [])
  }

  const addItem = async () => {
    if (!newItemName.trim()) return
    const { error } = await supabase.from('items').insert([{ name: newItemName }])
    if (error) {
      console.error('Error adding item:', error)
      return
    }
    setNewItemName('')
    fetchItems()
  }

  const updateItem = async (id: number, newName: string) => {
    if (!newName.trim()) return
    const { error } = await supabase
      .from('items')
      .update({ name: newName })
      .eq('id', id)
    if (error) {
      console.error('Error updating item:', error)
      return
    }
    fetchItems()
  }

  const deleteItem = async (id: number) => {
    const { error } = await supabase.from('items').delete().eq('id', id)
    if (error) {
      console.error('Error deleting item:', error)
      return
    }
    fetchItems()
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-4">Supabase CRUD</h1>
        
        <div className="flex gap-2 mb-4">
          <Input
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="Item Name"
            className="flex-1"
          />
          <Button onClick={addItem}>Add Item</Button>
        </div>

        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 bg-secondary rounded-lg"
            >
              <span>{item.name}</span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const newName = prompt('Enter new name:', item.name)
                    if (newName) updateItem(item.id, newName)
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteItem(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
