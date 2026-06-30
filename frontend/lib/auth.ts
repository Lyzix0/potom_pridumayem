"use client";

import { apiFetch } from "../lib/api";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role?: string;
  created_at?: string;
  createdAt?: string;
};

type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

type LoginPayload = {
  email: string;
  password: string;
};

type VerifyEmailPayload = {
  email: string;
  code: string;
};

type ResetPasswordPayload = {
  email: string;
  code: string;
  newPassword: string;
};

type AuthResponse<T> = {
  ok: boolean;
  status: number;
  data: T;
};

// Toggle mock authentication while backend is not ready
const USE_MOCK_AUTH = process.env.NEXT_PUBLIC_BYPASS_AUTH === "true" || process.env.NODE_ENV === "development";

// Helper to get/set item safely on client side
function getStorageItem(key: string): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(key);
}

function setStorageItem(key: string, value: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, value);
  }
}

function removeStorageItem(key: string): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(key);
  }
}

async function parseResponse<T>(response: Response): Promise<AuthResponse<T>> {
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  return {
    ok: response.ok,
    status: response.status,
    data,
  };
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

async function expectSuccess<T>(response: Response, fallback: string) {
  const parsed = await parseResponse<T & { error?: string }>(response);

  if (!parsed.ok) {
    throw new Error(parsed.data.error || fallback);
  }

  return parsed.data;
}

export function isUnauthorizedError(error: unknown) {
  return error instanceof Error && error.message === "Unauthorized";
}

export async function register(payload: RegisterPayload) {
  if (USE_MOCK_AUTH) {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const newUser: AuthUser = {
      id: Math.random().toString(36).substring(2, 9),
      name: payload.name,
      email: payload.email,
      role: "user",
      createdAt: new Date().toISOString(),
    };

    setStorageItem(`mock_user_${payload.email}`, JSON.stringify(newUser));
    setStorageItem("mock_session", payload.email);

    return { user: newUser, message: "Регистрация успешна (заглушка)." };
  }

  return await expectSuccess<{ user?: AuthUser; message?: string }>(
    await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
    "Регистрация не удалась.",
  );
}

export async function login(payload: LoginPayload) {
  if (USE_MOCK_AUTH) {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const userStr = getStorageItem(`mock_user_${payload.email}`);
    let user: AuthUser;

    if (userStr) {
      user = JSON.parse(userStr);
    } else {
      user = {
        id: Math.random().toString(36).substring(2, 9),
        name: payload.email.split("@")[0],
        email: payload.email,
        role: "user",
        createdAt: new Date().toISOString(),
      };
      setStorageItem(`mock_user_${payload.email}`, JSON.stringify(user));
    }

    setStorageItem("mock_session", payload.email);

    return { user, message: "Вход успешен (заглушка)." };
  }

  return await expectSuccess<{ user?: AuthUser; message?: string }>(
    await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
    "Неверная почта или пароль.",
  );
}

export async function logout() {
  if (USE_MOCK_AUTH) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    removeStorageItem("mock_session");
    return;
  }

  await apiFetch("/auth/logout", {
    method: "POST",
  });
}

export async function getMe() {
  if (USE_MOCK_AUTH) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const activeEmail = getStorageItem("mock_session");

    if (!activeEmail) {
      throw new Error("Unauthorized");
    }

    const userStr = getStorageItem(`mock_user_${activeEmail}`);
    if (!userStr) {
      throw new Error("Unauthorized");
    }

    return JSON.parse(userStr) as AuthUser;
  }

  try {
    return await expectSuccess<AuthUser>(
      await apiFetch("/auth/me", {
        method: "GET",
      }),
      "Unauthorized",
    );
  } catch (error) {
    throw new Error(getErrorMessage(error, "Unauthorized"));
  }
}

export async function requestEmailVerify(email: string) {
  if (USE_MOCK_AUTH) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return { message: "Код подтверждения отправлен (заглушка).", alreadyVerified: false };
  }

  return expectSuccess<{ message?: string; alreadyVerified?: boolean }>(
    await apiFetch("/auth/request-email-verify", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),
    "Не удалось отправить код подтверждения.",
  );
}

export async function verifyEmail(payload: VerifyEmailPayload) {
  if (USE_MOCK_AUTH) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { message: "Почта успешно подтверждена (заглушка)." };
  }

  return expectSuccess<{ message?: string }>(
    await apiFetch("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
    "Неверный код подтверждения.",
  );
}

export async function forgotPassword(email: string) {
  if (USE_MOCK_AUTH) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return { message: "Код для сброса пароля отправлен на почту (заглушка)." };
  }

  return expectSuccess<{ message?: string }>(
    await apiFetch("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),
    "Не удалось отправить код сброса.",
  );
}

export async function resetPassword(payload: ResetPasswordPayload) {
  if (USE_MOCK_AUTH) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { message: "Пароль успешно изменен (заглушка)." };
  }

  return expectSuccess<{ message?: string }>(
    await apiFetch("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
    "Не удалось обновить пароль.",
  );
}