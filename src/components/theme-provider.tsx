"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

/** next-themes로 라이트/다크 클래스를 html에 적용 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
