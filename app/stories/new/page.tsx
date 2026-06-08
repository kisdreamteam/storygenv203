import Link from "next/link";
import { StoryInputForm } from "@/components/create/StoryInputForm";

export default function NewStoryPage() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl p-8">
      <div className="mb-8 ">
        <Link href="/" className="border border-gray-300 rounded-2xl p-2 text-sm text-gray-600 hover:text-gray-900">
          ← Back to stories
        </Link>
        <h1 className="mt-4 text-2xl font-semibold">New Story</h1>
        <p className="mt-2 text-sm text-gray-600">
          Enter a few details to generate a Nina &amp; Nino story.
        </p>
      </div>
      <StoryInputForm />
    </main>
  );
}
