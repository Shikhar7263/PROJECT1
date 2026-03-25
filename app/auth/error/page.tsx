import Link from "next/link";

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-3xl font-headline font-bold text-on-surface mb-4">
          Authentication Error
        </h1>
        <p className="text-on-surface-variant mb-8">
          Something went wrong during authentication.
        </p>
        <Link
          href="/auth/login"
          className="bg-primary text-on-primary px-8 py-3 rounded-full font-bold font-headline hover:opacity-90 transition-opacity"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
}
