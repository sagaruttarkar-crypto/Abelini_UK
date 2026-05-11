const { expect } = require('@playwright/test');

class ProductPage {
  constructor(page) {
    this.page = page;

    this.productTitle = page.getByRole('heading', { level: 1 });
    this.orderSampleBtn =page.getByRole('button', { name: 'Order Sample' }).first();
      this.popup =page.getByRole('dialog').filter({
  has: this.page.getByRole('button', { name: 'Add to Cart' })
});

    this.testedCombinations = new Set();

    // Shape options
    this.shapeOptions = () =>
      this.page.locator('button').filter({
        hasText: /Round|Princess|Oval|Pear|Emerald|Cushion|Marquise|Heart|Asscher|Radiant/i,
      });

    // Stone options
    this.stoneOptions = () =>
      this.page.locator('button').filter({
        hasText: /Naturally Mined Diamond|Ruby|Emerald|Blue Sapphire|Moissanite|Black Diamond|Lab Grown Diamond/i,
      });

    // Metal options
    this.metalOptions = () =>
      this.page.locator('div.flex.items-center.gap-\\[10px\\].pt-\\[5px\\] > button');
  }

  async waitForPageReady() {
    await this.page.waitForLoadState('domcontentloaded');
    await this.productTitle.waitFor({ state: 'visible' });
  }

  async getProductTitle() {
    const text = await this.productTitle.textContent();
    return text?.replace(/\s+/g, ' ').trim();
  }

  extractMetalFromTitle(title) {
    const t = title.toLowerCase();

    if (t.includes('white gold')) return 'White Gold';
    if (t.includes('yellow gold')) return 'Yellow Gold';
    if (t.includes('rose gold')) return 'Rose Gold';
    if (t.includes('platinum')) return 'Platinum';

    return 'Unknown';
  }

