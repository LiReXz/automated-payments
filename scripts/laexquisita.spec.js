const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false
  });
  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();
  
  // Aumentar timeout y esperar a que la red esté inactiva
  await page.goto('https://laexquisitadenin.com/', { 
    waitUntil: 'networkidle',
    timeout: 60000 
  });
  await page.getByRole('link', { name: 'Permitir todas' }).click();
  await page.locator('div').filter({ hasText: 'Acceder Iniciar sesión' }).nth(3).click();
  await page.getByRole('textbox', { name: 'Dirección de correo electrónico', exact: true }).click();
  await page.getByRole('textbox', { name: 'Dirección de correo electrónico', exact: true }).fill(process.env.USER_EMAIL);
  await page.getByRole('textbox', { name: 'Contraseña' }).fill(process.env.USER_PASSWORD);
  await page.getByRole('button', { name: 'Conectarse' }).click();
  await page.goto('https://laexquisitadenin.com/');
  await page.getByRole('link', { name: ' Mi cuenta' }).click();
  await page.getByRole('link', { name: 'Cuenta virtual' }).click();
  await page.getByRole('link', { name: 'RECARGAR DINERO' }).click();
  await page.locator('#decimal_emoney').click();
  await page.locator('#decimal_emoney').fill('10');
  await page.getByRole('button', { name: ' Añadir dinero' }).click();
  await page.getByRole('link', { name: 'Añadir dinero' }).click();
  await page.getByRole('link', { name: 'Pasar por caja' }).click();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.getByText('Pago con Tarjeta').first().click();
  
  // Click en el label del checkbox de términos
  await page.locator('label.js-terms').click();


  // ---------------------
  await context.close();
  await browser.close();
})();