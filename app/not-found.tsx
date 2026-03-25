import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center font-body">
      <div className="text-center">
        <h1 className="text-8xl font-headline font-extrabold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-headline font-bold text-on-surface mb-3">Page Not Found</h2>
        <p className="text-on-surface-variant mb-8">The page you&apos;re looking for doesn&apos;t exist.</p>
        <Link
          href="/"
          className="bg-primary text-on-primary px-8 py-3 rounded-full font-bold font-headline hover:opacity-90 transition-opacity"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
