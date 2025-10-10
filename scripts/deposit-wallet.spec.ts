import 'dotenv/config';
import { test, expect } from '@playwright/test';

test('Deposit funds in Casa Ortega virtual wallet', async ({ page }) => {
  test.setTimeout(180000); // 3 minutos para evitar timeout en CI

  // 1️⃣ Go to homepage
  await page.goto('https://casaortega.com/es/');

  // 2️⃣ Accept age confirmation
  await page.getByRole('button', { name: 'Soy mayor de edad y acepto' }).click();

  // 3️⃣ Navigate to login page
  await page.getByRole('link', { name: 'Acceda a su cuenta de cliente' }).click();

  // 4️⃣ Fill credentials
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

  const expiryField = page.getByPlaceholder('Caducidad');
  await expiryField.click();
  for (const char of process.env.CARD_EXPIRY!) {
    await expiryField.type(char, { delay: 100 }); // simula escritura humana
    await expiryField.dispatchEvent('input');
  }
  await expiryField.dispatchEvent('change');

  const cvvField = page.getByPlaceholder('CVV');
  await cvvField.fill(process.env.CARD_CVV!);
  await cvvField.dispatchEvent('input');
  await cvvField.dispatchEvent('change');

  // 🔹 Esperar que el botón Pagar esté habilitado (30s)
  const pagarButton = page.getByRole('button', { name: 'Pagar', exact: true });
  await expect(pagarButton).toBeEnabled({ timeout: 30000 });
  await pagarButton.click();

  // 🔹 Esperar resultado de la transacción
  const continuarLocator = page.getByRole('button', { name: 'Continuar' });
  const denegadaLocator = page.locator('text=Transacción denegada');

  await Promise.race([
    continuarLocator.waitFor({ state: 'visible', timeout: 30000 }),
    denegadaLocator.waitFor({ state: 'visible', timeout: 30000 })
  ]);

  if (await continuarLocator.isVisible()) {
    console.log('✅ Pago realizado correctamente, aparece "Continuar"');
    await page.waitForTimeout(5000);
    process.exit(0);
  } else if (await denegadaLocator.isVisible()) {
    console.log('❌ Pago denegado: aparece mensaje de transacción denegada');
    await page.waitForTimeout(5000);
    process.exit(1);
  } else {
    console.log('⚠️ No se detectó ni "Continuar" ni mensaje de error');
    await page.waitForTimeout(5000);
    process.exit(1);
  }
});
