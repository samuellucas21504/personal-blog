import type { ReactNode } from "react";

import { AdminChrome } from "@/components/admin/admin-chrome";
import { requireRole } from "@/lib/auth/session";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireRole(["admin"]);
  return <AdminChrome>{children}</AdminChrome>;
}
