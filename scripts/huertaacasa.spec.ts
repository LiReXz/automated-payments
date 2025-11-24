import { test, expect } from '@playwright/test';

test('Huerta a Casa - Deposit Process', async ({ page }) => {
  test.setTimeout(180000); // 3 minutos para evitar timeout
  
  // Login
  await page.goto('https://delahuertacasa.com/login/');
  await page.getByRole('button', { name: 'Aceptar todo' }).click();
  await page.getByRole('textbox', { name: 'Nombre de usuario o email' }).click();
  await page.getByRole('textbox', { name: 'Nombre de usuario o email' }).fill(process.env.USER_EMAIL || '');
  await page.getByRole('textbox', { name: 'Contraseña' }).click();
  await page.getByRole('textbox', { name: 'Contraseña' }).fill(process.env.USER_PASSWORD || '');
  await page.getByRole('button', { name: 'Acceder' }).click();
  
  // Depositar fondos
  await page.getByRole('spinbutton', { name: 'Depositar fondos' }).click();
  await page.getByRole('spinbutton', { name: 'Depositar fondos' }).fill('10');
  await page.getByText('Depositar fondos € Añadir').click();
  await page.getByRole('button', { name: 'Añadir fondos' }).click();
  
  // Realizar pedido
  await page.getByRole('checkbox', { name: 'He leído y acepto los té' }).check();
  await page.getByRole('button', { name: 'Realizar el pedido' }).click();
  
  // Rellenar datos de tarjeta
  await page.getByPlaceholder('Número de tarjeta').fill(process.env.CARD_NUMBER || '');
  await page.getByPlaceholder('Caducidad').click();
  await page.getByPlaceholder('Caducidad').fill(process.env.CARD_EXPIRY || '');
  await page.getByPlaceholder('CVV').click();
  await page.getByPlaceholder('CVV').fill(process.env.CARD_CVV || '');
  await page.getByRole('button', { name: 'Pagar', exact: true }).click();
  
  // 🔹 Esperar resultado de la transacción (sin hacer fallar el test)
  console.log('⏳ Esperando resultado de la transacción...');
  await page.waitForTimeout(30000); // Dar 30 segundos para que cargue el resultado
  
  // Buscar texto de éxito o denegación con getByRole estricto
  const successLocator = page.getByRole('heading', { name: /OPERACIÓN AUTORIZADA/i });
  const deniedLocator = page.getByRole('heading', { name: /Transacción denegada/i });
  
  const isSuccess = await successLocator.isVisible().catch(() => false);
  const isDenied = await deniedLocator.isVisible().catch(() => false);
  
  if (isSuccess) {
    console.log('STATUS:OK');
    await page.waitForTimeout(3000);
  } else if (isDenied) {
    console.log('STATUS:KO');
    await page.waitForTimeout(3000);
  } else {
    console.log('STATUS:UNKNOWN');
    await page.screenshot({ path: 'huertaacasa-unknown-state.png', fullPage: true });
    const video = page.video();
    await page.waitForTimeout(3000);
    if (video) {
      await page.context().close();
      await video.saveAs('huertaacasa-unknown-state.webm');
    }
  }
  
  // El test siempre pasa - el workflow analizará los logs para determinar el estado real
});
