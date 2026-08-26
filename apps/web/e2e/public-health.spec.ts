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

test("core public route families and product filtering work in Chromium", async ({ page }) => {
  for (const [path, heading] of [
    ["/products", "Products that make the work visible."],
    ["/services", "Good systems start with useful decisions."],
    ["/industries", "Built around how your operation actually works."],
    ["/work", "Work designed for real conditions."],
    ["/resources", "Useful thinking for useful software."],
    ["/about", "Software should reduce uncertainty, not add to it."],
    ["/contact", "Let's make the next system useful from day one."],
  ] as const) {
    await page.goto(path);
    await expect(page.getByRole("heading", { name: heading })).toBeVisible();
  }

  await page.goto("/products");
  const search = page.getByRole("searchbox", { name: "Find a product" });
  await search.fill("retail");
  await expect(page.getByRole("heading", { name: "Retail operations" })).toBeVisible();
  await search.fill("no matching product");
  await expect(page.getByText("No product matches that search.")).toBeVisible();
});

test("mobile navigation and not-found state remain usable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByText("Menu", { exact: true }).click();
  await expect(page.getByRole("navigation", { name: "Compact navigation" })).toBeVisible();
  await page.goto("/page-that-does-not-exist");
  await expect(page.getByRole("heading", { name: "That page is not here." })).toBeVisible();
});

test("command search and consent controls are keyboard-accessible", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /search ctrl k/i }).click();
  const dialog = page.getByRole("dialog", { name: "Public site search" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("searchbox").fill("retail");
  await expect(dialog.getByText("Retail operations", { exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await page.getByRole("button", { name: "Decline" }).click();
  await expect(page.getByRole("complementary", { name: "Analytics preference" })).toBeHidden();
});
