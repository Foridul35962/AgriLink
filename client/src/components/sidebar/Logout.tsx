"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { LogOut } from "lucide-react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { logout } from "@/store/slice/authSlice";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { toast } from "react-toastify";

export function LogoutButton() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { t } = useLanguage();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleConfirmLogout = async () => {
    try {
      setConfirmOpen(false);
      await dispatch(logout(null)).unwrap();
      router.push("/");
      toast.success("Logout successfully")
    } catch (error: any) {
      toast.error(error.message)
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
      >
        <LogOut size={18} />
        {"Logout"}
      </button>

      {confirmOpen && mounted &&
        createPortal(
          <div
            className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
          >
            <div className="w-full max-w-sm rounded-xl border border-gray-100 bg-white p-6 shadow-2xl animate-in fade-in zoom-in duration-150">
              <h3 className="text-base font-semibold text-gray-900">
                {t.logout.title}
              </h3>
              <p className="mt-1 text-sm text-gray-500 leading-relaxed">
                {t.logout.message}
              </p>
              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmOpen(false)}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
                >
                  {t.logout.cancel}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmLogout}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 shadow-sm transition"
                >
                  {t.logout.confirm}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}