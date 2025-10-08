import { test } from '@playwright/test';

test('Deposit funds in Casa Ortega virtual wallet', async ({ page }) => {
  // 1️⃣ Go to homepage
  await page.goto('https://casaortega.com/es/');

  // 2️⃣ Accept age confirmation
  await page.getByRole('button', { name: 'Soy mayor de edad y acepto' }).click();

  // 3️⃣ Navigate to login page
  await page.getByRole('link', { name: 'Acceda a su cuenta de cliente' }).click();

  // 4️⃣ Fill credentials from secrets
  await page.getByRole('textbox', { name: 'Dirección de correo electrónico', exact: true })
    .fill(process.env.USER_EMAIL!);

  await page.getByRole('textbox', { name: 'At least 5 characters long' })
    .fill(process.env.USER_PASSWORD!);

  // 5️⃣ Click login
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();

  // 6️⃣ Navigate to virtual wallet
  await page.getByRole('link', { name: 'Ver mi cuenta de cliente' }).click();
  await page.getByRole('link', { name: 'Monedero virtual' }).click();

  // 7️⃣ Enter deposit amount
  await page.getByRole('spinbutton', { name: 'Cantidad del depósito (mínimo' }).fill('10');

  // 8️⃣ Click "Deposit funds"
  await page.getByRole('button', { name: 'Depositar fondos en monedero' }).click();

  // 9️⃣ Fill payment form
  await page.getByPlaceholder('Número de tarjeta').fill(process.env.CARD_NUMBER!);
  await page.getByPlaceholder('Caducidad').fill(process.env.CARD_EXPIRY!);
  await page.getByPlaceholder('CVV').fill(process.env.CARD_CVV!);

  // 10️⃣ Submit payment
  await page.getByRole('button', { name: 'Pagar', exact: true }).click();

  // 11️⃣ Wait for confirmation page
  await page.waitForURL(/sis.redsys.es/);
});
