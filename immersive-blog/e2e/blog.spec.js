import { expect, test } from '@playwright/test';

const IGNORED_CONSOLE = [/WebGL/i, /THREE\.WebGLRenderer/i, /Failed to load resource/i];

function collectErrors(page) {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error' && !IGNORED_CONSOLE.some((rule) => rule.test(message.text()))) {
      errors.push(message.text());
    }
  });
  return errors;
}

test('首屏内容、导航与页脚完整渲染', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto('/');

  await expect(page.locator('.hero__name')).toHaveText('林知遥');
  await expect(page.locator('.nav__link')).toHaveCount(5);
  await expect(page.locator('#category-chips .chip')).toHaveCount(5);
  await expect(page.locator('#post-grid .post-card')).toHaveCount(6);
  await expect(page.locator('#tag-cloud .tag')).not.toHaveCount(0);
  await expect(page.locator('.site-footer')).toBeVisible();
  await expect(page.locator('#boot')).toHaveCount(0, { timeout: 10_000 });

  expect(errors).toEqual([]);
});

test('分类与标签筛选联动文章列表', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: /3D 视觉/ }).click();
  await expect(page.locator('#post-grid .post-card')).toHaveCount(2);
  await expect(page.locator('#post-grid .post-card__cat')).toContainText(['3D 视觉', '3D 视觉']);

  await page.locator('#tag-cloud .tag', { hasText: 'Three.js' }).click();
  await expect(page.locator('#post-grid .post-card')).toHaveCount(1);
  await expect(page.locator('#post-grid .post-card__title')).toContainText('大气');

  // 再次点击同一标签取消筛选，回到全部文章
  await page.locator('#tag-cloud .tag', { hasText: 'Three.js' }).click();
  await expect(page.locator('#post-grid .post-card')).toHaveCount(6);
});

test('文章详情支持打开、展开与 Esc 关闭', async ({ page }) => {
  await page.goto('/');

  const firstCard = page.locator('#post-grid .post-card').first();
  await firstCard.getByRole('button', { name: '阅读全文' }).click();

  const panel = page.locator('#article-panel');
  await expect(panel).toHaveAttribute('data-open', 'true');
  await expect(page.locator('#panel-title')).toContainText('3D 场景');

  const body = page.locator('.panel__body p');
  await expect(body).toHaveCount(1);

  await page.getByRole('button', { name: '展开全文' }).click();
  await expect(body).toHaveCount(3);
  await expect(page.getByRole('button', { name: '收起全文' })).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(panel).toHaveAttribute('data-open', 'false');
});

test('主题切换生效并写入本地存储', async ({ page }) => {
  await page.goto('/');
  const html = page.locator('html');

  await expect(html).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button', { name: /切换到亮色主题/ }).click();
  await expect(html).toHaveAttribute('data-theme', 'light');

  await page.reload();
  await expect(html).toHaveAttribute('data-theme', 'light');

  await page.getByRole('button', { name: /切换到暗色主题/ }).click();
  await expect(html).toHaveAttribute('data-theme', 'dark');
});

test('三维画布可用，拖拽与滚轮交互不产生运行时错误', async ({ page, browserName }) => {
  test.skip(browserName === 'webkit' || browserName === 'mobile-safari', '无 GPU 的无头 WebKit 不保证 WebGL');
  const errors = collectErrors(page);

  await page.goto('/');
  const canvas = page.locator('#scene-root canvas');
  await expect(canvas).toBeAttached();
  await expect(page.locator('#scene-root')).toHaveClass(/is-ready/, { timeout: 10_000 });

  const box = await canvas.boundingBox();
  expect(box.width).toBeGreaterThan(200);
  expect(box.height).toBeGreaterThan(200);

  const stage = page.locator('#stage');
  const stageBox = await stage.boundingBox();
  const centerX = stageBox.x + stageBox.width / 2;
  const centerY = stageBox.y + stageBox.height / 2;

  await page.mouse.move(centerX, centerY);
  await page.mouse.down();
  await page.mouse.move(centerX - 120, centerY + 40, { steps: 12 });
  await page.mouse.up();

  await page.mouse.wheel(0, -320);
  await page.waitForTimeout(300);

  expect(errors).toEqual([]);
});

test('移动端布局无横向溢出且底部导航可用', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);

  const nav = page.locator('.nav');
  await expect(nav).toBeVisible();
  await nav.getByRole('link', { name: '文章' }).click();
  await expect(page.locator('#articles')).toBeInViewport();

  await page.locator('#post-grid .post-card').first().getByRole('button', { name: '阅读全文' }).click();
  await expect(page.locator('#article-panel')).toHaveAttribute('data-open', 'true');
  await expect(page.locator('.panel__sheet')).toBeInViewport();
});
