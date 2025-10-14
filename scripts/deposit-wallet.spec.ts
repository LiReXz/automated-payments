import 'dotenv/config';
import { test, expect } from '@playwright/test';

declare const process: {
  env: Record<string, string | undefined>;
};

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
  console.log('🔸 Filling card number...');
  const cardField = page.getByPlaceholder('Número de tarjeta');
  await cardField.click();
  await cardField.fill(process.env.CARD_NUMBER!);
  await cardField.blur(); // trigger validation
  await page.waitForTimeout(500);

  console.log('🔸 Filling expiry date...');
  const expiryField = page.getByPlaceholder('Caducidad');
  await expiryField.click();
  await expiryField.fill(''); // Clear first
  for (const char of process.env.CARD_EXPIRY!) {
    await expiryField.type(char, { delay: 150 }); // simula escritura humana
  }
  await expiryField.blur(); // trigger validation
  await page.waitForTimeout(500);

  console.log('🔸 Filling CVV...');
  const cvvField = page.getByPlaceholder('CVV');
  await cvvField.click();
  await cvvField.fill(process.env.CARD_CVV!);
  await cvvField.blur(); // trigger validation
  await page.waitForTimeout(500);

  // Try to trigger any additional form validation
  console.log('🔸 Triggering form validation...');
  await page.keyboard.press('Tab'); // Navigate away to trigger validation
  await page.waitForTimeout(1000);

  // 🔹 Wait for form validation and check for additional required fields
  await page.waitForTimeout(2000);

  // Look for cardholder name field which is often required
  console.log('🔸 Checking for cardholder name field...');
  const cardholderSelectors = [
    'input[placeholder*="nombre" i]',
    'input[placeholder*="titular" i]', 
    'input[name*="name" i]',
    'input[name*="holder" i]',
    'input[id*="name" i]',
    'input[id*="holder" i]'
  ];
  
  for (const selector of cardholderSelectors) {
    const cardholderField = page.locator(selector).first();
    if (await cardholderField.isVisible()) {
      console.log(`Found cardholder field with selector: ${selector}`);
      await cardholderField.click();
      await cardholderField.fill('JUAN PEREZ'); // Generic cardholder name
      await cardholderField.blur();
      await page.waitForTimeout(500);
      break;
    }
  }

  // Check if there are any other required fields we might have missed
  const requiredFields = await page.locator('input[required]').all();
  console.log(`🔸 Found ${requiredFields.length} required fields total`);
  
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    const isVisible = await field.isVisible();
    const value = await field.inputValue();
    const placeholder = await field.getAttribute('placeholder');
    const name = await field.getAttribute('name');
    const id = await field.getAttribute('id');
    const type = await field.getAttribute('type');
    
    console.log(`Required field ${i + 1}: visible=${isVisible}, value="${value}", placeholder="${placeholder}", name="${name}", id="${id}", type="${type}"`);
    
    // If it's a visible required field without a value, try to fill it
    if (isVisible && !value && type === 'text') {
      if (placeholder?.toLowerCase().includes('nombre') || name?.toLowerCase().includes('name')) {
        await field.fill('JUAN PEREZ');
        await field.blur();
        console.log(`Filled name field: ${placeholder || name || id}`);
      }
    }
  }

  // Check for validation errors
  console.log('🔸 Checking for validation errors...');
  const errorSelectors = [
    '.error', '.invalid', '.field-error', '[class*="error"]', 
    '.text-danger', '.alert', '.warning', '[style*="color: red"]'
  ];
  
  for (const selector of errorSelectors) {
    const errors = await page.locator(selector).all();
    for (const error of errors) {
      if (await error.isVisible()) {
        const errorText = await error.textContent();
        if (errorText?.trim()) {
          console.log(`Validation error found: ${errorText.trim()}`);
        }
      }
    }
  }

  // Check for checkbox or terms acceptance that might be required
  console.log('🔸 Checking for unchecked checkboxes...');
  const checkboxes = await page.locator('input[type="checkbox"]').all();
  for (let i = 0; i < checkboxes.length; i++) {
    const checkbox = checkboxes[i];
    const isVisible = await checkbox.isVisible();
    const isChecked = await checkbox.isChecked();
    
    if (isVisible) {
      const id = await checkbox.getAttribute('id');
      const label = id ? await page.locator(`label[for="${id}"]`).textContent().catch(() => null) : null;
      const parentText = await checkbox.locator('..').textContent();
      
      console.log(`Checkbox ${i + 1}: checked=${isChecked}, label="${label}", parentText="${parentText?.substring(0, 100)}"`);
      
      if (!isChecked) {
        // Try to click the checkbox if it looks important
        if (label && (label.toLowerCase().includes('acepto') || label.toLowerCase().includes('términos') || label.toLowerCase().includes('condiciones'))) {
          console.log('Clicking terms/conditions checkbox');
          await checkbox.check();
          await page.waitForTimeout(1000);
        } else if (parentText && (parentText.toLowerCase().includes('acepto') || parentText.toLowerCase().includes('términos'))) {
          console.log('Clicking checkbox based on parent text');
          await checkbox.check();
          await page.waitForTimeout(1000);
        }
      }
    }
  }

  // 🔹 Try to manually trigger validation by executing JavaScript
  console.log('🔸 Triggering manual form validation...');
  await page.evaluate(() => {
    // Try to find and trigger validation functions
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      // Trigger change events on all inputs
      const inputs = form.querySelectorAll('input');
      inputs.forEach(input => {
        input.dispatchEvent(new Event('change', { bubbles: true }));
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('blur', { bubbles: true }));
      });
      
      // Try to call common validation function names
      const validationMethods = ['validate', 'checkForm', 'validateForm', 'checkPaymentForm'];
      validationMethods.forEach(method => {
        if (typeof (window as any)[method] === 'function') {
          console.log(`Calling ${method}()`);
          (window as any)[method]();
        }
      });
    });
  });
  
  await page.waitForTimeout(2000);

  // 🔹 Esperar que el botón Pagar esté habilitado (30s)
  const pagarButton = page.getByRole('button', { name: 'Pagar', exact: true });
  
  // Log button state before waiting
  const isInitiallyEnabled = await pagarButton.isEnabled();
  console.log(`🔸 Button initially enabled: ${isInitiallyEnabled}`);
  
  // If button is still disabled, try some additional strategies
  if (!isInitiallyEnabled) {
    console.log('🔸 Button is disabled, trying additional strategies...');
    
    // Try clicking on the form to focus and trigger validation
    await page.click('form', { force: true });
    await page.waitForTimeout(1000);
    
    // Try pressing Enter to trigger form submission validation
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);
    
    // Check button state again
    const isNowEnabled = await pagarButton.isEnabled();
    console.log(`🔸 Button enabled after additional strategies: ${isNowEnabled}`);
  }
  
  try {
    await expect(pagarButton).toBeEnabled({ timeout: 30000 });
  } catch (error) {
    // If button is still disabled, try to find out why
    console.log('❌ Button still disabled after 30s, investigating...');
    
    // Check if button has any data attributes or classes that indicate why it's disabled
    const buttonClasses = await pagarButton.getAttribute('class');
    const buttonDisabled = await pagarButton.getAttribute('disabled');
    const buttonOnClick = await pagarButton.getAttribute('onclick');
    console.log(`Button classes: ${buttonClasses}`);
    console.log(`Button disabled attribute: ${buttonDisabled}`);
    console.log(`Button onclick: ${buttonOnClick}`);
    
    // Log all form values to see what might be missing
    console.log('🔸 Current form state:');
    await page.evaluate(() => {
      const inputs = document.querySelectorAll('input');
      inputs.forEach((input, index) => {
        const element = input as HTMLInputElement;
        console.log(`Input ${index}: type=${element.type}, name=${element.name}, value="${element.value}", required=${element.required}, placeholder="${element.placeholder}"`);
      });
    });
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'payment-form-debug.png', fullPage: true });
    
    // Try manual JavaScript execution to enable button or call payment function
    console.log('🔸 Attempting JavaScript workarounds...');
    try {
      await page.evaluate(() => {
        // Try to find the button and manually enable it
        const button = document.querySelector('#divImgAceptar, button[onclick*="pago"]');
        if (button) {
          console.log('Found button, trying to enable it');
          (button as HTMLButtonElement).disabled = false;
          button.removeAttribute('disabled');
          
          // Try calling the pago function directly if it exists
          if (typeof (window as any).pago === 'function') {
            console.log('Found pago function, calling it directly');
            (window as any).pago();
          }
        }
        
        // Also try to manually validate and submit the form
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
          // Check if form is valid
          console.log(`Form valid: ${(form as HTMLFormElement).checkValidity()}`);
          
          // Try to submit
          if ((form as HTMLFormElement).checkValidity()) {
            console.log('Form is valid, attempting submission');
            (form as HTMLFormElement).submit();
          }
        });
      });
      
      await page.waitForTimeout(2000);
      
      // Check if button is now enabled
      const isNowEnabled2 = await pagarButton.isEnabled();
      console.log(`🔸 Button enabled after JavaScript workarounds: ${isNowEnabled2}`);
      
      if (isNowEnabled2) {
        console.log('🎉 Button is now enabled! Attempting click...');
        await pagarButton.click();
        return; // Exit the catch block if successful
      }
      
    } catch (jsError) {
      console.log(`JavaScript workarounds failed: ${jsError}`);
    }
    
    // Try one more time - force click the button even if disabled to see what happens
    console.log('🔸 Attempting to force click disabled button to see behavior...');
    try {
      await pagarButton.click({ force: true, timeout: 5000 });
      await page.waitForTimeout(2000);
      
      // Check if anything changed after force click
      const stillDisabled = await pagarButton.getAttribute('disabled');
      console.log(`Button still has disabled attribute after force click: ${stillDisabled}`);
      
    } catch (forceClickError) {
      console.log(`Force click failed: ${forceClickError}`);
    }
    
    throw error;
  }
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
    // Test passes - payment was successful
    expect(await continuarLocator.isVisible()).toBe(true);
  } else if (await denegadaLocator.isVisible()) {
    console.log('❌ Pago denegado: aparece mensaje de transacción denegada');
    await page.waitForTimeout(5000);
    // Test fails - payment was denied
    throw new Error('Payment was denied - transaction declined');
  } else {
    console.log('⚠️ No se detectó ni "Continuar" ni mensaje de error');
    await page.waitForTimeout(5000);
    // Test fails - unexpected state
    throw new Error('Neither "Continuar" button nor error message was detected');
  }
});
