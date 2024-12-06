import * as React from 'react'
import { Grid, X, GripVertical } from 'lucide-react'
import {
  DndContext,
  DragEndEvent,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'

interface Category {
  id: string
  name: string
}

interface Item {
  id: string
  name: string
  categoryId: string | null
}

function SortableItem({ id, children }: { id: string; children: React.ReactNode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 mb-2"
    >
      <button
        className="touch-none p-2 hover:bg-accent rounded-md"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      {children}
    </div>
  )
}

export default function Categorize({ sendDataToParent }) {
  const [categories, setCategories] = React.useState<Category[]>([])
  const [items, setItems] = React.useState<Item[]>([])
  const [newCategory, setNewCategory] = React.useState('')
  const [newItem, setNewItem] = React.useState('')

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  )

  const handleButtonClick = () => {
    const data = newCategory  
    sendDataToParent(data); // Call parent's callback with data
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      if (active.data.current?.type === 'category') {
        setCategories((categories) => {
          const oldIndex = categories.findIndex((cat) => cat.id === active.id)
          const newIndex = categories.findIndex((cat) => cat.id === over.id)
          return arrayMove(categories, oldIndex, newIndex)
        })
      } else {
        setItems((items) => {
          const oldIndex = items.findIndex((item) => item.id === active.id)
          const newIndex = items.findIndex((item) => item.id === over.id)
          return arrayMove(items, oldIndex, newIndex)
        })
      }
    }
  }

  const addCategory = () => {
    if (newCategory.trim()) {
      setCategories([
        ...categories,
        { id: Math.random().toString(), name: newCategory.trim() },
      ])
      setNewCategory('')
    }
  }

  const addItem = () => {
    if (newItem.trim()) {
      setItems([
        ...items,
        { id: Math.random().toString(), name: newItem.trim(), categoryId: null },
      ])
      setNewItem('')
    }
  }

  const removeCategory = (id: string) => {
    setCategories(categories.filter((cat) => cat.id !== id))
    setItems(items.map((item) => 
      item.categoryId === id ? { ...item, categoryId: null } : item
    ))
  }

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardContent className="p-6">
        <div className="mb-6">
          <h2 className="text-lg font-medium mb-2">Categories</h2>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={categories.map((cat) => cat.id)}
              strategy={verticalListSortingStrategy}
            >
              {categories.map((category) => (
                <SortableItem key={category.id} id={category.id}>
                  <Input
                    value={category.name}
                    readOnly
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeCategory(category.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </SortableItem>
              ))}
            </SortableContext>
          </DndContext>
          <div className="flex gap-2 mt-2">
            <Input
              placeholder="New category"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
            <Button onClick={() => {
              handleButtonClick();
              addCategory();
              }}> 
            Add </Button>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-medium mb-2">Items</h2>
          <div className="grid grid-cols-[1fr,200px] gap-4">
            <div>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={items.map((item) => item.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {items.map((item) => (
                    <SortableItem key={item.id} id={item.id}>
                      <Input
                        value={item.name}
                        readOnly
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </SortableItem>
                  ))}
                </SortableContext>
              </DndContext>
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="New item"
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                />
                <Button onClick={addItem}>Add</Button>
              </div>
            </div>
            <div className="space-y-2">
              {items.map((item) => (
                <Select
                  key={item.id}
                  value={item.categoryId || ''}
                  onValueChange={(value) => {
                    setItems(items.map((i) =>
                      i.id === item.id ? { ...i, categoryId: value } : i
                    ))
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

