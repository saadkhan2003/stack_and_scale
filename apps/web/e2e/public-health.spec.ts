import { expect, test } from "@playwright/test";

test("visitor sees the healthy public platform shell", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Stack & Scale platform" }),
  ).toBeVisible();
  await expect(page.getByRole("status")).toHaveText(
    "Public web shell is healthy.",
  );
});
