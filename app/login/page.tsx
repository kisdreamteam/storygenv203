import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-center text-2xl font-semibold">StoryGen</h1>
        <p className="mb-6 text-center text-sm text-gray-600">
          Sign in with your teacher account
        </p>
        <LoginForm />
      </div>
    </main>
  );
}
