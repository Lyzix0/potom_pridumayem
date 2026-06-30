"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Home03Icon, Briefcase01Icon, ChatIcon, UserIcon } from "@hugeicons/core-free-icons";

const navItems = [
  {
    label: "Главная",
    icon: Home03Icon,
    href: "/home",
  },
  {
    label: "Услуги",
    icon: Briefcase01Icon,
    href: "/services",
  },
  {
    label: "Чат",
    icon: ChatIcon,
    href: "/chat",
  },
  {
    label: "Профиль",
    icon: UserIcon,
    href: "/profile",
  },
];

const ALLOWED_ROUTES = navItems.map((item) => item.href);

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [isDragging, setIsDragging] = useState(false);
  const [dragX, setDragX] = useState(0);

  const navRef = useRef<HTMLDivElement>(null);

  const shouldShow = ALLOWED_ROUTES.some(
    (route) => pathname === route || pathname?.startsWith(route + "/")
  );

  if (!shouldShow) {
    return null;
  }

  const activeIndex = navItems.findIndex(
    (item) => pathname === item.href || (item.href !== "/home" && pathname?.startsWith(item.href + "/"))
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!navRef.current) return;
    const rect = navRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - 8; // Pointer X relative to inner content
    
    setIsDragging(true);
    setDragX(x);
    
    navRef.current.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !navRef.current) return;
    const rect = navRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - 8; // Pointer X relative to inner content
    
    const navWidth = rect.width - 16;
    const clampedX = Math.max(0, Math.min(x, navWidth));
    setDragX(clampedX);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !navRef.current) return;
    setIsDragging(false);
    navRef.current.releasePointerCapture(e.pointerId);

    const rect = navRef.current.getBoundingClientRect();
    const navWidth = rect.width - 16;
    const colWidth = navWidth / navItems.length;

    // Find closest tab index based on dragX
    const closestIndex = Math.max(
      0,
      Math.min(
        Math.round((dragX - colWidth / 2) / colWidth),
        navItems.length - 1
      )
    );

    const targetItem = navItems[closestIndex];
    if (targetItem && pathname !== targetItem.href) {
      router.push(targetItem.href);
    }
  };

  return (
    <div className="z-40 w-screen h-[80px] md:h-[96px] fixed flex justify-center items-center bottom-0 bg-linear-to-t from-black/30 via-transparent">
      <nav
        ref={navRef}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="w-[94vw] md:w-[50vw] max-w-[400px] md:max-w-[480px] lg:max-w-[550px] lg:min-w-[500px] bg-neutral-500/40 backdrop-blur-[2px] fixed flex rounded-full items-center p-2 big-shadow inner-white-shadow text-white select-none touch-none"
      >
        {activeIndex !== -1 && (
          <div
            onPointerDown={handlePointerDown}
            className={`absolute top-1 bottom-1 rounded-full cursor-grab active:cursor-grabbing ${
              isDragging ? "bg-neutral-400/25 inner-white-shadow" : "bg-neutral-700/40"
            }`}
            style={{
              width: `calc((100% - 8px) / ${navItems.length})`,
              transform: isDragging
                ? `translateX(calc(${dragX}px - (100% - 16px) / ${navItems.length * 2})) scale(1.4)`
                : `translateX(calc(${activeIndex} * 100%))`,
              left: "4px",
              transition: isDragging
                ? "none"
                : "transform 320ms cubic-bezier(0.34, 1.56, 0.64, 1), background-color 200ms, box-shadow 200ms",
            }}
          />
        )}

        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              draggable="false"
              className="relative z-10 flex-1 flex items-center justify-center flex-col py-1 rounded-full cursor-pointer transition-colors duration-200"
            >
              <HugeiconsIcon icon={item.icon} />
              <span className={`text-xs transition-all duration-200 ${isActive ? "font-semibold" : "opacity-80"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
