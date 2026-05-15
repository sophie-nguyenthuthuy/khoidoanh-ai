import { expect, test } from "@playwright/test";

test("landing page renders hero and CTA", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Đăng ký kinh doanh/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Thành lập công ty/i })).toBeVisible();
});

test("pricing page lists registration tiers", async ({ page }) => {
  await page.goto("/pricing");
  await expect(page.getByText("Đăng ký kinh doanh")).toBeVisible();
  await expect(page.getByText("Đăng ký công ty TNHH")).toBeVisible();
  await expect(page.getByText("Đăng ký công ty Cổ phần")).toBeVisible();
});

test("wizard entry redirects unauthenticated user to login", async ({ page }) => {
  await page.goto("/wizard/new");
  await expect(page).toHaveURL(/\/login/);
});
