const { test, expect } = require('@playwright/test');

test('La Exquisita - Deposit Process', async ({ page }) => {
  test.setTimeout(180000); // 3 minutos para evitar timeout
  
  // Aumentar timeout y esperar a que la red esté inactiva
  await page.goto('https://laexquisitadenin.com/', { 
    waitUntil: 'networkidle',
    timeout: 60000 
  });
  await page.getByRole('link', { name: 'Permitir todas' }).click();
  await page.waitForTimeout(1000);
  
  await page.locator('div').filter({ hasText: 'Acceder Iniciar sesión' }).nth(3).click();
  await page.waitForTimeout(1000);
  
  await page.getByRole('textbox', { name: 'Dirección de correo electrónico', exact: true }).click();
  await page.getByRole('textbox', { name: 'Dirección de correo electrónico', exact: true }).fill(process.env.USER_EMAIL || '');
  await page.getByRole('textbox', { name: 'Contraseña' }).fill(process.env.USER_PASSWORD || '');
  await page.getByRole('button', { name: 'Conectarse' }).click();
  
  await page.getByRole('link', { name: ' Mi cuenta' }).click();
  await page.waitForTimeout(1000);
  
  await page.getByRole('link', { name: 'Cuenta virtual' }).click();
  await page.waitForLoadState('networkidle', { timeout: 60000 });
  
  await page.getByRole('link', { name: 'RECARGAR DINERO' }).click();
  await page.waitForTimeout(1000);
  
  await page.locator('#decimal_emoney').click();
  await page.locator('#decimal_emoney').fill('10');
  await page.getByRole('button', { name: ' Añadir dinero' }).click();
  await page.waitForTimeout(2000);
  
  await page.getByRole('link', { name: 'Añadir dinero' }).click();
  await page.waitForTimeout(1000);
  
  await page.getByRole('link', { name: 'Pasar por caja' }).click();
  await page.waitForLoadState('networkidle', { timeout: 60000 });
  
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.waitForTimeout(2000);
  
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.waitForLoadState('networkidle', { timeout: 60000 });
  
  await page.getByText('Pago con Tarjeta').first().click();
  await page.waitForTimeout(1000);
  
  // Click en el label del checkbox de términos
  await page.locator('label.js-terms').click();
  await page.waitForTimeout(1000);
  
  // Rellenar datos de tarjeta
  console.log('🔸 Rellenando datos de tarjeta...');
  await page.getByPlaceholder('Número de tarjeta').fill(process.env.CARD_NUMBER || '');
  await page.waitForTimeout(500);
  
  await page.getByPlaceholder('Caducidad').click();
  await page.getByPlaceholder('Caducidad').fill(process.env.CARD_EXPIRY || '');
  await page.waitForTimeout(500);
  
  await page.getByPlaceholder('CVV').click();
  await page.getByPlaceholder('CVV').fill(process.env.CARD_CVV || '');
  await page.waitForTimeout(500);
  
  console.log('🔸 Haciendo clic en botón Pagar...');
  await page.getByRole('button', { name: 'Pagar', exact: true }).click();
  
  // 🔹 Esperar resultado de la transacción (sin hacer fallar el test)
  console.log('⏳ Esperando resultado de la transacción...');
  await page.waitForTimeout(45000); // Dar 45 segundos para que cargue el resultado
  
  // Buscar texto de éxito o denegación
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
    await page.screenshot({ path: 'laexquisita-unknown-state.png', fullPage: true });
    const video = page.video();
    await page.waitForTimeout(3000);
    if (video) {
      await page.context().close();
      await video.saveAs('laexquisita-unknown-state.webm');
    }
  }
  
  // El test siempre pasa - el workflow analizará los logs para determinar el estado real
});
