"use client";

import { useEffect } from "react";

interface AdminModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  children: React.ReactNode;
  isLoading?: boolean;
}

export function AdminModal({
  isOpen,
  title,
  onClose,
  onSubmit,
  children,
  isLoading = false,
}: AdminModalProps) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white dark:bg-[var(--surface)] rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 flex items-center justify-between border-b border-[var(--border)] bg-white dark:bg-[var(--surface)] p-6">
          <h2 className="text-xl font-bold text-[var(--text)]">{title}</h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-[var(--muted)] hover:text-[var(--text)] disabled:opacity-50"
          >
            ✕
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          {children}
          <div className="flex gap-2 justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 rounded border border-[var(--border)] hover:bg-[var(--surface)] disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-[var(--brand)] text-white rounded hover:opacity-90 disabled:opacity-50"
            >
              {isLoading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
