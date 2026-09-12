"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function LogoutButton() {
  const router = useRouter();

  function handleClick() {
    fetch("/api/auth/logout", { method: "POST" }).finally(() => {
      router.push("/login");
      router.refresh();
    });
  }

  return (
    <div className="mt-6.5">
      <Button variant="danger-outline" onClick={handleClick}>
        Salir de la sesión
      </Button>
    </div>
  );
}
