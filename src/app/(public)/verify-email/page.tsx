"use client";
import Link from "next/link";

export default function VerifyEmailPage() {
  return (
    <div className="min-h-[calc(100dvh-56px)] flex items-center justify-center bg-rose-50">
      <div className="p-6 bg-white/70 rounded-3xl border border-pink-200 shadow-sm text-center max-w-sm">
        <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-br from-princess-rose to-princess-peach flex items-center justify-center shadow-inner mb-3">
          <span className="text-2xl">💌</span>
        </div>

        <h2 className="text-xl font-semibold text-rose-800 mb-2">
          Email verified successfully
        </h2>

        <p className="text-gray-600 mb-4 text-sm">
          Your email has been confirmed.  
          You can now log in to your account.
          <br />
          <br />
          If you opened this link in Safari from Gmail, that’s normal —  
          just tap below to open the login page.
        </p>

        <Link
          href="/login"
          className="inline-block h-11 px-6 rounded-2xl bg-gradient-to-r from-princess-peach to-princess-rose text-gray-800 font-medium shadow-sm leading-[44px] active:scale-[.99] transition-transform"
        >
          Go to login
        </Link>
      </div>
    </div>
  );
}
