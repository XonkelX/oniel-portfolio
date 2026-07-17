import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const routes = ["/", "/about", "/work/careerflow"] as const;

test.describe("portfolio routes", () => {
  for (const route of routes) {
    test(`${route} has one clear h1 and no severe accessibility violations`, async ({
      page,
    }) => {
      await page.goto(route);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("main")).toBeVisible();
      const results = await new AxeBuilder({ page }).analyze();
      expect(
        results.violations.filter((item) =>
          ["critical", "serious"].includes(item.impact ?? ""),
        ),
      ).toEqual([]);
    });
  }

  test("homepage exposes CareerFlow and verified destinations", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "CareerFlow" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Read case study/ }),
    ).toHaveAttribute("href", "/work/careerflow");
    await expect(
      page.getByRole("link", { name: /Live application/ }),
    ).toHaveAttribute("href", "https://careerflow-snowy.vercel.app");
  });

  test("skip link moves focus to the main page content", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to main content" });
    await expect(skip).toBeFocused();
    await skip.press("Enter");
    await expect(page).toHaveURL(/#main-content$/);
  });

  test("theme selection persists across navigation", async ({ page }) => {
    await page.goto("/");
    await page
      .getByRole("button", { name: /Toggle between light and dark theme/ })
      .click();
    const activeTheme = await page.locator("html").getAttribute("data-theme");
    await page.goto("/about");
    await expect(page.locator("html")).toHaveAttribute(
      "data-theme",
      activeTheme ?? "dark",
    );
  });

  test("mobile menu opens, navigates, and closes with Escape", async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, "Mobile navigation behavior");
    const trigger = page.getByRole("button", { name: "Menu" });
    await page.goto("/");
    await trigger.click();
    await expect(
      page.getByRole("dialog", { name: "Site navigation" }),
    ).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(
      page.getByRole("dialog", { name: "Site navigation" }),
    ).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("mobile pages do not overflow horizontally", async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, "Mobile overflow check");
    for (const route of routes) {
      await page.goto(route);
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      );
      const offenders = await page.evaluate(() =>
        Array.from(document.querySelectorAll<HTMLElement>("body *"))
          .filter((node) => {
            const rect = node.getBoundingClientRect();
            return (
              rect.right > document.documentElement.clientWidth + 1 ||
              rect.left < -1
            );
          })
          .slice(0, 5)
          .map((node) => `${node.tagName.toLowerCase()}.${node.className}`),
      );
      expect(
        overflow,
        `${route} overflow: ${offenders.join(", ")}`,
      ).toBeLessThanOrEqual(1);
    }
  });

  test("reduced motion never hides core content", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "CareerFlow" }),
    ).toBeVisible();
    const duration = await page
      .locator("h1")
      .evaluate((node) => getComputedStyle(node).animationDuration);
    expect(Number.parseFloat(duration)).toBeLessThanOrEqual(0.01);
  });
});
