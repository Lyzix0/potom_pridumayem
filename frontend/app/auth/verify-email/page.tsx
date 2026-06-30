"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft02Icon } from "@hugeicons/core-free-icons";

import { requestEmailVerify, verifyEmail } from "@/frontend/lib/auth";

import { Button } from "@/frontend/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/frontend/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/frontend/components/ui/field";
import { Input } from "@/frontend/components/ui/input";

function VerifyEmailClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email") || "";
  const [code, setCode] = useState("");

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!email) return;

    const sendCode = async () => {
      try {
        setSending(true);

        const data = await requestEmailVerify(email);

        if (data.alreadyVerified) {
          router.push("/home");
          return;
        }
      } catch (err) {
        setErrorMessage(
          err instanceof Error
            ? err.message
            : "Не удалось отправить код"
        );
      } finally {
        setSending(false);
      }
    };

    sendCode();
  }, [email, router]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      await verifyEmail({ email, code });
      router.push("/home");
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Неверный код или срок истёк"
      );
    }
  };

  const resetForm = () => {
    setCode("");
    setErrorMessage("");
    setSuccessMessage("");
  };

  if (errorMessage || successMessage) {
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
              {!successMessage ? (
                <Button onClick={resetForm} className="w-full flex items-center justify-center gap-2">
                  <HugeiconsIcon icon={ArrowLeft02Icon} size={16} />
                  Назад
                </Button>
              ) : (
                <p className="text-center text-sm text-muted-foreground">
                  Перенаправление...
                </p>
              )}
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
            <CardTitle className="text-xl">Подтверждение почты</CardTitle>
            <CardDescription>
              Мы отправили код на {email}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleVerify}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="code">Код</FieldLabel>
                  <Input
                    id="code"
                    placeholder="Введите код"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                  />
                </Field>

                <Field>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={!code || sending}
                  >
                    {sending ? "Отправка кода..." : "Подтвердить"}
                  </Button>
                </Field>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => router.push("/auth/signup")}
                  className="w-full justify-start"
                >
                  <HugeiconsIcon icon={ArrowLeft02Icon} size={16} className="mr-2" />
                  Вернуться к регистрации
                </Button>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-svh w-full items-center justify-center">
        <p className="text-sm text-muted-foreground">Загрузка...</p>
      </div>
    }>
      <VerifyEmailClient />
    </Suspense>
  );
}
