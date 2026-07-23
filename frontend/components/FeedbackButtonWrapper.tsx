"use client";

import { usePathname } from "next/navigation";
import FeedbackButton from "./FeedbackButton";

const VISIBLE_ROUTES = ["/home", "/profile", "/settings", "/leaderboard"];

export default function FeedbackButtonWrapper() {
  const pathname = usePathname();

  const isVisible = VISIBLE_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );

  if (!isVisible) return null;

  return <FeedbackButton />;
}
