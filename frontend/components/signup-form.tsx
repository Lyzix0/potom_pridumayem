"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { ViewIcon, ViewOffIcon } from "@hugeicons/core-free-icons";
import { register } from "@/frontend/lib/auth";

import { Button } from "@/frontend/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/frontend/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/frontend/components/ui/field";
import { Input } from "@/frontend/components/ui/input";

export function SignupForm({
  ...props
}: React.ComponentProps<typeof Card>) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  const passwordRules = [
    {
      label: "Минимум 8 символов",
      check: (v: string) => v.length >= 8,
    },
    {
      label: "Хотя бы одна латинская буква",
      check: (v: string) => /[a-zA-Z]/.test(v),
    },
    {
      label: "Без пробелов",
      check: (v: string) => !/\s/.test(v),
    },
  ];

  const handleRegister = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setErrorMessage("");

    try {
      await register({
        name,
        email,
        password,
      });

      router.push(`/auth/verify-email?email=${email}`);
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Ошибка соединения. Попробуйте позже."
      );
    }
  };

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle className="text-xl">Регистрация</CardTitle>
        <CardDescription>
          Создайте аккаунт, чтобы продолжить
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleRegister}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Имя</FieldLabel>

              <Input
                id="name"
                placeholder="Ваше имя"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="email">Почта</FieldLabel>

              <Input
                id="email"
                type="email"
                placeholder="example@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="password">Пароль</FieldLabel>

              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Ваш пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setShowHint(true)}
                  onBlur={() => setShowHint(false)}
                  required
                />

                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? (
                    <HugeiconsIcon icon={ViewOffIcon} size={18} />
                  ) : (
                    <HugeiconsIcon icon={ViewIcon} size={18} />
                  )}
                </button>
              </div>

              <div
                className={`overflow-hidden transition-all duration-300 ${
                  showHint
                    ? "max-h-32 opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <div className="mt-2 rounded-2xl border bg-muted p-3 text-xs">
                  <ul className="space-y-1">
                    {passwordRules.map((rule) => {
                      const passed = rule.check(password);

                      return (
                        <li
                          key={rule.label}
                          className={`flex items-center gap-2 ${
                            passed
                              ? "text-green-600"
                              : "text-red-500"
                          }`}
                        >
                          <span>{passed ? "✓" : "•"}</span>
                          {rule.label}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </Field>

            {errorMessage && (
              <p className="text-center text-sm text-red-500">
                {errorMessage}
              </p>
            )}

            <Field>
              <Button
                type="submit"
                className="w-full"
                disabled={!name || !email || !password}
              >
                Зарегистрироваться
              </Button>

              <FieldDescription className="text-center">
                Уже есть аккаунт?{" "}
                <Link
                  href="/auth/login"
                  className="underline underline-offset-4"
                >
                  Войти
                </Link>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}