"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { logout } from "@/app/(auth)/actions";

interface UserNavProps {
  email: string;
}

/** 사용자 이메일 표시 및 로그아웃 버튼 */
export function UserNav({ email }: UserNavProps) {
  const [isPending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(() => logout());
  }

  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-muted-foreground hidden sm:inline">{email}</span>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLogout}
        disabled={isPending}
      >
        {isPending ? "..." : "로그아웃"}
      </Button>
    </div>
  );
}
