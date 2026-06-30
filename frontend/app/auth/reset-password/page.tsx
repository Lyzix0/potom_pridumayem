"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft02Icon, ViewIcon, ViewOffIcon } from "@hugeicons/core-free-icons";
import { forgotPassword } from "@/frontend/lib/auth";

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
  FieldGroup,
  FieldLabel,
} from "@/frontend/components/ui/field";
import { Input } from "@/frontend/components/ui/input";

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [email, setEmail] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const router = useRouter();

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

  const handleForgotPass = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      await forgotPassword(email);
      setSuccessMessage(
        'Код отправлен. Завершите смену на странице "Забыли пароль?"'
      );
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Ошибка соединения"
      );
    }
  };

  const resetForm = () => {
    setEmail("");
    setNewPassword("");
    setShowPassword(false);
    setSuccessMessage("");
    setErrorMessage("");
  };

  if (successMessage || errorMessage) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">
                {successMessage ? "Успешно" : "Ошибка"}
              </CardTitle>
              <CardDescription>
                {successMessage || errorMessage}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                {successMessage && (
                  <Button
                    onClick={() => router.push("/auth/forgot-password")}
                    className="w-full"
                  >
                    Перейти к вводу кода
                  </Button>
                )}
                <Button
                  variant="ghost"
                  onClick={resetForm}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <HugeiconsIcon icon={ArrowLeft02Icon} size={16} />
                  Назад
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Восстановление пароля</CardTitle>
            <CardDescription>
              Запросите код и завершите смену пароля
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleForgotPass}>
              <FieldGroup>
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
                  <FieldLabel htmlFor="password">Новый пароль</FieldLabel>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Пароль для следующего шага"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
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
                      showHint ? "max-h-32 opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="mt-2 rounded-2xl border bg-muted p-3 text-xs">
                      <ul className="space-y-1">
                        {passwordRules.map((rule) => {
                          const passed = rule.check(newPassword);

                          return (
                            <li
                              key={rule.label}
                              className={`flex items-center gap-2 ${
                                passed ? "text-green-600" : "text-red-500"
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

                <Field>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={!email || !newPassword}
                  >
                    Получить код
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => router.push("/auth/login")}
                    className="w-full justify-start mt-2"
                  >
                    <HugeiconsIcon icon={ArrowLeft02Icon} size={16} className="mr-2" />
                    Вернуться к авторизации
                  </Button>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
