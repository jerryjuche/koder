"use client"

import { Loader2 } from "lucide-react"

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" className="flex-shrink-0">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
      <path fill="#FF3D00" d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z" />
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
  )
}

export function GoogleButton({
  onClick,
  loading,
  disabled,
}: {
  onClick: () => void
  loading: boolean
  disabled: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className="group/btn relative w-full flex items-center justify-center gap-3 bg-[#1C1C28] hover:bg-[#252535] border border-[#2A2A3A] hover:border-brand-muted-gold/30 rounded-xl px-4 py-3 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-input"
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-brand-offwhite-muted/30 border-t-brand-offwhite-muted rounded-full animate-spin" />
      ) : (
        <GoogleIcon />
      )}
      <span className="text-[15px] font-medium text-brand-offwhite group-hover/btn:text-white transition-colors">
        Continue with Google
      </span>
    </button>
  )
}
