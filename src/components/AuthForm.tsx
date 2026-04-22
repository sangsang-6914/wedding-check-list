"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { type AuthResult } from "@/actions/auth";

interface AuthFormProps {
  mode: "login" | "signup";
  action: (formData: FormData) => Promise<AuthResult>;
}

/** 로그인/회원가입 공통 폼 컴포넌트 */
export function AuthForm({ mode, action }: AuthFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isLoginMode = mode === "login";

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await action(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="text-4xl mb-2">💒</div>
          <CardTitle className="text-xl">
            {isLoginMode ? "로그인" : "회원가입"}
          </CardTitle>
          <CardDescription>
            {isLoginMode
              ? "웨딩 체크리스트에 로그인하세요"
              : "새 계정을 만들어 시작하세요"}
          </CardDescription>
        </CardHeader>
        <form action={handleSubmit}>
          <CardContent className="space-y-4 mb-6">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                minLength={6}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full p-6" disabled={isPending}>
              {isPending
                ? "처리 중..."
                : isLoginMode
                  ? "로그인"
                  : "회원가입"}
            </Button>
            <p className="text-sm text-muted-foreground">
              {isLoginMode ? "계정이 없으신가요? " : "이미 계정이 있으신가요? "}
              <Link
                href={isLoginMode ? "/signup" : "/login"}
                className="text-primary underline-offset-4 hover:underline"
              >
                {isLoginMode ? "회원가입" : "로그인"}
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
