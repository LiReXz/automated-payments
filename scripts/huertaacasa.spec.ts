import { test, expect } from '@playwright/test';

test('Huerta a Casa - Deposit Process', async ({ page }) => {
  // Login
  await page.goto('https://delahuertacasa.com/login/');
  await page.getByRole('textbox', { name: 'Nombre de usuario o email' }).click();
  await page.getByRole('textbox', { name: 'Nombre de usuario o email' }).fill(process.env.USER_EMAIL || '');
  await page.getByRole('textbox', { name: 'Contraseña' }).click();
  await page.getByRole('textbox', { name: 'Contraseña' }).fill(process.env.USER_PASSWORD || '');
  await page.getByRole('button', { name: 'Acceder' }).click();
  
  // Depositar fondos
  await page.getByRole('spinbutton', { name: 'Depositar fondos' }).click();
  await page.getByRole('spinbutton', { name: 'Depositar fondos' }).fill('10');
  await page.getByRole('button', { name: 'Añadir fondos' }).click();
  
  // Realizar pedido
  await page.getByRole('checkbox', { name: 'He leído y acepto los té' }).check();
  await page.getByRole('button', { name: 'Realizar el pedido' }).click();
  
  // Rellenar datos de tarjeta
  await page.getByPlaceholder('Número de tarjeta').fill(process.env.CARD_NUMBER || '');
  await page.getByPlaceholder('Caducidad').fill(process.env.CARD_EXPIRY || '');
  await page.getByPlaceholder('CVV').fill(process.env.CARD_CVV || '');
  await page.getByRole('button', { name: 'Pagar', exact: true }).click();
  
  // Esperar resultado (máximo 30 segundos)
  await page.waitForTimeout(5000);
  
  // Verificar resultado - buscar el heading que indica éxito o denegación
  const successHeading = page.getByRole('heading', { name: /OPERACIÓN AUTORIZADA CON CÓDIGO:/i });
  const deniedHeading = page.getByRole('heading', { name: 'Transacción denegada.' });
  
  try {
    // Intentar verificar si es éxito
    await expect(successHeading.or(deniedHeading)).toBeVisible({ timeout: 30000 });
    console.log('Transaction completed - check heading for status');
  } catch (error) {
    console.error('Could not determine transaction status');
    throw error;
  }
});
