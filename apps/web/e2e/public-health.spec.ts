import { expect, test } from "@playwright/test";

test("visitor sees the branded public platform and clear next actions", async ({
  page,
}) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      name: "Software businesses can depend on.",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /book a demo/i }).first(),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /discuss your project/i }).first(),
  ).toBeVisible();
});