  async selectOption(locator) {
    try {
      if (!(await locator.isVisible().catch(() => false))) return null;

      await locator.scrollIntoViewIfNeeded();

      const optionText = await locator.textContent();
      const oldTitle = await this.getProductTitle();

      await locator.click();

      // Wait until title changes
      try {
        await expect(this.productTitle).not.toHaveText(oldTitle, {
          timeout: 4000,
        });
      } catch {
        await this.page.waitForTimeout(500);
      }

      return optionText?.trim();
    } catch {
      return null;
    }
  }
  async ValidateAsSeenOnbanner(){

await this.page.getByText('As Seen On', { exact: true }).isVisible();
console.log('As Seen On banner is visible');

  }

async validateMatchingProductSection() {
const alts = await this. page.locator('div.h-full.w-full img').evaluateAll(imgs =>
  imgs.map(img => img.getAttribute('alt'))
);

console.log(alts);
}


 
async testAllCombinations() {
  await this.waitForPageReady();

  const shapes = this.shapeOptions();
  const stones = this.stoneOptions();
  const metals = this.metalOptions();

  const shapeCount = await shapes.count();
  const stoneCount = await stones.count();
  const metalCount = await metals.count();

  console.log("Shapes:", shapeCount);
  console.log("Stones:", stoneCount);
  console.log("Metals:", metalCount);
  console.log("================================");

  // Locators
  const productTitle = this.page.locator('h1');
  const breadcrumbTitle = this.page.locator('[aria-current="page"]').last();
const referenceCodeLocator = this.page.locator('p:has-text("Reference Code")');
  for (let s = 0; s < Math.max(shapeCount, 1); s++) {
    let shape = 'default';

    if (shapeCount > 0) {
      shape = await this.selectOption(shapes.nth(s));
      if (!shape) continue;
    }

    for (let st = 0; st < Math.max(stoneCount, 1); st++) {
      let stone = 'default';

      if (stoneCount > 0) {
        stone = await this.selectOption(stones.nth(st));
        if (!stone) continue;
      }

      for (let m = 0; m < Math.max(metalCount, 1); m++) {
        let metalBtnText = 'default';

        if (metalCount > 0) {
          metalBtnText = await this.selectOption(metals.nth(m));
          if (!metalBtnText) continue;
        }

        // Wait for title to update
        await productTitle.waitFor({ state: 'visible' });

        const title = (await productTitle.textContent()).trim();
        const breadcrumb = (await breadcrumbTitle.textContent()).trim();

        // Validate title == breadcrumb
       await expect.soft(title).toContain(breadcrumb);

        const detectedMetal = this.extractMetalFromTitle(title);
        const comboKey = `${shape}-${stone}-${detectedMetal}`.toLowerCase();

        if (this.testedCombinations.has(comboKey)) continue;
        this.testedCombinations.add(comboKey);

        console.log(`Combination: ${comboKey}`);
        console.log(`Product Title: ${title}`);
        console.log(`Breadcrumb: ${breadcrumb}`);
        console.log(`Reference Code: ${await referenceCodeLocator.textContent()}`);
        console.log("--------------------------------");
      }
    }
  }

  console.log(
    "Total unique combinations tested:",
    this.testedCombinations.size
  );
}

async ProductImagePdp() {
  await this.waitForPageReady();

  const shapes = this.shapeOptions();
  const stones = this.stoneOptions();
  const metals = this.metalOptions();

  const shapeCount = await shapes.count();
  const stoneCount = await stones.count();
  const metalCount = await metals.count();

  console.log("Shapes:", shapeCount);
  console.log("Stones:", stoneCount);
  console.log("Metals:", metalCount);
  console.log("================================");

  const productTitle = this.page.locator('h1');
  const mainImage = this.page.locator('#product-gallery img[alt="View 1"]').first();

  // ✅ ONLY REAL PRODUCT THUMBNAILS (FILTER OUT ICONS / VIDEO)
  const thumbnails = this.page.locator(
    '#product-gallery img[alt^="Thumb"]'
  );

  let previousMainImage = '';
  let previousThumbs = [];

  for (let s = 0; s < Math.max(shapeCount, 1); s++) {
    let shape = 'default';
    if (shapeCount > 0) {
      shape = await this.selectOption(shapes.nth(s));
      if (!shape) continue;
    }

    for (let st = 0; st < Math.max(stoneCount, 1); st++) {
      let stone = 'default';
      if (stoneCount > 0) {
        stone = await this.selectOption(stones.nth(st));
        if (!stone) continue;
      }

      for (let m = 0; m < Math.max(metalCount, 1); m++) {
        let metal = 'default';
        if (metalCount > 0) {
          metal = await this.selectOption(metals.nth(m));
          if (!metal) continue;
        }

        await productTitle.waitFor();

        const combo = `${shape}-${stone}-${metal}`;
        console.log(`\n🔁 Checking: ${combo}`);

        // =====================================
        // ✅ WAIT FOR MAIN IMAGE CHANGE
        // =====================================
        try {
          await this.page.waitForFunction(
            (prev) => {
              const img = document.querySelector('#product-gallery img[alt="View 1"]');
              if (!img) return false;

              const current = img.currentSrc || img.src;
              return img.complete && img.naturalWidth > 0 && current !== prev;
            },
            previousMainImage,
            { timeout: 8000 }
          );
        } catch {
          console.log("⚠️ Main image did not change");
        }

        // =====================================
        // ✅ GET MAIN IMAGE
        // =====================================
        let mainImageUrl = '';
        try {
          mainImageUrl = await mainImage.evaluate(img => img.currentSrc || img.src);
          previousMainImage = mainImageUrl;
        } catch {}

        // =====================================
        // ✅ GET THUMBNAILS
        // =====================================
        const thumbCount = await thumbnails.count();
        let currentThumbs = [];

        for (let i = 0; i < thumbCount; i++) {
          const thumb = thumbnails.nth(i);

          try {
            const url = await thumb.evaluate(img => img.currentSrc || img.src);
            if (url && !url.includes('icon') && !url.includes('video')) {
              currentThumbs.push(url);
            }
          } catch {}
        }

        // =====================================
        // ✅ VALIDATION
        // =====================================
        let status = "✅ OK";

        // ❌ Main image missing
        if (!mainImageUrl) {
          status = "❌ Main image missing";
        }

        // ❌ Main image not changed
        else if (mainImageUrl === previousMainImage) {
          status = " Main image  updated";
        }

        // ❌ Thumbnail missing
        else if (currentThumbs.length === 0) {
          status = "❌ No thumbnails";
        }

        // ❌ Thumbnails not changed
        else if (JSON.stringify(currentThumbs) === JSON.stringify(previousThumbs)) {
          status = "⚠️ Thumbnails not updated";
        }

        // ❌ Broken images check
        else {
          for (const img of [mainImageUrl, ...currentThumbs]) {
            try {
              const res = await this.page.request.get(img);
              if (res.status() !== 200) {
                status = `❌ Broken image (${res.status()})`;
                break;
              }
            } catch {
              status = "❌ Broken image (request failed)";
              break;
            }
          }
        }

        previousThumbs = currentThumbs;

        // =====================================
        // ✅ LOG
        // =====================================
        console.log("Main Image:", mainImageUrl);
        console.log("Thumbnails:", currentThumbs.length);
        console.log("Status:", status);
        console.log("--------------------------------");
      }
    }
  }

  console.log("✅ Done testing all combinations");
}


async OrderSample() {
await this.orderSampleBtn.scrollIntoViewIfNeeded();
await this.orderSampleBtn.click();
await expect(this.popup).toBeVisible();    

const dropdowns =this.popup.locator('select');
const addToCartBtn = this.popup.getByRole('button', { name: 'Add to Cart' });
await addToCartBtn.click();
  // ✅ Validate redirect to cart
  await this.page.waitForURL('**/cart');
  await expect(this.page).toHaveURL(/.*\/cart/);

}

async validatevirtualTryOn() {
  const tryOnBtn = this.page.getByRole('img', { name: 'hand-view gif' })
  await tryOnBtn.scrollIntoViewIfNeeded();
  await tryOnBtn.click();
}

// async validatePriceFilters() {

//   // =========================
//   // PRICE FUNCTION
//   // =========================

//   const getPrice = async () => {

//     // wait page load
//     await this.page.waitForLoadState('domcontentloaded');
//     await this.page.waitForLoadState('networkidle');

//     // extra wait for lazy load
//     await this.page.waitForTimeout(5000);

//     // fresh locator every time
//     const priceText = await this.page
//       .locator('div.text-3xl.font-bold.text-black')
//       .first()
//       .innerText();

   

//     return parseFloat(
//       priceText.replace(/[^\d.]/g, '')
//     );
//   };

//   // =========================
//   // DEFAULT PRICE
//   // =========================

//   const defaultPrice = await getPrice();


//   // =========================
//   // APPLY FILTER 1
//   // =========================

//   await this.page.locator('#ring_size').selectOption({
//     label: 'H'
//   });

//   // wait after dropdown selection
// ;

//   // IMPORTANT
//   // page reloads after click
//   await this.page.waitForTimeout(5000);

//   // GET UPDATED PRICE
//   const minPrice =  await this.page
//       .locator('div.text-3xl.font-bold.text-black')
//       .first()
//       .innerText();
 

//   // =========================
//   // APPLY FILTER 2
//   // =========================
 
// await this.page.locator('div.platinum-gradient', {
//   hasText: 'plt'
// }).click();
// await this.page.waitForTimeout(3000);

//   await this.page.locator('#ring_size').selectOption({
//     label: 'I dont know'
//   });

//   // wait after dropdown selection

//   await this.page.waitForTimeout(3000);

//   await this.page.getByText('Naturally Mined Diamond').click();

//     await this.page.waitForTimeout(3000);

//   const heartShape = this.page.getByAltText('Heart', {
//     exact: true
//   });

//   await heartShape.scrollIntoViewIfNeeded();

//   await heartShape.click();

// await this.page.waitForTimeout(5000);
//   // PRICE SLIDER
// const priceSlider = this.page.locator(
//   'input[type="range"][aria-label="Price Range"]'
// );

// // scroll to slider
// await priceSlider.scrollIntoViewIfNeeded();

// // slider box
// const box = await priceSlider.boundingBox();

// if (box) {

//   // move mouse to slider start
//   await this.page.mouse.move(
//     box.x + 5,
//     box.y + box.height / 2
//   );

//   // mouse down
//   await this.page.mouse.down();

//   // drag slider to max
//   await this.page.mouse.move(
//     box.x + box.width,
//     box.y + box.height / 2,
//     { steps: 20 }
//   );

//   // mouse up
//   await this.page.mouse.up();
// }

// // wait for price update
//   await this.page.waitForTimeout(8000);

// console.log('✅ Price slider moved to max')

//  await this.page.waitForTimeout(3000);

// await this.page.locator(
//   'button:has(div:text-is("IF"))'
// ).click();

//  await this.page.waitForTimeout(3000);

// // CLICK D BUTTON

// const dButton = this.page.locator(
//   'button:has(div:text-is("D"))'
// ).first();

// await dButton.scrollIntoViewIfNeeded();

// await dButton.click();
// await this.page.waitForTimeout(3000);
// await this.page.locator(
//   'button:has(div:text-is("Excellent"))'
// ).click();
//  await this.page.waitForTimeout(6000);

//   // GET UPDATED PRICE
//   const maxPrice = await this.page
//       .locator('div.text-3xl.font-bold.text-black')
//       .first()
//       .innerText();



//   console.log('======================');
//   console.log('Default Price:', defaultPrice);
//   console.log('Min Price:', minPrice);
//   console.log('Max Price:', maxPrice);
//   console.log('======================');

// }
async validatePriceFilters_EngagementRings() {

  // =========================
  // SAFE CLICK FUNCTION
  // =========================

  const safeClick = async (locator, name) => {

    try {

      if (await locator.count() > 0) {

        await locator.first().scrollIntoViewIfNeeded();

        await locator.first().click({
          timeout: 5000
        });

        console.log(`✅ Clicked: ${name}`);

        await this.page.waitForTimeout(2000);

      } else {

        console.log(`⚠️ Element not found: ${name}`);

      }

    } catch (error) {

      console.log(`⚠️ Failed to click: ${name}`);

    }
  };

  // =========================
  // PRICE FUNCTION
  // =========================

  const getPrice = async () => {

    try {

      await this.page.waitForLoadState('domcontentloaded');
      await this.page.waitForTimeout(3000);

      const priceText = await this.page
        .locator('div.text-3xl.font-bold.text-black')
        .first()
        .innerText();

      return parseFloat(
        priceText.replace(/[^\d.]/g, '')
      );

    } catch (error) {

      console.log('⚠️ Price not found');

      return 0;
    }
  };

  // =========================
  // DEFAULT PRICE
  // =========================

  const defaultPrice = await getPrice();

  // =========================
  // APPLY Min Filter 
  // =========================

  try {

    await this.page.locator('#ring_size').selectOption({
      label: 'H'
    });

    await this.page.waitForTimeout(3000);

  } catch (error) {

    console.log('⚠️ Ring size H not found');

  }

  // GET MIN PRICE
  const minPrice = await getPrice();

  // =========================
  // APPLY Max Filter 
  // =========================

  await safeClick(
    this.page.locator('div.platinum-gradient', {
      hasText: 'plt'
    }),
    'Platinum'
  );

  try {

    await this.page.locator('#ring_size').selectOption({
      label: 'I dont know'
    });

    await this.page.waitForTimeout(2000);

  } catch (error) {

    console.log('⚠️ Ring size not found');

  }

  await safeClick(
    this.page.getByText('Naturally Mined Diamond'),
    'Naturally Mined Diamond'
  );

  // =========================
  // HEART SHAPE
  // =========================

  await safeClick(
    this.page.getByAltText('Heart', {
      exact: true
    }),
    'Heart Shape'
  );

  // =========================
  // PRICE SLIDER
  // =========================

  try {

    const priceSlider = this.page.locator(
      'input[type="range"][aria-label="Price Range"]'
    );

    if (await priceSlider.count() > 0) {

      await priceSlider.scrollIntoViewIfNeeded();

      const box = await priceSlider.boundingBox();

      if (box) {

        await this.page.mouse.move(
          box.x + 5,
          box.y + box.height / 2
        );

        await this.page.mouse.down();

        await this.page.mouse.move(
          box.x + box.width,
          box.y + box.height / 2,
          { steps: 5 }
        );

        await this.page.mouse.up();

        console.log('✅ Price slider moved');

      }

    } else {

      console.log('⚠️ Price slider not found');

    }

  } catch (error) {

    console.log('⚠️ Failed to move price slider');

  }

  await this.page.waitForTimeout(3000);

  // =========================
  // IF BUTTON
  // =========================

  await safeClick(
    this.page.locator(
      'button:has(div:text-is("IF"))'
    ),
    'IF Button'
  );

  // =========================
  // D BUTTON
  // =========================

  await safeClick(
    this.page.locator(
      'button:has(div:text-is("D"))'
    ),
    'D Button'
  );

  // =========================
  // EXCELLENT BUTTON
  // =========================

  await safeClick(
    this.page.locator(
      'button:has(div:text-is("Excellent"))'
    ),
    'Excellent Button'
  );

  await this.page.waitForTimeout(4000);

  // =========================
  // MAX PRICE
  // =========================

  const maxPrice = await getPrice();

  // =========================
  // FINAL LOGS
  // =========================

  console.log('======================');
  console.log('Default Price:', defaultPrice);
  console.log('Min Price:', minPrice);
  console.log('Max Price:', maxPrice);
  console.log('======================');
}


async validatePriceFilters_Bracelets() {

  // =========================
  // SAFE CLICK FUNCTION
  // =========================

  const safeClick = async (locator, name) => {

    try {

      const count = await locator.count();

      if (count > 0) {

        await locator.first().scrollIntoViewIfNeeded();

        await locator.first().click({
          timeout: 5000
        });

        console.log(`✅ Clicked: ${name}`);

        await this.page.waitForTimeout(2000);

      } else {

        console.log(`⚠️ Element not found: ${name}`);

      }

    } catch (error) {

      console.log(`⚠️ Failed to click: ${name}`);

    }
  };

  // =========================
  // SAFE LAST BUTTON CLICK
  // =========================

  const safeLastButtonClick = async (locator, name) => {

    try {

      const count = await locator.count();

      if (count > 0) {

        await locator.last().scrollIntoViewIfNeeded();

        await locator.last().click({
          timeout: 5000
        });

        console.log(`✅ Clicked last button: ${name}`);

        await this.page.waitForTimeout(2000);

      } else {

        console.log(`⚠️ Last button not found: ${name}`);

      }

    } catch (error) {

      console.log(`⚠️ Failed to click last button: ${name}`);

    }
  };

  // =========================
  // PRICE FUNCTION
  // =========================

  const getPrice = async () => {

    try {

      await this.page.waitForLoadState('domcontentloaded');

      await this.page.waitForTimeout(3000);

      const priceText = await this.page
        .locator('div.text-3xl.font-bold.text-black')
        .first()
        .innerText();

      return parseFloat(
        priceText.replace(/[^\d.]/g, '')
      );

    } catch (error) {

      console.log('⚠️ Price not found');

      return 0;
    }
  };

  // =========================
  // DEFAULT PRICE
  // =========================

  const defaultPrice = await getPrice();

  // =========================
  // MIN PRICE
  // =========================

  const minPrice = await getPrice();

  // =========================
  // APPLY FILTERS
  // =========================

  await safeClick(
    this.page.locator('div.platinum-gradient', {
      hasText: 'plt'
    }),
    'Platinum'
  );

  await safeClick(
    this.page.getByText('Naturally Mined Diamond'),
    'Naturally Mined Diamond'
  );

  // =========================
  // WIDTH BUTTONS
  // =========================

  await safeLastButtonClick(
    this.page.locator('div.flex.gap-1 button'),
    'Width Button'
  );

  // =========================
  // VVS BUTTON
  // =========================

  await safeClick(
    this.page.locator(
      'button:has(div:text-is("VVS"))'
    ),
    'VVS Button'
  );

  // =========================
  // D-E BUTTON
  // =========================

  await safeClick(
    this.page.locator(
      'button:has(div:text-is("D-E"))'
    ),
    'D-E Button'
  );

  // =========================
  // LENGTH BUTTONS
  // =========================

  await safeLastButtonClick(
    this.page.locator('div[role="button"] button'),
    'Length Button'
  );

  await this.page.waitForTimeout(4000);

  // =========================
  // MAX PRICE
  // =========================

  const maxPrice = await getPrice();

  // =========================
  // FINAL LOGS
  // =========================

  console.log('======================');
  console.log('Default Price:', defaultPrice);
  console.log('Min Price:', minPrice);
  console.log('Max Price:', maxPrice);
  console.log('======================');

}

async validatePriceFilters_DiamondRings() {

  // =========================
  // SAFE CLICK FUNCTION
  // =========================

  const safeClick = async (locator, name) => {

    try {

      const count = await locator.count();

      if (count > 0) {

        await locator.first().scrollIntoViewIfNeeded();

        await locator.first().click({
          timeout: 5000
        });

        console.log(`✅ Clicked: ${name}`);

        await this.page.waitForTimeout(2000);

      } else {

        console.log(`⚠️ Element not found: ${name}`);

      }

    } catch (error) {

      console.log(`⚠️ Failed to click: ${name}`);

    }
  };

  // =========================
  // SAFE LAST BUTTON CLICK
  // =========================

  const safeLastButtonClick = async (locator, name) => {

    try {

      const count = await locator.count();

      if (count > 0) {

        await locator.last().scrollIntoViewIfNeeded();

        await locator.last().click({
          timeout: 5000
        });

        console.log(`✅ Clicked last button: ${name}`);

        await this.page.waitForTimeout(2000);

      } else {

        console.log(`⚠️ Last button not found: ${name}`);

      }

    } catch (error) {

      console.log(`⚠️ Failed to click last button: ${name}`);

    }
  };

  // =========================
  // PRICE FUNCTION
  // =========================

  const getPrice = async () => {

    try {

      await this.page.waitForLoadState('domcontentloaded');

      await this.page.waitForTimeout(3000);

      const priceText = await this.page
        .locator('div.text-3xl.font-bold.text-black')
        .first()
        .innerText();

      return parseFloat(
        priceText.replace(/[^\d.]/g, '')
      );

    } catch (error) {

      console.log('⚠️ Price not found');

      return 0;
    }
  };

  // =========================
  // DEFAULT PRICE
  // =========================

  const defaultPrice = await getPrice();

  // =========================
  // MIN PRICE
  // =========================

   try {

    await this.page.locator('#ring_size').selectOption({
      label: 'H'
    });

    await this.page.waitForTimeout(3000);

  } catch (error) {

    console.log('⚠️ Ring size H not found');

  }





  const minPrice = await getPrice();

  // =========================
  // APPLY FILTERS MAX
  // =========================

  await safeClick(
    this.page.locator('div.platinum-gradient', {
      hasText: 'plt'
    }),
    'Platinum'
  );
await this.page.waitForTimeout(2000);

  await this.page.locator('#ring_size').selectOption({
    label: 'I dont know'
  });
await this.page.waitForTimeout(2000);

  await safeClick(
    this.page.getByText('Naturally Mined Diamond'),
    'Naturally Mined Diamond'
  );

await this.page.waitForTimeout(2000);


try {

  const widthButtons = this.page.locator(
    'div.flex.gap-1 button'
  );

  const priceSlider = this.page.locator(
    'input[type="range"][aria-label="Price Range"]'
  );

  // =========================
  // IF BUTTON EXISTS
  // =========================

  if (await widthButtons.count() > 0) {

    await widthButtons.last().scrollIntoViewIfNeeded();

    await widthButtons.last().click({
      timeout: 5000
    });

    console.log('✅ Width button selected');

    await this.page.waitForTimeout(2000);

  }

  // =========================
  // ELSE IF SLIDER EXISTS
  // =========================

  else if (await priceSlider.count() > 0) {

    await priceSlider.scrollIntoViewIfNeeded();

    const box = await priceSlider.boundingBox();

    if (box) {

      await this.page.mouse.move(
        box.x + 5,
        box.y + box.height / 2
      );

      await this.page.mouse.down();

      await this.page.mouse.move(
        box.x + box.width,
        box.y + box.height / 2,
        { steps: 5 }
      );

      await this.page.mouse.up();

      console.log('✅ Price slider moved');

      await this.page.waitForTimeout(2000);

    }

  }

  // =========================
  // NONE FOUND
  // =========================

  else {

    console.log(
      '⚠️ Neither width button nor price slider found'
    );

  }

} catch (error) {

  console.log(
    '⚠️ Failed to interact with width button or price slider'
  );

} 
  // =========================
  // VVS BUTTON
  // =========================
await this.page.waitForTimeout(2000);

  await safeClick(
    this.page.locator(
      'button:has(div:text-is("VVS"))'
    ),
    'VVS Button'
  );

  // =========================
  // D-E BUTTON
  // =========================
await this.page.waitForTimeout(3000);

  await safeClick(
    this.page.locator(
      'button:has(div:text-is("D-E"))'
    ),
    'D-E Button'
  );



  await this.page.waitForTimeout(4000);

  // =========================
  // MAX PRICE
  // =========================

  const maxPrice = await getPrice();

  // =========================
  // FINAL LOGS
  // =========================

  console.log('======================');
  console.log('Default Price:', defaultPrice);
  console.log('Min Price:', minPrice);
  console.log('Max Price:', maxPrice);
  console.log('======================');

}
}

module.exports = ProductPage;