import FormEditor from "./components/FormEditor"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

const queryClient = new QueryClient();

function App() {


  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <div className="flex justify-center items-center">
          <FormEditor />
        </div>
      </QueryClientProvider>
    </BrowserRouter>
  )
}

export default App
