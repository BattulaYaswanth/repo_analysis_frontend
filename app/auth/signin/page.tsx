'use client';
import { useEffect, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import Loading from '@/components/LoadingPage';
import axios from 'axios';


export default function SignIn() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { data: session,status } = useSession(); // get the session

    useEffect(() => {
    if (session && session.accessToken) {
        router.push('/dashboard');
    }
    }, [session, router]);

    if (status === "loading") {
        return <Loading />;
    }
    

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
      
        try {
          const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
          });
      
          // If wrong credentials or unknown error
          if (result?.error) {
            // Check if backend returned this message
            if (result.error === "User not verified") {
              toast.info("Account not verified. Sending new OTP...");
              toast.success("OTP sent to your email");
              router.push(`/auth/verify?email=${email}`);
              return;
            }
            if(result.error === "Already Email Sent Please Verify Your Account")
            {
              toast.info("Already Email Sent Please Verify Your Account");
              router.push(`/auth/verify?email=${email}`);
              return;
            }
            // Other errors
            setError(result.error);
            toast.error(result.error);
            return;
          }
      
          // Successful login
          if (result?.ok) {
            toast.success("Login Successful");
            router.push("/dashboard");
            router.refresh();
          }
      
        } catch (err: any) {
          console.error("Login error:", err);
          const errorMessage =
            err?.message || "Something went wrong during sign-in.";
          setError(errorMessage);
          toast.error(errorMessage);
        } finally {
          setLoading(false);
        }
      };
      
      

    return ( loading ? <Loading /> :
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Sign In</CardTitle>
                    <CardDescription>Enter your credentials to continue</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Signing in...' : 'Sign In'}
                        </Button>
                        <p className='items-center text-center text-gray-500'>If You Don't Have a Account?<span>
                            <Button variant={"ghost"} className='underline' onClick={() => {
                                router.push("/")
                                router.refresh()
                            }}>
                                SignUp
                            </Button>
                            </span></p>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}