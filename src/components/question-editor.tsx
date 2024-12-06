import * as React from 'react';
import axios from 'axios';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Trash2 } from 'lucide-react'

import ClozeEditor from './cloze-editor'
import Categorize from './categorize'

type QuestionType = 'categorize' | 'cloze'

interface Question {
  id: number;
  type: QuestionType;
}

export default function QuestionEditor() {
  const [questions, setQuestions] = React.useState<Question[]>([
    { id: 1, type: 'categorize' }
  ])
  
  const handleSubmit = async () => {
    try {
      const response = await axios.post('http://your-api-url/forms', {
        questions: questions, // Send the questions array
      });
      console.log('Response:', response.data);
      // Handle success (e.g., show a success message, reset form, etc.)
    } catch (error) {
      console.error('Error submitting questions:', error);
      // Handle error (e.g., show an error message)
    }
  };

  const handleQuestionTypeChange = (value: QuestionType, questionId: number) => {
    setQuestions(prevQuestions =>
      prevQuestions.map(q =>
        q.id === questionId ? { ...q, type: value } : q
      )
    )
  }

  const addNewQuestion = () => {
    setQuestions(prev => [
      ...prev,
      { id: prev.length + 1, type: 'categorize' }
    ])
  }

  const removeQuestion = (questionId: number) => {
    setQuestions(prev => {
      const filtered = prev.filter(q => q.id !== questionId)
      // Reorder remaining questions
      return filtered.map((q, index) => ({
        ...q,
        id: index + 1
      }))
    })
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      {questions.map((question) => (
        <div key={question.id} className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Question {question.id}</h2>
            <div className="flex items-center gap-4">
              <Select
                value={question.type}
                onValueChange={(value: QuestionType) => 
                  handleQuestionTypeChange(value, question.id)
                }
              >
                <SelectTrigger className="w-[280px]">
                  <SelectValue placeholder="Select question type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="categorize">Categorize</SelectItem>
                  <SelectItem value="cloze">Cloze</SelectItem>
                </SelectContent>
              </Select>
              {questions.length > 1 && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => removeQuestion(question.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="p-6">
            {question.type === 'categorize' ? (
              <Categorize  />
            ) : (
              <ClozeEditor />
            )}
          </div>
        </div>
      ))}

      <Button
        onClick={addNewQuestion}
        className="mt-4 w-full"
        variant="outline"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add New Question
      </Button>
    </div>
  )
}