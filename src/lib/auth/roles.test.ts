import { canManageUsers, canPublish } from "@/lib/auth/roles";

describe("authorization roles", () => {
  it("allows publishing only for editor/admin", () => {
    expect(canPublish("author")).toBe(false);
    expect(canPublish("editor")).toBe(true);
    expect(canPublish("admin")).toBe(true);
  });

  it("allows user management only for admin", () => {
    expect(canManageUsers("editor")).toBe(false);
    expect(canManageUsers("admin")).toBe(true);
  });
});
