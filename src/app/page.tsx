"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function HomePage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check if the user is already authenticated
    const token = localStorage.getItem("token");
    if (token) {
      router.replace("/dashboard");
    } else {
      // Stop the loading state to render the homepage UI
      setIsChecking(false);
    }
  }, [router]);

  // Prevent a "flash" of the homepage before the redirect happens
  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-3xl space-y-12 text-center">
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/register"
            className="flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white transition-colors hover:bg-indigo-700 sm:w-auto md:px-10 md:py-4 md:text-lg"
          >
            Create an Account
          </Link>
          <Link
            href="/login"
            className="flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-8 py-3 text-base font-medium text-gray-700 transition-colors hover:bg-gray-50 sm:w-auto md:px-10 md:py-4 md:text-lg"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
