"use client"

import { useQuery } from "@tanstack/react-query"

import { getMe } from "@/frontend/lib/auth"

export function useUser() {
  return useQuery({
    queryKey: ["user"],
    queryFn: getMe,
    staleTime: 1000 * 60 * 5,
    retry: false,
  })
}
