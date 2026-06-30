"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft02Icon, ViewIcon, ViewOffIcon } from "@hugeicons/core-free-icons";
import { forgotPassword, resetPassword } from "@/frontend/lib/auth";

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

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState<"email" | "code">("email");

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const passwordRules = [
    { label: "Минимум 8 символов", check: (v: string) => v.length >= 8 },
    { label: "Хотя бы одна латинская буква", check: (v: string) => /[a-zA-Z]/.test(v) },
    { label: "Без пробелов", check: (v: string) => !/\s/.test(v) },
  ];

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      await forgotPassword(email);
      setStep("code");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Не удалось отправить код. Проверьте почту и попробуйте ещё раз.");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      await resetPassword({ email, code, newPassword });
      setSuccessMessage("Пароль успешно изменён.");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Неверный код или истёк срок действия");
    }
  };

  const resetForm = () => {
    setStep("email");
    setEmail("");
    setCode("");
    setNewPassword("");
    setErrorMessage("");
    setSuccessMessage("");
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
              <Button
                onClick={successMessage ? () => router.push("/auth/login") : resetForm}
                className="w-full flex items-center justify-center gap-2"
              >
                <HugeiconsIcon icon={ArrowLeft02Icon} size={16} />
                {successMessage ? "Войти" : "Назад"}
              </Button>
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
              {step === "email"
                ? "Введите адрес вашей электронной почты для получения кода сброса"
                : "Введите полученный код и новый пароль"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {step === "email" ? (
              <form onSubmit={handleSendCode}>
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
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={!email}
                    >
                      Отправить код
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => router.push("/auth/login")}
                      className="w-full justify-start mt-2"
                    >
                      <HugeiconsIcon icon={ArrowLeft02Icon} size={16} className="mr-2" />
                      Назад
                    </Button>
                  </Field>
                </FieldGroup>
              </form>
            ) : (
              <form onSubmit={handleResetPassword}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="code">Код из письма</FieldLabel>
                    <Input
                      id="code"
                      placeholder="Введите код"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      required
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="password">Новый пароль</FieldLabel>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Введите новый пароль"
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
                      disabled={!code || !newPassword}
                    >
                      Сменить пароль
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setStep("email")}
                      className="w-full justify-start mt-2"
                    >
                      <HugeiconsIcon icon={ArrowLeft02Icon} size={16} className="mr-2" />
                      Назад к вводу почты
                    </Button>
                  </Field>
                </FieldGroup>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
