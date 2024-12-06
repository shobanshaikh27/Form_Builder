import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Trash2 } from 'lucide-react' // Import the trash icon
import ClozeEditor from './cloze-editor'
import Categorize from './categorize'
import { useEffect, useState } from 'react'
// import axios from 'axios';
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import { useMutation } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast'

type Question = {
  id: string; // Add an id field
  type: 'categorize' | 'cloze' | 'comprehension'
  data: any
}

export default function FormEditor() {
  
  const [headerImage, setHeaderImage] = useState('')
  const [questions, setQuestions] = useState<Question[]>([])
  const [formName, setFormName] = useState('');
  const [formElements, setFormElements] = useState([]);

  const handleDataChange = (data) => {
    console.log("Updating formElements with:", data);
    setFormElements(data);
  };

  useEffect(() => {
    console.log("useEffect triggered with formElements:", formElements);
    if (formElements) {
      console.log("Parent received data from Child:", formElements);
    }
  }, [formElements]);

  const addQuestion = (type: 'categorize' | 'cloze' | 'comprehension') => {
    const newQuestion: Question = {
      id: Date.now().toString(), // Generate unique id
      type,
      data: {}
    }
    setQuestions([...questions, newQuestion])
  }

  const deleteQuestion = (questionId: string) => {
    setQuestions(questions.filter(question => question.id !== questionId))
  }
  // const { id } = useParams();

  // const axiosPrivate = useAxiosPrivate();
  // const { mutate, isPending } = useMutation({
  //   mutationFn: () =>
  //     axiosPrivate({
  //       url: '/forms/' + id,
  //       method: 'post',
  //       data: {
  //         name: formName,
  //         elements: formElements,
  //       },
  //     }),
  //   onSuccess: () => {
  //     toast.success(
  //       `Form created successfully`,
  //     );
  //   },
  //   onError: () =>
  //     toast.error(`Error creating form`),
  // });
 



  return (
    // <form
    //   className="flex flex-grow flex-col"
    //   onSubmit={e => {
    //     e.preventDefault();
    //     if (formElements.length === 0) {
    //       toast.error('Form is empty!');
    //       return;
    //     }
    //     mutate();
    //   }}
    // >
      <div className="container w-1/2 mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Form Builder</h1>
        <div className="mb-4">
          <Label htmlFor="formTitle">Form Title</Label>
          <Input
            id="formTitle"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="Enter form title"
          />
        </div>
        <div className="mb-4">
          <Label htmlFor="headerImage">Header Image URL</Label>
          <Input
            id="headerImage"
            value={headerImage}
            onChange={(e) => setHeaderImage(e.target.value)}
            placeholder="Enter header image URL"
          />
        </div>
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Questions</h2>
          {questions.map((question, index) => (
            <div key={question.id} className="mb-4 p-4 relative">
              {/* Add question number and delete button */}
              <div className="flex justify-between items-center mb-4">
                <span className="font-medium">Question {index + 1}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteQuestion(question.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 absolute top-2 right-2"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {question.type === 'categorize' && (
                <Categorize sendDataToParent={handleDataChange} />
              )}
              {question.type === 'cloze' && (
                <ClozeEditor />
              )}
            </div>
          ))}
        </div>
        <Tabs defaultValue="categorize" className="mb-4">
          <TabsList>
            <TabsTrigger value="categorize">Categorize</TabsTrigger>
            <TabsTrigger value="cloze">Cloze</TabsTrigger>
            <TabsTrigger value="comprehension">Comprehension</TabsTrigger>
          </TabsList>
          <TabsContent value="categorize">
            <Button onClick={() => addQuestion('categorize')}>Add Categorize Question</Button>
          </TabsContent>
          <TabsContent value="cloze">
            <Button onClick={() => addQuestion('cloze')}>Add Cloze Question</Button>
          </TabsContent>
          <TabsContent value="comprehension">
            <Button onClick={() => addQuestion('comprehension')}>Add Comprehension Question</Button>
          </TabsContent>
        </Tabs>
        <Button>Save Form</Button>
      </div>
    // </form>
  )
}