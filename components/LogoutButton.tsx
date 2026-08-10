"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import styles from "./Sidebar.module.css";

export function LogoutButton() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleLogout() {
    setIsSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      className={styles.profileChevron}
      onClick={handleLogout}
      disabled={isSigningOut}
      aria-label="Cerrar sesión"
      title="Cerrar sesión"
      style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
    >
      <LogOut size={14} />
    </button>
  );
}
