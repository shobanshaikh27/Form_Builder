"use client"

import * as React from "react"
import { Bold, Italic, Underline, Subscript, Superscript, GripVertical, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Input } from "@/components/ui/input"

interface UnderlinedWord {
  id: string;
  word: string;
  checked: boolean;
}

interface ImageData {
  url: string;
  file: File;
}

function SortableItem({ word, onCheckboxChange, onDelete }: { 
  word: UnderlinedWord; 
  onCheckboxChange: (id: string, checked: boolean) => void;
  onDelete: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: word.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="flex items-center space-x-2 bg-white p-2 rounded-md border"
    >
      <div {...listeners} className="cursor-grab">
        <GripVertical className="h-5 w-5 text-gray-500" />
      </div>
      <Checkbox 
        id={`word-${word.id}`} 
        checked={word.checked}
        onCheckedChange={(checked) => onCheckboxChange(word.id, checked as boolean)}
      />
      <label
        htmlFor={`word-${word.id}`}
        className="text-sm font-medium leading-none flex-grow"
      >
        {word.word}
      </label>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDelete(word.id)}
        className="h-8 w-8 text-red-500 hover:text-red-700"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

export default function ClozeEditor() {
  const [content, setContent] = React.useState<string>("");
  const [underlinedWords, setUnderlinedWords] = React.useState<UnderlinedWord[]>([])
  const editorRef = React.useRef<HTMLDivElement>(null)
  const [image, setImage] = React.useState<ImageData | null>(null);

  React.useEffect(() => {
    if (editorRef.current && !content) {
      editorRef.current.textContent = "Underline the words here to convert them into blanks";
      setContent(editorRef.current.innerHTML);
    }
  }, []);

  const handleFormat = (command: string) => {
    document.execCommand(command, false)
  }

  const handleUnderline = () => {
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed) {
      const range = selection.getRangeAt(0);
      const selectedText = range.toString();
      
      // Get the common ancestor of the selection
      const commonAncestor = range.commonAncestorContainer;
      
      // Check if the selection is already underlined
      let isUnderlined = false;
      let existingUnderline: Element | null = null;
      
      if (commonAncestor.nodeType === Node.TEXT_NODE && commonAncestor.parentElement?.tagName === 'U') {
        // Direct parent is an underline
        isUnderlined = true;
        existingUnderline = commonAncestor.parentElement;
      } else if (commonAncestor.nodeType === Node.ELEMENT_NODE) {
        // Check if selection is exactly an underlined element
        const underlineElements = (commonAncestor as Element).getElementsByTagName('u');
        for (let i = 0; i < underlineElements.length; i++) {
          if (underlineElements[i].textContent === selectedText) {
            isUnderlined = true;
            existingUnderline = underlineElements[i];
            break;
          }
        }
      }

      if (isUnderlined && existingUnderline) {
        // Remove underlining
        const wordId = existingUnderline.getAttribute('data-word-id');
        if (wordId) {
          // Remove from underlinedWords state
          setUnderlinedWords(prev => prev.filter(w => w.id !== wordId));
          
          // Replace the underlined element with plain text
          const textNode = document.createTextNode(existingUnderline.textContent || '');
          existingUnderline.parentNode?.replaceChild(textNode, existingUnderline);
        }
      } else {
        // Add new underlining
        if (selectedText && !underlinedWords.some(w => w.word === selectedText.trim())) {
          const newWord = { id: Date.now().toString(), word: selectedText.trim(), checked: true };
          setUnderlinedWords([...underlinedWords, newWord]);
          
          const span = document.createElement('span');
          span.innerHTML = `<u data-word-id="${newWord.id}">${selectedText}</u>`;
          
          // Preserve the ending space if it exists
          const endSpace = /\s$/.test(selectedText) ? ' ' : '';
          
          range.deleteContents();
          range.insertNode(span);
          
          if (endSpace) {
            const spaceNode = document.createTextNode(endSpace);
            span.parentNode?.insertBefore(spaceNode, span.nextSibling);
          }
        }
      }
      
      selection.removeAllRanges();
      updateContent();
    }
  };

  const updateContent = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      setContent(newContent);
    }
  };

  const updatePreview = (html: string) => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    const textNodes = doc.evaluate('//text()', doc, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null)
    
    let result = ''
    for (let i = 0; i < textNodes.snapshotLength; i++) {
      const textNode = textNodes.snapshotItem(i)
      if (textNode) {
        const parentElement = textNode.parentElement
        if (parentElement && parentElement.tagName === 'U') {
          const wordId = parentElement.getAttribute('data-word-id')
          const underlinedWord = underlinedWords.find(w => w.id === wordId)
          result += underlinedWord && underlinedWord.checked ? '____' : textNode.textContent
        } else {
          result += textNode.textContent
        }
      }
    }
    
    return result
  }

  const handleCheckboxChange = (id: string, checked: boolean) => {
    setUnderlinedWords(prev => 
      prev.map(w => w.id === id ? { ...w, checked } : w)
    )
    
    if (editorRef.current) {
      const underline = editorRef.current.querySelector(`u[data-word-id="${id}"]`) as HTMLElement
      if (underline) {
        if (checked) {
          underline.style.textDecoration = 'underline'
        } else {
          underline.style.textDecoration = 'none'
        }
      }
    }
    updateContent()
  }

  const handleDeleteOption = (id: string) => {
    setUnderlinedWords(prev => prev.filter(w => w.id !== id))
    if (editorRef.current) {
      const underline = editorRef.current.querySelector(`u[data-word-id="${id}"]`)
      if (underline) {
        const textNode = document.createTextNode(underline.textContent || '')
        underline.parentNode?.replaceChild(textNode, underline)
      }
    }
    updateContent()
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setUnderlinedWords((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      setContent(newContent);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImage({
        url: imageUrl,
        file: file
      });
    }
  };


  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 p-4">
      <div className="space-y-2">
        <h2 className="text-sm font-medium">Question 1</h2>
        
        <div className="space-y-1">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <h3 className="text-sm font-medium">Preview</h3>
              <div className="p-4 border rounded-md bg-white" aria-live="polite" aria-atomic="true">
                {updatePreview(content)}
              </div>
            </div>
            
            <div className="w-48 space-y-2">
              <label 
                htmlFor="image-upload" 
                className="block text-sm font-medium text-gray-700"
              >
                Upload Image
              </label>
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="text-sm"
              />
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium flex items-center gap-1">
            Sentence
            <span className="text-red-500">*</span>
          </label>
          
          <div className="border rounded-md">
            <div className="flex items-center gap-1 p-2 border-b">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleFormat('bold')}
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleFormat('italic')}
              >
                <Italic className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleUnderline}
              >
                <Underline className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleFormat('subscript')}
              >
                <Subscript className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleFormat('superscript')}
              >
                <Superscript className="h-4 w-4" />
              </Button>
             
            </div>
            
            <div
              ref={editorRef}
              contentEditable
              className="min-h-[100px] p-3 focus:outline-none"
              onInput={handleInput}
              suppressContentEditableWarning={true}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={underlinedWords.map(word => word.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {underlinedWords.map((word) => (
                  <SortableItem
                    key={word.id}
                    word={word}
                    onCheckboxChange={handleCheckboxChange}
                    onDelete={handleDeleteOption}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        {image && (
          <div className="flex flex-col items-center space-y-2">
            <div className="relative w-full aspect-video">
              <img
                src={image.url}
                alt="Uploaded content"
                className="rounded-md object-contain w-full h-full"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                onClick={() => {
                  URL.revokeObjectURL(image.url);
                  setImage(null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-gray-500">
              {image.file.name}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

