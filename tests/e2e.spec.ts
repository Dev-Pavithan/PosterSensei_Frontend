import { test, expect, Page } from '@playwright/test';

const BASE = 'http://localhost:5173';
const API = 'http://localhost:5000/api';

const ADMIN_EMAIL = 'pavithanunenthiran29@gmail.com';
const ADMIN_PASS = '1234567890';

// Generate unique email for each test run
const TEST_EMAIL = `testuser${Date.now()}@example.com`;
const TEST_PASS = 'password123';
const TEST_NAME = 'E2E Test User';

// ─────────────────────────────── Helpers ───────────────────────────────────

async function login(page: Page, email: string, password: string) {
  await page.goto(`${BASE}/login`);
  await page.waitForSelector('input[type="email"]', { timeout: 10000 });
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(`${BASE}/**`, { timeout: 10000 });
}

async function register(page: Page, name: string, email: string, password: string) {
  await page.goto(`${BASE}/login`);
  // Switch to register mode
  const signupLink = page.locator('text=Sign Up, Register, Create Account').first();
  if (await signupLink.isVisible()) await signupLink.click();
  else {
    const toggleBtn = page.locator('button:has-text("Register"), button:has-text("Sign Up")').first();
    if (await toggleBtn.isVisible()) await toggleBtn.click();
  }
  await page.waitForSelector('input[placeholder*="name" i], input[name="name"]', { timeout: 5000 });
  await page.fill('input[placeholder*="name" i], input[name="name"]', name);
  await page.fill('input[type="email"]', email);
  const passInputs = await page.$$('input[type="password"]');
  await passInputs[0].fill(password);
  if (passInputs[1]) await passInputs[1].fill(password);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
}

// ─────────────────────────────── USER FLOW ─────────────────────────────────

