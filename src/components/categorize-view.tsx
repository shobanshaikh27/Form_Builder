import * as React from 'react'
import { RotateCcw, Bookmark } from 'lucide-react'
import {
  DndContext,
  DragEndEvent,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  useDroppable
} from '@dnd-kit/core'
import { useDraggable } from '@dnd-kit/core'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'

interface Item {
  id: string
  name: string
  categoryId: string | null
}

interface Category {
  id: string
  name: string
  color: string
}

interface DraggableItemProps {
  id: string
  children: React.ReactNode
}

function DraggableItem({ id, children }: DraggableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({ id })

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="inline-block m-2"
    >
      <div className="px-6 py-2 bg-white rounded-full border-2 border-gray-200 cursor-move hover:bg-gray-50">
        {children}
      </div>
    </div>
  )
}

interface DroppableZoneProps {
  category: Category
  items: Item[]
}

function DroppableZone({ category, items }: DroppableZoneProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: category.id,
  })

  return (
    <div className="flex-1 mx-4">
      <div
        className="rounded-2xl p-4 mb-2 text-center text-lg font-medium"
        style={{ backgroundColor: category.color }}
      >
        {category.name}
      </div>
      <div
        ref={setNodeRef}
        className={`rounded-2xl min-h-[300px] p-4 transition-colors duration-200 ${
          isOver ? 'ring-2 ring-primary' : ''
        }`}
        style={{ 
          backgroundColor: category.color,
          border: '2px dashed rgba(0,0,0,0.1)',
        }}
      >
        {items.map((item) => (
          <DraggableItem key={item.id} id={item.id}>
            {item.name}
          </DraggableItem>
        ))}
      </div>
    </div>
  )
}

export default function CategorizeView() {
  const initialItems: Item[] = [
    { id: '1', name: 'Paris', categoryId: null },
    { id: '2', name: 'Japan', categoryId: null },
    { id: '3', name: 'Brazil', categoryId: null },
    { id: '4', name: 'USA', categoryId: null },
    { id: '5', name: 'Madrid', categoryId: null },
  ]

  const [items, setItems] = React.useState<Item[]>(initialItems)

  const categories: Category[] = [
    { id: '1', name: 'Country', color: 'rgb(255, 228, 230)' },
    { id: '2', name: 'City', color: 'rgb(254, 240, 138)' },
    { id: '3', name: 'Place', color: 'rgb(269, 70, 138)' },
  ]

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!active) return

    const itemId = active.id
    const categoryId = over ? over.id : null

    setItems(prevItems => {
      // Find the item being dragged
      const draggedItem = prevItems.find(item => item.id === itemId.toString())
      if (!draggedItem) return prevItems

      // Remove the item from its current position
      const filteredItems = prevItems.filter(item => item.id !== itemId.toString())

      // Add the item to the end of the list with the new categoryId
      return [
        ...filteredItems,
        { 
          ...draggedItem, 
          categoryId: categoryId === 'uncategorized' ? null : 
            (categoryId ? categoryId.toString() : null) 
        }
      ]
    })
  }

  const uncategorizedItems = items.filter(item => !item.categoryId)

  const handleReset = () => {
    setItems(initialItems.map(item => ({
      ...item,
      categoryId: null
    })))
  }

  return (
    <Card className="w-full max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-medium">Categorize the following</h1>
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon"
            onClick={handleReset}
            title="Reset all items"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <div className="border rounded-full px-4 py-1">
            10 Points
          </div>
          <Button variant="outline" size="icon">
            <Bookmark className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        onDragEnd={handleDragEnd}
      >
        <UncategorizedZone items={uncategorizedItems} />

        <div className="flex gap-4">
          {categories.map((category) => (
            <DroppableZone
              key={category.id}
              category={category}
              items={items.filter(item => item.categoryId === category.id)}
            />
          ))}
        </div>
      </DndContext>
    </Card>
  )
}

function UncategorizedZone({ items }: { items: Item[] }) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'uncategorized'
  })

  return (
    <div
      ref={setNodeRef}
      className={`mb-8 min-h-[100px] p-4 rounded-lg transition-colors duration-200 ${
        isOver ? 'bg-gray-50 ring-2 ring-primary' : 'bg-transparent'
      }`}
    >
      {items.map((item) => (
        <DraggableItem key={item.id} id={item.id}>
          {item.name}
        </DraggableItem>
      ))}
    </div>
  )
}

