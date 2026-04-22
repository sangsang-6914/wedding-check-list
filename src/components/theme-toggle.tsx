"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

/** 라이트/다크 테마 전환 버튼 (hydration 이후에만 아이콘 표시) */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  function handleToggle() {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="size-9 shrink-0"
      onClick={handleToggle}
      disabled={!mounted}
      aria-label={
        !mounted
          ? "테마 전환"
          : resolvedTheme === "dark"
            ? "라이트 모드로 전환"
            : "다크 모드로 전환"
      }
    >
      {!mounted ? (
        <span className="size-4 inline-block" aria-hidden />
      ) : resolvedTheme === "dark" ? (
        <Sun className="size-4" />
      ) : (
        <Moon className="size-4" />
      )}
    </Button>
  );
}