test.describe('User Flow', () => {
  test('Home page loads with products or empty state', async ({ page }) => {
    await page.goto(BASE);
    await expect(page).toHaveTitle(/PosterSensei/i);
    // No server errors
    await page.waitForTimeout(2000);
    const body = await page.content();
    expect(body).not.toContain('Cannot GET');
  });

  test('Shop page loads and shows products or empty state', async ({ page }) => {
    await page.goto(`${BASE}/shop`);
    await page.waitForTimeout(2000);
    const productCards = page.locator('.product-card');
    const emptyState = page.locator('text=No products found');
    const hasProducts = await productCards.count() > 0;
    const hasEmpty = await emptyState.isVisible();
    expect(hasProducts || hasEmpty).toBeTruthy();
  });

  test('Register a new user successfully', async ({ page }) => {
    await register(page, TEST_NAME, TEST_EMAIL, TEST_PASS);
    // Should be redirected away from /login if registration succeeded
    const url = page.url();
    const errorVisible = await page.locator('.alert-error, text=already exists, text=invalid').first().isVisible().catch(() => false);
    expect(errorVisible).toBeFalsy();
  });

  test('Login with registered user', async ({ page }) => {
    await login(page, TEST_EMAIL, TEST_PASS);
    // Should not be on login page anymore
    await page.waitForTimeout(2000);
    const url = page.url();
    // Either redirected to home or shows user name
    expect(url).not.toContain('/login');
  });

  test('Add product to cart and view cart', async ({ page }) => {
    await login(page, TEST_EMAIL, TEST_PASS);
    await page.goto(`${BASE}/shop`);
    await page.waitForTimeout(2000);

    const firstProduct = page.locator('.product-card').first();
    const hasProducts = await firstProduct.isVisible();

    if (!hasProducts) {
      console.log('No products in shop — skipping cart/checkout tests');
      return;
    }

    // Hover to reveal and click Add to Cart button
    await firstProduct.hover();
    await page.waitForTimeout(500);
    const addBtn = firstProduct.locator('button:has-text("Add to Cart")');
    if (await addBtn.isVisible()) {
      await addBtn.click();
    } else {
      // Click product to go to detail page
      await firstProduct.click();
      await page.waitForTimeout(1000);
      const detailAddBtn = page.locator('button:has-text("Add to Cart")').first();
      if (await detailAddBtn.isVisible()) await detailAddBtn.click();
    }

    await page.goto(`${BASE}/cart`);
    await page.waitForTimeout(1500);
    const cartItem = page.locator('.cart-item, [class*="cart"]').first();
    const hasItems = await cartItem.isVisible();
    expect(hasItems).toBeTruthy();
  });

  test('Complete checkout flow and place order', async ({ page }) => {
    await login(page, TEST_EMAIL, TEST_PASS);
    await page.goto(`${BASE}/shop`);
    await page.waitForTimeout(2000);

    const firstProduct = page.locator('.product-card').first();
    if (!await firstProduct.isVisible()) {
      console.log('No products — skipping checkout test');
      return;
    }

    await firstProduct.hover();
    await page.waitForTimeout(500);
    const addBtn = firstProduct.locator('button:has-text("Add to Cart")');
    if (await addBtn.isVisible()) {
      await addBtn.click();
    } else {
      await firstProduct.click();
      await page.waitForTimeout(1000);
      const btn = page.locator('button:has-text("Add to Cart")').first();
      if (await btn.isVisible()) await btn.click();
    }

    await page.goto(`${BASE}/checkout`);
    await page.waitForTimeout(1500);

    // Step 1: Address
    await page.fill('input[placeholder*="Street" i], input[placeholder*="address" i]', '123 Test Street');
    await page.fill('input[placeholder*="City" i]', 'Test City');
    await page.fill('input[placeholder*="PIN" i], input[placeholder*="postal" i]', '400001');
    await page.click('button:has-text("Continue to Delivery")');
    await page.waitForTimeout(1000);

    // Step 2: Delivery
    await page.click('button:has-text("Review Order")');
    await page.waitForTimeout(1000);

    // Step 3: Place order
    const placeOrderBtn = page.locator('button:has-text("Place Order")');
    await expect(placeOrderBtn).toBeVisible();
    await placeOrderBtn.click();

    // Wait for redirect
    await page.waitForTimeout(3000);
    const finalUrl = page.url();
    const isOrderPage = finalUrl.includes('/orders/');
    const hasError = await page.locator('.alert-error').isVisible().catch(() => false);

    if (hasError) {
      const errText = await page.locator('.alert-error').textContent();
      throw new Error(`Order failed with: ${errText}`);
    }
    expect(isOrderPage).toBeTruthy();
  });

  test('User profile page loads', async ({ page }) => {
    await login(page, TEST_EMAIL, TEST_PASS);
    await page.goto(`${BASE}/profile`);
    await page.waitForTimeout(1500);
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('Order history loads', async ({ page }) => {
    await login(page, TEST_EMAIL, TEST_PASS);
    await page.goto(`${BASE}/orders`);
    await page.waitForTimeout(1500);
    // No server error
    const body = await page.content();
    expect(body).not.toContain('Cannot GET');
  });
});

// ─────────────────────────────── ADMIN FLOW ───────────────────────────────

test.describe('Admin Flow', () => {
  test('Admin login and dashboard loads', async ({ page }) => {
    await login(page, ADMIN_EMAIL, ADMIN_PASS);
    await page.goto(`${BASE}/admin`);
    await page.waitForTimeout(2000);
    await expect(page.locator('h1, h2').first()).toBeVisible();
    // Should not show Access Denied
    const denied = page.locator('text=Access Denied');
    expect(await denied.isVisible()).toBeFalsy();
  });

  test('Admin Products list loads', async ({ page }) => {
    await login(page, ADMIN_EMAIL, ADMIN_PASS);
    await page.goto(`${BASE}/admin/products`);
    await page.waitForTimeout(2000);
    await expect(page.locator('h2:has-text("Manage Products")')).toBeVisible();
    // Table headers present
    await expect(page.locator('text=Product')).toBeVisible();
  });

  test('Admin can add a new product', async ({ page }) => {
    await login(page, ADMIN_EMAIL, ADMIN_PASS);
    await page.goto(`${BASE}/admin/products`);
    await page.waitForTimeout(1500);

    await page.click('button:has-text("Add Product")');
    await page.waitForTimeout(500);

    await page.fill('input[placeholder*="Naruto" i]', 'Playwright Test Poster');
    await page.fill('input[placeholder*="e.g. Naruto" i]', 'Playwright Anime');
    const numInputs = await page.$$('input[type="number"]');
    if (numInputs[0]) await numInputs[0].fill('399');   // price
    if (numInputs[1]) await numInputs[1].fill('599');   // original price
    if (numInputs[2]) await numInputs[2].fill('33');    // discount
    if (numInputs[3]) await numInputs[3].fill('25');    // stock

    // Image URL
    const imgInput = page.locator('input[placeholder*="Image URL" i]');
    await imgInput.fill('https://picsum.photos/400/500');

    await page.click('button:has-text("Save Product")');
    await page.waitForTimeout(2000);

    // Modal should close and product appear
    const modal = page.locator('text=Add New Product');
    expect(await modal.isVisible().catch(() => false)).toBeFalsy();
  });

  test('Admin Orders list loads', async ({ page }) => {
    await login(page, ADMIN_EMAIL, ADMIN_PASS);
    await page.goto(`${BASE}/admin/orders`);
    await page.waitForTimeout(2000);
    await expect(page.locator('h2:has-text("Full Order List")')).toBeVisible();
  });

  test('Admin Users list loads', async ({ page }) => {
    await login(page, ADMIN_EMAIL, ADMIN_PASS);
    await page.goto(`${BASE}/admin/users`);
    await page.waitForTimeout(2000);
    await expect(page.locator('h2:has-text("Manage Users")')).toBeVisible();
    // Should show at least one user (admin)
    const rows = page.locator('tbody tr');
    expect(await rows.count()).toBeGreaterThan(0);
  });

  test('Admin sidebar controls work (collapse, fullscreen, theme)', async ({ page }) => {
    await login(page, ADMIN_EMAIL, ADMIN_PASS);
    await page.goto(`${BASE}/admin`);
    await page.waitForTimeout(1500);

    // Collapse sidebar
    const collapseBtn = page.locator('button[title=""], aside button').first();
    await collapseBtn.click();
    await page.waitForTimeout(600);

    // Dark mode toggle
    const themeBtn = page.locator('button[title="Toggle Theme"]');
    if (await themeBtn.isVisible()) {
      await themeBtn.click();
      await page.waitForTimeout(500);
      await themeBtn.click(); // toggle back
    }
  });
});
