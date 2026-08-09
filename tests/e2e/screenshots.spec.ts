import path from "node:path";
import { test } from "@playwright/test";

const captures = [
  {
    name: "portfolio-home-desktop.png",
    route: "/",
    width: 1440,
    height: 1000,
    theme: "light" as const,
  },
  {
    name: "portfolio-home-mobile.png",
    route: "/",
    width: 375,
    height: 812,
    theme: "light" as const,
  },
  {
    name: "portfolio-relay-desktop.png",
    route: "/work/relay",
    width: 1440,
    height: 1000,
    theme: "light" as const,
  },
  {
    name: "portfolio-relay-mobile.png",
    route: "/work/relay",
    width: 375,
    height: 812,
    theme: "light" as const,
  },
  {
    name: "portfolio-careerflow-desktop.png",
    route: "/work/careerflow",
    width: 1440,
    height: 1000,
    theme: "light" as const,
  },
  {
    name: "portfolio-careerflow-mobile.png",
    route: "/work/careerflow",
    width: 375,
    height: 812,
    theme: "light" as const,
  },
  {
    name: "portfolio-about-desktop.png",
    route: "/about",
    width: 1440,
    height: 1000,
    theme: "light" as const,
  },
  {
    name: "portfolio-home-dark-desktop.png",
    route: "/",
    width: 1440,
    height: 1000,
    theme: "dark" as const,
  },
] as const;

test.describe("production screenshots", () => {
  for (const capture of captures) {
    test(`capture ${capture.name}`, async ({ page }, testInfo) => {
      test.skip(
        testInfo.project.name !== "desktop-chromium",
        "Capture once with Chromium",
      );
      await page.setViewportSize({
        width: capture.width,
        height: capture.height,
      });
      await page.emulateMedia({
        colorScheme: capture.theme,
        reducedMotion: "reduce",
      });
      await page.goto(capture.route);
      await page.evaluate((theme) => {
        document.documentElement.dataset.theme = theme;
        document.documentElement.style.colorScheme = theme;
      }, capture.theme);
      await page.screenshot({
        path: path.resolve("docs/assets/screenshots", capture.name),
        fullPage: true,
      });
    });
  }
});
