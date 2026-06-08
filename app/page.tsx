// app/page.tsx
// Root route — redirects to login page immediately.

import { redirect } from "next/navigation";

export default function Home() {
  redirect("/login");
}
