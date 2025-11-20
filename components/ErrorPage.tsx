// components/ErrorPage.tsx
import { AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface ErrorPageProps {
  statusCode?: number;
  title?: string;
  message?: string;
}

const ErrorPage: React.FC<ErrorPageProps> = ({statusCode,title,message}:ErrorPageProps) => {
  const router = useRouter();
  return (
    // **Tailwind Layout:** min-h-screen for full height, flex utilities to center content
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-xl border-t-4 border-red-500">
        
        {/* Card Header for the Title and Icon */}
        <CardHeader className="text-center">
          <div className="mx-auto w-fit p-3 bg-red-100 rounded-full mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-3xl font-extrabold text-gray-900">
            {title}
          </CardTitle>
          {statusCode && (
            <p className="text-sm font-medium text-red-500 mt-1">
              Error Code: **{statusCode}**
            </p>
          )}
        </CardHeader>
        
        {/* Card Content for the Error Message */}
        <CardContent className="text-center pt-2">
          <p className="text-gray-600 mb-6">{message}</p>
          
          {/* Action Button */}
          <Button 
            onClick={() => {
              router.push('/dashboard')
              router.refresh();
            }} // Navigate to homepage
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
          >
            Go to Homepage
          </Button>
        </CardContent>
        
      </Card>
    </div>
  );
};

export default ErrorPage;