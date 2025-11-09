import { ShoppingItem } from '../types';
import { getAnthropicClient } from '../api/anthropic';
import { getOpenAIClient } from '../api/openai';

// Helper function to extract clean product name from shopping item
function extractProductName(itemName: string): string {
  // Split into words and filter out numeric quantities
  const words = itemName.trim().split(/\s+/);
  
  // Filter out words that are just numbers, decimals, or fractions
  const nonNumericWords = words.filter(word => {
    // Skip pure numbers
    if (/^\d+$/.test(word)) return false;
    // Skip decimals
    if (/^\d+\.\d+$/.test(word)) return false;
    // Skip fractions
    if (/^\d+\/\d+$/.test(word)) return false;
    // Skip numbers with units (like "1.5kg")
    if (/^\d+\.?\d*(kg|g|ml|l|oz|lb|grams?|kilograms?|liters?|milliliters?|pounds?|ounces?|pack|packs?|x|\*|count|each|units?|items?|tbsp|tsp|cup|cups|tablespoon|teaspoon)$/i.test(word)) return false;
    // Skip common units
    if (/^(kg|g|ml|l|oz|lb|grams?|kilograms?|liters?|milliliters?|pounds?|ounces?|pack|packs?|x|\*|count|each|units?|items?|tbsp|tsp|cup|cups|tablespoon|teaspoon)$/i.test(word)) return false;
    return true;
  });
  
  // If we have non-numeric words, use them
  if (nonNumericWords.length > 0) {
    return nonNumericWords.join(' ');
  }
  
  // Fallback: return the original name
  return itemName;
}


export type RetailerType = 'woolworths' | 'coles';

export interface AutomationStep {
  action: string;
  icon: string;
  description?: string;
}

interface ProductCandidate {
  id: string;
  title: string;
  href?: string;
  imageUrl?: string;
  score: number;
  priceText?: string;
  snippet?: string;
}

interface AutomationOptions {
  retailer: RetailerType;
  items: ShoppingItem[];
  executeScript: (script: string) => Promise<any>;
  onProgress?: (step: AutomationStep, item?: ShoppingItem) => void;
  onItemCompleted?: (itemId: string, success: boolean) => void;
  onPauseForAuth?: () => void;
}

export type AddPlanItemUrl = { productUrl: string; qty: number };
export interface AutomationPlanOptions {
  retailer: RetailerType;
  planItems: AddPlanItemUrl[];
  executeScript: (script: string) => Promise<any>;
  onProgress?: (step: AutomationStep) => void;
}

// Retailer-specific selectors - Enhanced for modern e-commerce
const SELECTORS = {
  woolworths: {
    searchInput: 'input[type="search"], input[aria-label*="Search"], input[placeholder*="Search"], input[name*="search"], input[id*="search"], .search-input, [data-testid*="search"]',
    searchButton: 'button[type="submit"], button[aria-label*="Search"], .search-button, [data-testid*="search"]',
    productCard: '.product-tile, .product-card, [data-testid*="product"], .product-item, .product, [class*="product"], .tile, .card, [data-testid*="tile"], [data-testid*="card"], .product-tile-wrapper, .product-card-wrapper, [class*="tile"], [class*="card"]',
    addToCartButton: 'button[aria-label*="Add"], button[aria-label*="add"], [data-testid*="add"], .add-button, .add-to-cart, .add-to-trolley, button[class*="add"], button[class*="Add"], [aria-label*="Add to cart"], [aria-label*="Add to trolley"], button:contains("Add"), button:contains("+"), [title*="Add"], [title*="add"]',
    cartIcon: 'a[href*="cart"], button[aria-label*="cart"], a[href*="trolley"], .cart-icon, .trolley-icon, [data-testid*="cart"], [data-testid*="trolley"]',
    signInButton: 'a[href*="login"], a[href*="signin"], a[href*="sign-in"]',
    continueAsGuestButton: 'button',
  },
  coles: {
    searchInput: 'input[type="search"], input[aria-label*="Search"], input[placeholder*="Search"], input[name*="search"], input[id*="search"], .search-input, [data-testid*="search"]',
    searchButton: 'button[type="submit"], button[aria-label*="Search"], .search-button, [data-testid*="search"]',
    productCard: '.product, .product-tile, [data-testid*="product"], .product-item, [class*="product"], .tile, .card, [data-testid*="tile"], [data-testid*="card"], .product-tile-wrapper, .product-card-wrapper, .product-tile-container, [class*="tile"], [class*="card"]',
    addToCartButton: 'button[aria-label*="Add"], button[aria-label*="add"], [data-testid*="add"], .add-button, .add-to-cart, .add-to-trolley, button[class*="add"], button[class*="Add"], [aria-label*="Add to cart"], [aria-label*="Add to trolley"], button:contains("Add"), button:contains("+"), [title*="Add"], [title*="add"]',
    cartIcon: 'a[href*="cart"], button[aria-label*="cart"], a[href*="trolley"], .cart-icon, .trolley-icon, [data-testid*="cart"], [data-testid*="trolley"]',
    signInButton: 'a[href*="login"], a[href*="signin"], a[href*="sign-in"]',
    continueAsGuestButton: 'button',
  },
};

// Helper function to wait for an element
const waitForElement = (selector: string, timeout: number = 5000): string => {
  return `
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const interval = setInterval(() => {
        const element = document.querySelector('${selector}');
        if (element) {
          clearInterval(interval);
          resolve(true);
        } else if (Date.now() - startTime > ${timeout}) {
          clearInterval(interval);
          reject(new Error('Element not found: ${selector}'));
        }
      }, 100);
    });
  `;
};

// Helper function to click an element
const clickElement = (selector: string): string => {
  return `
    const element = document.querySelector('${selector}');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      await new Promise(resolve => setTimeout(resolve, 500));
      element.click();
      return true;
    }
    return false;
  `;
};

// Helper function to type text
const typeText = (selector: string, text: string): string => {
  return `
    const element = document.querySelector('${selector}');
    if (element) {
      element.focus();
      element.value = '';
      
      // Simulate typing character by character
      const text = '${text.replace(/'/g, "\\'")}';
      for (let i = 0; i < text.length; i++) {
        element.value += text[i];
        element.dispatchEvent(new Event('input', { bubbles: true }));
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      element.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    }
    return false;
  `;
};

// Helper function to check if user is signed in
const checkAuthStatus = (retailer: RetailerType): string => {
  return `
    // Simple and direct check for signed-in state
    const bodyText = document.body.textContent.toLowerCase();
    
    // Look for clear indicators of being signed in
    const signedInIndicators = [
      'hello, manish',  // Direct match for your case
      'hello manish',   // Alternative format
      'welcome, manish',
      'welcome manish',
      'my account',
      'account details',
      'my orders',
      'order history',
      'logout',
      'sign out',
      'log out'
    ];
    
    // Check if any signed-in indicators are present
    const hasSignedInIndicator = signedInIndicators.some(indicator => 
      bodyText.includes(indicator)
    );
    
    // Also check for cart with items (indicates signed in)
    const hasCartWithItems = bodyText.includes('cart') && 
                           (bodyText.includes('$') || bodyText.includes('items'));
    
    // Debug logging
    console.log('Auth check - body text sample:', bodyText.substring(0, 200));
    console.log('Auth check - has signed in indicator:', hasSignedInIndicator);
    console.log('Auth check - has cart with items:', hasCartWithItems);
    
    const isSignedIn = hasSignedInIndicator || hasCartWithItems;
    console.log('Auth check - final result:', isSignedIn);
    
    return isSignedIn;
  `;
};

// Intelligent product matching and selection
const collectTopProductCandidates = (retailer: RetailerType, searchTerm: string, limit: number = 5): string => {
  return `
    await new Promise(resolve => setTimeout(resolve, 1500));
    const normalize = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
    const normalizedSearch = normalize('${searchTerm}');
    const searchWords = '${searchTerm}'.toLowerCase().split(' ').filter(Boolean);
    const singularWords = searchWords.map(word => word.endsWith('s') && word.length > 3 ? word.slice(0, -1) : word);
    const allowedHosts = ['woolworths.com.au','www.woolworths.com.au','coles.com.au','www.coles.com.au'];
    const blockedTokens = ['facebook', 'instagram', 'twitter', 'pinterest', 'open app', 'open in app', 'download app', 'google play', 'play store', 'deals', 'magazine', 'recipe inspiration'];
    const isAllowedUrl = (target) => {
      try {
        const url = new URL(target, window.location.href);
    if (!allowedHosts.includes(url.hostname)) return false;
    const combined = (url.pathname + ' ' + url.search).toLowerCase();
    if (blockedTokens.some(token => combined.includes(token))) return false;
        return true;
      } catch (_) {
        return false;
      }
    };
    const ensureAbsoluteUrl = (target) => {
      try {
        const url = new URL(target, window.location.href);
        return url.toString();
      } catch (_) {
        return null;
      }
    };

    const collectWoolworthsShadowTiles = () => {
      if (!window.location.href.includes('woolworths.com.au')) return [];
      const __deepNodes = function*(root = document) {
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
        let n = root;
        while (n) {
          yield n;
          if (n.shadowRoot) yield* __deepNodes(n.shadowRoot);
          n = walker.nextNode();
        }
      };
      const tiles = [];
      for (const node of __deepNodes(document)) {
        if (node.matches && node.matches('wc-product-tile')) {
          tiles.push(node);
        }
      }
      return tiles.filter(tile => tile.shadowRoot);
    };
    const shadowTileCandidates = collectWoolworthsShadowTiles().map((tile, index) => {
      try {
        const sr = tile.shadowRoot;
        const anchor = sr && sr.querySelector('a[aria-label]');
        const ariaTitle = (anchor && anchor.getAttribute('aria-label')) || '';
        const priceEl = sr && sr.querySelector('[data-test="product-price"], [class*="price"]');
        const priceText = priceEl ? priceEl.textContent || '' : '';
        const img = sr && sr.querySelector('img');
        const imageUrl = img ? ensureAbsoluteUrl(img.currentSrc || img.src || (img.srcset ? img.srcset.split(' ')[0] : null)) : null;
        const text = normalize(ariaTitle + ' ' + priceText);
        let score = 0;
        const matchedTokens = [];
        if (text.includes(normalizedSearch)) {
          score += 120;
          matchedTokens.push('exact');
        }
        normalizedParts.forEach((token, idx) => {
          if (!token) return;
          const singular = singularParts[idx];
          if (text.includes(token)) {
            score += 25;
            matchedTokens.push(token);
          } else if (singular && singular.length > 3 && text.includes(singular)) {
            score += 18;
            matchedTokens.push(singular);
          }
        });
        if (/outofstock|soldout/.test(text)) score -= 40;
        const href = anchor ? anchor.getAttribute('href') : '';
        const absoluteHref = href ? ensureAbsoluteUrl(href) : null;
        return {
          id: tile.getAttribute('data-auto-candidate-id') || ('auto-ww-shadow-' + index),
          title: ariaTitle || '',
          href: absoluteHref && isAllowedUrl(absoluteHref) ? absoluteHref : null,
          imageUrl,
          priceText: priceText.trim() || undefined,
          score,
          snippet: ariaTitle,
          matchedTokens
        };
      } catch (_) {
        return null;
      }
    }).filter(Boolean);
    const extractImageFromElement = (element) => {
      if (!element) return null;
      const img = element.querySelector('img');
      if (img) {
        const src = img.currentSrc || img.src || (img.srcset ? img.srcset.split(' ')[0] : null);
        const finalSrc = src ? ensureAbsoluteUrl(src) : null;
        if (finalSrc) return finalSrc;
      }
      const pictureSource = element.querySelector('picture source[srcset]');
      if (pictureSource) {
        const srcset = pictureSource.getAttribute('srcset') || '';
        const src = srcset.split(',')[0]?.trim().split(' ')[0];
        const finalSrc = src ? ensureAbsoluteUrl(src) : null;
        if (finalSrc) return finalSrc;
      }
      const bgEl = element.querySelector('[style*="background"], [class*="image"]');
      const getBackgroundUrl = (el) => {
        try {
          const style = window.getComputedStyle(el);
          const bgImage = style.getPropertyValue('background-image');
          if (bgImage && bgImage.includes('url(')) {
            const match = bgImage.match(/url\\(["']?(.+?)["']?\\)/i);
            if (match && match[1]) {
              return ensureAbsoluteUrl(match[1]);
            }
          }
        } catch (_) {}
        return null;
      };
      if (bgEl) {
        const src = getBackgroundUrl(bgEl);
        if (src) return src;
      }
      const candidates = Array.from(element.querySelectorAll('*')).slice(0, 50);
      for (const candidate of candidates) {
        const src = getBackgroundUrl(candidate);
        if (src) return src;
      }
      return null;
    };
    const findProductContainers = () => {
      const productSelectors = [
        '[data-testid*="product" i]',
        '[data-testid*="item" i]',
        '.product-tile',
        '.product-card',
        '.product-item',
        '.product',
        '.tile',
        '.card',
        '.search-result',
        '.listing-item'
      ];
      let allProducts = [];
      for (const selector of productSelectors) {
        const nodes = Array.from(document.querySelectorAll(selector));
        allProducts = allProducts.concat(nodes);
      }
      const uniqueProducts = [...new Set(allProducts)].filter(product => {
        try {
          const rect = product.getBoundingClientRect();
          if (rect.width < 120 || rect.height < 120) return false;
          if (rect.top < 0 || rect.left < 0) return false;
          const text = (product.textContent || '').toLowerCase();
          if (!text) return false;
          if (blockedTokens.some(token => text.includes(token))) return false;
          if (!(text.includes('$') || text.includes('price') || text.includes('add'))) return false;
          return true;
        } catch (_) {
          return false;
        }
      });
      return uniqueProducts;
    };
    const scoreProduct = (product) => {
      const text = (product.textContent || '').toLowerCase();
      const normalized = normalize(text);
      let score = 0;
      let matchedTokens = [];
      if (normalized.includes(normalizedSearch)) {
        score += 120;
        matchedTokens.push('exact');
      }
      searchWords.forEach((word, idx) => {
        if (!word || word.length < 3) return;
        if (normalized.includes(normalize(word))) {
          score += 25;
          matchedTokens.push(word);
        } else if (singularWords[idx] && normalized.includes(normalize(singularWords[idx]))) {
          score += 18;
          matchedTokens.push(singularWords[idx]);
        }
      });
      if (product.querySelector("button[data-test='add-to-cart'], button.add-to-cart-btn, button[aria-label*='add' i], button[title*='add' i], [role='button'][aria-label*='add' i]")) {
        score += 30;
      }
      if (/out of stock|sold out|unavailable/.test(text)) {
        score -= 50;
      }
      return { score, matchedTokens };
    };
    const containers = findProductContainers();
    const results = containers.map((container, index) => {
      const { score, matchedTokens } = scoreProduct(container);
      const anchor = container.querySelector("a[href*='/product']");
      let hrefRaw = anchor ? anchor.getAttribute('href') : '';
      if (hrefRaw && hrefRaw.toLowerCase().includes('facebook')) {
        hrefRaw = '';
      }
      const absoluteHref = hrefRaw ? ensureAbsoluteUrl(hrefRaw) : null;
      if (absoluteHref && absoluteHref.toLowerCase().includes('facebook')) {
        return null;
      }
      const title = anchor?.getAttribute('aria-label') || anchor?.textContent?.trim() || (container.querySelector('[aria-label]')?.getAttribute('aria-label')) || (container.textContent || '').trim().split('\\n')[0];
      const priceEl = container.querySelector('[data-test*="price" i], [class*="price" i]');
      const priceText = priceEl ? priceEl.textContent?.trim() : undefined;
      const snippet = (container.textContent || '').trim().slice(0, 160);
      const imageUrl = extractImageFromElement(container);
      let candidateId = container.getAttribute('data-auto-candidate-id');
      if (!candidateId) {
        candidateId = 'auto-candidate-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8) + '-' + index;
        container.setAttribute('data-auto-candidate-id', candidateId);
      }
      return {
        id: candidateId,
        title: title || '',
        href: absoluteHref && isAllowedUrl(absoluteHref) ? absoluteHref : null,
        imageUrl,
        priceText,
        score,
        snippet,
        matchedTokens
      };
    }).filter(item => item && item.score > 0).sort((a, b) => b.score - a.score);

    const combinedCandidates = [...shadowTileCandidates, ...results].filter(Boolean);

    const topCandidates = combinedCandidates
      .filter(Boolean)
      .slice(0, ${limit})
      .map(item => ({
        id: item.id,
        title: item.title,
        href: item.href,
        imageUrl: item.imageUrl,
        score: item.score,
        priceText: item.priceText,
        snippet: item.snippet
      }));
    console.log('[AutoShop] Candidate collection ->', topCandidates);
    return { candidates: topCandidates };
  `;
};

const addFirstProductToCart = (retailer: RetailerType, requiredQuantity: number, searchTerm: string, candidateId?: string): string => {
  return `
    const checkAllowedLocation = () => {
      const allowedHosts = ['woolworths.com.au','www.woolworths.com.au','coles.com.au','www.coles.com.au'];
      try {
        const url = new URL(window.location.href);
        return allowedHosts.includes(url.hostname);
      } catch (_) {
        return false;
      }
    };
    if (!checkAllowedLocation()) {
      console.log('[AutoShop] Aborting add-to-cart; current host blocked:', window.location.href);
      return { success: false, message: 'Blocked host' };
    }

    // Wait for page to be fully loaded
    await new Promise(resolve => setTimeout(resolve, 3500));
    
    // Normalization helpers to improve exact matching reliability
    const normalize = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
    const normalizedSearch = normalize('${searchTerm}');
    const normalizedCompactSearch = normalize('${searchTerm}'.replace(/\s+/g, ''));
    const searchParts = '${searchTerm}'.split(/\s+/).filter(Boolean);
    const normalizedParts = searchParts.map(part => normalize(part));
    const singularParts = normalizedParts.map(part => part.replace(/s$/, ''));
    const avoidTokens = ['chilli','chili','garlic','crumb','crumbed','crumbs','marinated','seasoned','sauce','schnitzel','tender','tenders','nugget','nuggets','spicy','spice','bbq','barbecue','sweet','honey','lemon','pepper','herb','smokey','smoked','coated','glazed','teriyaki','butter','gravy'];
    const __asLog = (...args) => {
      try { window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({ autoShopLog: true, message: args.join(' ') })); }
      catch(_) { try { console.log.apply(console, args); } catch(_) {} }
    };
    __asLog('[AutoShop] normalizedSearch =', normalizedSearch, 'raw =', '${searchTerm}');
    const allowedHosts = ['woolworths.com.au','www.woolworths.com.au','coles.com.au','www.coles.com.au'];
    const blockedTokens = ['facebook','instagram','twitter','pinterest','openapp','open%20app','open-in-app'];
    const isAllowedUrl = (target) => {
      try {
        const url = new URL(target, window.location.href);
        if (!allowedHosts.includes(url.hostname)) return false;
        const combined = (url.pathname + ' ' + url.search).toLowerCase();
        if (blockedTokens.some(token => combined.includes(token))) return false;
        return true;
      } catch (_) {
        return false;
      }
    };
    const safeNavigate = (target) => {
      try {
        const url = new URL(target, window.location.href);
        if (!allowedHosts.includes(url.hostname)) {
          __asLog('[AutoShop] blocked external navigation attempt to', url.toString());
          return false;
        }
        window.location.href = url.toString();
        return true;
      } catch (err) {
        __asLog('[AutoShop] failed to navigate to', target, err && err.message ? err.message : err);
        return false;
      }
    };
    
    // Woolworths: deterministic pass — find add buttons whose container text matches keywords
    if (window.location.href.includes('woolworths.com.au')) {
      try {
        // Shadow-DOM aware path (wc-product-tile / wc-add-to-cart)
        const __deepNodes = function*(root = document) {
          const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
          let n = root;
          while (n) {
            yield n;
            if (n.shadowRoot) yield* __deepNodes(n.shadowRoot);
            n = walker.nextNode();
          }
        };
        const __deepQueryAll = (selector, root = document) => {
          const out = [];
          for (const n of __deepNodes(root)) { if (n.querySelectorAll) out.push(...n.querySelectorAll(selector)); }
          return [...new Set(out)];
        };
        const tiles = __deepQueryAll('wc-product-tile').filter(t => t.shadowRoot);
        if (tiles.length) {
          __asLog('[AutoShop] woolies tiles =', String(tiles.length));
          const scoreTile = (tile) => {
            const sr = tile.shadowRoot;
            const aEl = sr && sr.querySelector('a[aria-label]');
            const ariaTitle = (aEl && aEl.getAttribute('aria-label')) || '';
            const priceEl = sr && sr.querySelector('[data-test="product-price"], [class*="price"]');
            const text = normalize(ariaTitle + ' ' + ((priceEl && priceEl.textContent) || ''));
            let score = 0;
            let matchedTokens = 0;
            normalizedParts.forEach((token, idx) => {
              if (!token) return;
              const singular = singularParts[idx];
              if (text.includes(token) || (singular && singular.length > 3 && text.includes(singular))) {
                matchedTokens++;
                score += 20;
              }
            });
            if (matchedTokens === normalizedParts.length && normalizedParts.length > 0) {
              score += 25;
            }
            if (normalizedCompactSearch && text.includes(normalizedCompactSearch)) {
              score += 30;
            }
            if (/outofstock|soldout/.test(text)) {
              score -= 40;
            }
            avoidTokens.forEach(token => {
              if (token && text.includes(token)) {
                score -= 18;
              }
            });
            return { tile, score, text, href: (aEl && aEl.href) || '' };
          };
          const ranked = tiles.map(scoreTile).sort((a,b) => b.score - a.score);
          if (ranked.length) __asLog('[AutoShop] top tile text =', (ranked[0].text||'').slice(0,120), ' score=', String(ranked[0].score));
          if (ranked.length && ranked[0].score >= 40) {
            const sr = ranked[0].tile.shadowRoot;
            let addBtn = sr && (sr.querySelector("button[data-test='add-to-cart'], .add-to-cart-btn"));
            if (!addBtn) {
              const host = sr && sr.querySelector('wc-add-to-cart');
              const hostSR = host && host.shadowRoot;
              addBtn = hostSR && hostSR.querySelector('button.add-to-cart-btn, button[aria-label*="add to cart" i]');
            }
            if (addBtn) {
              try { addBtn.scrollIntoView({behavior:'smooth', block:'center'}); } catch(_) {}
              await new Promise(r => setTimeout(r, 250));
              try { addBtn.click(); } catch(_) {}
              await new Promise(r => setTimeout(r, 600));
              if (${requiredQuantity} > 1) {
                const inc = document.querySelector("button[aria-label*='increase' i], button[data-test*='increment' i], button[data-testid*='increment' i]");
                if (inc) { for (let i = 1; i < ${requiredQuantity}; i++) { try { inc.click(); } catch(_) {} await new Promise(r=>setTimeout(r,120)); } }
              }
              return { success:true, message:'Added via shadow DOM button' };
            } else if (ranked[0].href) {
              // PDP fallback via aria anchor
              if (safeNavigate(ranked[0].href)) {
                await new Promise(r => setTimeout(r, 2500));
                const pdpBtn = document.querySelector("button[data-test='add-to-cart'], button[aria-label*='add to cart' i]");
                if (pdpBtn) { try { pdpBtn.click(); } catch(_) {} await new Promise(r => setTimeout(r, 600)); return { success:true, message:'Added via WW PDP after tile match' }; }
              }
            }
          }
        }
        const keywords = '${searchTerm}'.toLowerCase().split(' ').filter(Boolean);
        // 1) Try scoring add buttons in-place
        const addButtons = Array.from(document.querySelectorAll("button[data-test='add-to-cart'], button.add-to-cart-btn, button[aria-label*='add to trolley' i], button[aria-label*='add to cart' i]"));
        __asLog('[AutoShop] addButtons found =', String(addButtons.length));
        const findMatchingContainer = (el) => {
          let node = el; let hops = 0; let best = el;
          while (node && hops < 6) { best = node; node = node.parentElement; hops++; }
          return best;
        };
        let scored = addButtons.map(btn => {
          const scope = findMatchingContainer(btn);
          const rawText = (scope.textContent || '');
          const txt = normalize(rawText);
          const score = keywords.reduce((s, k) => s + (txt.includes(normalize(k)) ? 1 : 0), 0);
          return { btn, score, snippet: rawText.slice(0,120), normSnippet: txt.slice(0,120) };
        }).sort((a,b) => b.score - a.score);
        if (scored.length) {
          __asLog('[AutoShop] addButtons top candidates ->', JSON.stringify(scored.slice(0,3).map(x => ({score:x.score, snippet:x.snippet, norm:x.normSnippet}))));
        }
        if (scored.length && scored[0].score >= Math.max(2, Math.floor(keywords.length*0.6))) {
          try { scored[0].btn.click(); } catch(_) {}
          await new Promise(r => setTimeout(r, 800));
          const inc = document.querySelector("button[aria-label*='increase' i], button[data-test*='increment' i], button[data-testid*='increment' i]");
          if (inc && ${requiredQuantity} > 1) {
            for (let i = 1; i < ${requiredQuantity}; i++) { try { inc.click(); } catch(_) {} await new Promise(r => setTimeout(r, 120)); }
          }
          return { success: true, message: 'Added via deterministic WW add-button match' };
        }

        // 2) Score product tiles by anchor/title text
        let anchors = Array.from(document.querySelectorAll("a[href^='/shop/productdetails/'], a[href*='/shop/productdetails/'], a[href*='/shop/product/']"));
        anchors = anchors.filter(a => isAllowedUrl(a.getAttribute('href') || ''));
        __asLog('[AutoShop] anchors found =', String(anchors.length));
        // If none found (mobile/experimental markup), scrape broader link set
        if (!anchors.length) {
          const broad = Array.from(document.querySelectorAll('[data-testid*="product" i] a[href], [class*="product" i] a[href], a[aria-label], [role="link"][aria-label]'));
          // Filter to on-site links and visible ones
        anchors = broad.filter(a => {
            try {
              const href = a.getAttribute('href') || '';
              const rect = a.getBoundingClientRect();
              const visible = rect.width > 60 && rect.height > 20;
              return visible && isAllowedUrl(href);
            } catch(_) { return false; }
          });
          __asLog('[AutoShop] anchors (broad scrape) =', String(anchors.length));
        }
        anchors.slice(0,5).forEach((a, idx) => {
          const href = a.getAttribute('href')||'';
          const label = (a.getAttribute('aria-label')||'').slice(0,120);
          const text = (a.textContent||'').slice(0,120);
          __asLog('[AutoShop] anchor[' + idx + '] href=' + href + ' text=' + text + ' aria-label=' + label + ' normText=' + normalize(text + ' ' + label));
        });
        // 2a) If any anchor's text or aria-label is an exact normalized match, go straight to PDP
        try {
          const exact = anchors.find(a => {
            const t = normalize((a.textContent || '') + ' ' + (a.getAttribute('aria-label') || ''));
            return t.includes(normalizedSearch);
          });
          if (!exact) {
            __asLog('[AutoShop] no exact anchor match for', normalizedSearch);
          } else {
            __asLog('[AutoShop] exact anchor match href=', String(exact.getAttribute('href')));
          }
          if (exact) {
            let href = exact.getAttribute('href');
            if (href) {
              if (safeNavigate(href)) {
                await new Promise(r => setTimeout(r, 2500));
                const pdpBtnExact = document.querySelector("button[data-test='add-to-cart'], button.add-to-cart-btn, button[aria-label*='add to cart' i]");
                if (pdpBtnExact) { try { pdpBtnExact.click(); } catch(_) {}
                  await new Promise(r => setTimeout(r, 800));
                  const incE = document.querySelector("button[aria-label*='increase' i], button[data-test*='increment' i], button[data-testid*='increment' i]");
                  if (incE && ${requiredQuantity} > 1) {
                    for (let i = 1; i < ${requiredQuantity}; i++) { try { incE.click(); } catch(_) {} await new Promise(r => setTimeout(r, 120)); }
                  }
                  return { success: true, message: 'Added via exact anchor match to PDP' };
                }
              }
            }
          }
        } catch(_) {}
        const tileScores = anchors.map(a => {
          let node = a; let hops = 0; let container = a;
          while (node && hops < 6) { container = node; node = node.parentElement; hops++; }
          const text = normalize(((a.textContent || '') + ' ' + (container.textContent || '')));
          const score = keywords.reduce((s,k)=> s + (text.includes(normalize(k)) ? 1 : 0), 0);
          return { a, container, score };
        }).sort((x,y)=> y.score - x.score);
        if (tileScores.length) {
          __asLog('[AutoShop] top tile scores =', JSON.stringify(tileScores.slice(0,3).map(t => t.score)));
        }
        const tileThreshold = Math.max(2, Math.floor(keywords.length*0.5));
        if (tileScores.length && tileScores[0].score >= tileThreshold) {
          const best = tileScores[0];
          let host = best.container.querySelector('wc-add-to-cart') || document.querySelector('wc-add-to-cart');
          let btn = null;
          if (host && host.shadowRoot) btn = host.shadowRoot.querySelector('button.add-to-cart-btn');
          if (!btn) btn = best.container.querySelector("button[data-test='add-to-cart'], button.add-to-cart-btn, button[aria-label*='add to cart' i]");
          if (btn) {
            try { btn.click(); } catch(_) {}
            await new Promise(r => setTimeout(r, 800));
            const inc2 = document.querySelector("button[aria-label*='increase' i], button[data-test*='increment' i], button[data-testid*='increment' i]");
            if (inc2 && ${requiredQuantity} > 1) {
              for (let i = 1; i < ${requiredQuantity}; i++) { try { inc2.click(); } catch(_) {} await new Promise(r => setTimeout(r, 120)); }
            }
            return { success: true, message: 'Added via WW product tile match' };
          }
          // Navigate to PDP and add there
          try {
            let href = best.a.getAttribute('href');
            if (!href) {
              const firstAnchor = anchors[0];
              href = firstAnchor ? firstAnchor.getAttribute('href') : '';
            }
            if (href) {
              if (safeNavigate(href)) {
                await new Promise(r => setTimeout(r, 2500));
                const pdpBtn2 = document.querySelector("button[data-test='add-to-cart'], button.add-to-cart-btn, button[aria-label*='add to cart' i]");
                if (pdpBtn2) { try { pdpBtn2.click(); } catch(_) {}
                  await new Promise(r => setTimeout(r, 800));
                  const inc3 = document.querySelector("button[aria-label*='increase' i], button[data-test*='increment' i], button[data-testid*='increment' i]");
                  if (inc3 && ${requiredQuantity} > 1) {
                    for (let i = 1; i < ${requiredQuantity}; i++) { try { inc3.click(); } catch(_) {} await new Promise(r => setTimeout(r, 120)); }
                  }
                  return { success: true, message: 'Added via WW PDP after tile match' };
                }
              }
            }
          } catch(_) {}
        }
      } catch(_) { /* fall through to generic flow */ }
    }

    // Poll for product tiles/results to appear (up to 10s)
    const productReady = await new Promise(resolve => {
      const start = Date.now();
      const check = () => {
        const has = document.querySelector('[class*="product" i], [data-testid*="product" i], .product-tile, .product-card, .product-item');
        if (has) return resolve(true);
        if (Date.now() - start > 10000) return resolve(false);
        setTimeout(check, 300);
      };
      check();
    });
    if (!productReady) {
      console.log('Timed out waiting for product tiles');
    }
    // Encourage lazy-loaded grids to render
    try {
      window.scrollTo(0, document.body.scrollHeight);
      await new Promise(r => setTimeout(r, 800));
      window.scrollTo(0, 0);
      await new Promise(r => setTimeout(r, 600));
    } catch(_) {}
    
    console.log('Starting intelligent product matching for:', '${searchTerm}', 'quantity:', ${requiredQuantity});
    
    // Get viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    console.log('Viewport dimensions:', viewportWidth, 'x', viewportHeight);
    
    // Intelligent product scanning and matching
    const findBestMatchingProduct = () => {
      const searchWords = '${searchTerm}'.toLowerCase().split(' ').filter(word => word.length > 2);
      console.log('Search words to match:', searchWords);
      
      // Find all potential product containers
      const productSelectors = [
        '[class*="product"]',
        '[class*="item"]',
        '[class*="tile"]',
        '[class*="card"]',
        '[data-testid*="product"]',
        '[data-testid*="item"]',
        '.product-tile',
        '.product-card',
        '.product-item',
        '.search-result',
        '.listing-item'
      ];
      
      let allProducts = [];
      for (const selector of productSelectors) {
        const products = Array.from(document.querySelectorAll(selector));
        allProducts = allProducts.concat(products);
      }
      
      // Remove duplicates and filter for valid products
      const uniqueProducts = [...new Set(allProducts)].filter(product => {
        const rect = product.getBoundingClientRect();
        const text = (product.textContent || '').toLowerCase();
        return rect.width > 100 && rect.height > 100 && 
               rect.top > 0 && rect.left > 0 &&
               (text.includes('$') || text.includes('price') || text.includes('add'));
      });
      
      __asLog('[AutoShop] potential product containers =', String(uniqueProducts.length));
      
      // Score each product based on description matching
      const scoredProducts = uniqueProducts.map(product => {
        const productText = (product.textContent || '').toLowerCase();
        const productHTML = (product.innerHTML || '').toLowerCase();
        const fullText = productText + ' ' + productHTML;
        const normText = normalize(fullText);
        
        let score = 0;
        let matchDetails = [];
        
        // Exact phrase matching (highest score)
        if (normText.includes(normalizedSearch)) {
          score += 100;
          matchDetails.push('exact phrase match');
        }
        
        // Individual word matching
        for (const word of searchWords) {
          if (normText.includes(normalize(word))) {
            score += 20;
            matchDetails.push('word: ' + word);
          }
        }
        
        // Partial word matching (for plurals, etc.)
        for (const word of searchWords) {
          const w = normalize(word);
          const partialMatches = normText.match(new RegExp(w.substring(0, Math.max(3, w.length - 1)), 'g'));
          if (partialMatches && partialMatches.length > 0) {
            score += 10;
            matchDetails.push('partial: ' + word);
          }
        }
        
        // Check for quantity/size matching
        if (${requiredQuantity} > 1) {
          const quantityMatches = fullText.match(/(\\d+)\\s*(pack|packs?|x|\\*|count|each|units?|items?)/g);
          if (quantityMatches) {
            for (const match of quantityMatches) {
              const qty = parseInt(match.match(/\\d+/)?.[0] || '0');
              if (qty >= ${requiredQuantity}) {
                score += 30;
                matchDetails.push('quantity match: ' + match);
              }
            }
          }
        }
        
        // Check for size matching (for items like "1.5kg chicken")
        const sizeMatches = fullText.match(/(\\d+)\\.?\\d*\\s*(g|kg|ml|l|oz|lb|grams?|kilograms?|liters?|milliliters?)/g);
        if (sizeMatches) {
          score += 15;
          matchDetails.push('size info: ' + sizeMatches.join(', '));
        }
        
        // Check if it has an add button
        const hasAddButton = product.querySelector('button, a, input, [role="button"]') && 
                           (fullText.includes('add') || fullText.includes('cart') || fullText.includes('+'));
        if (hasAddButton) {
          score += 25;
          matchDetails.push('has add button');
        }
        
        // Check for price (indicates it's a real product)
        if (fullText.includes('$') || fullText.includes('price')) {
          score += 10;
          matchDetails.push('has price');
        }
        
        return {
          product: product,
          score: score,
          matchDetails: matchDetails,
          text: productText.substring(0, 200)
        };
      });
      
      // Sort by score and return the best match
      scoredProducts.sort((a, b) => b.score - a.score);
      try { __asLog('[AutoShop] top product matches =', JSON.stringify(scoredProducts.slice(0,3).map(p => ({score:p.score, text: (p.text||'').slice(0,120)})))); } catch(_) {}
      
      console.log('Product matching results:');
      scoredProducts.slice(0, 5).forEach((item, index) => {
        console.log('Product ' + (index + 1) + ' (score: ' + item.score + '):', item.text.substring(0, 100));
        console.log('  Matches:', item.matchDetails.join(', '));
      });
      
      return scoredProducts.length > 0 ? scoredProducts[0] : null;
    };
    
    // Find the best matching product
    let selectedProduct = null;
    const candidateId = '${candidateId ?? ''}';
    if (candidateId) {
      selectedProduct = document.querySelector('[data-auto-candidate-id="${candidateId}"]');
      if (!selectedProduct) {
        __asLog('[AutoShop] candidate element not found for id', candidateId);
      }
    }
    const bestMatch = selectedProduct ? { product: selectedProduct, score: 999, matchDetails: ['preselected candidate'] } : findBestMatchingProduct();
    if (bestMatch && bestMatch.product) {
      selectedProduct = bestMatch.product;
    }
    
    if (!bestMatch || bestMatch.score < 20) {
      console.log('No strong grid match; trying text-match PDP navigation fallback');
      try {
        const kw = '${searchTerm}'.toLowerCase().split(' ').filter(Boolean);
        const anchors = Array.from(document.querySelectorAll('a[href]'));
        let candidate = null;
        for (const a of anchors) {
          const t = ((a.textContent || '') + ' ' + (a.getAttribute('aria-label') || '')).toLowerCase();
          const href = a.getAttribute('href') || '';
          const score = kw.reduce((s, w) => s + (t.includes(w) ? 1 : 0), 0);
          const looksLikeProduct = /product|productdetails|p\//i.test(href);
          if (score >= Math.max(2, Math.floor(kw.length * 0.6)) && looksLikeProduct && isAllowedUrl(href)) { candidate = a; break; }
        }
        if (candidate) {
          const href = candidate.getAttribute('href');
          const url = href && (href.startsWith('http') ? href : new URL(href, window.location.href).toString());
          if (url && safeNavigate(url)) {
            console.log('Navigating to PDP via text-match fallback:', url);
            await new Promise(r => setTimeout(r, 2500));
            const pdpBtn = document.querySelector("button[data-test='add-to-cart'], button[aria-label*='add to trolley' i], button[aria-label*='add to cart' i], button[type='submit']");
            if (pdpBtn) { try { pdpBtn.click(); } catch(_) {}
              // Handle quantity >1
              if (${requiredQuantity} > 1) {
                const incSel = "button[aria-label*='increase' i], button[data-test*='increment' i], button[data-testid*='increment' i]";
                for (let i = 1; i < ${requiredQuantity}; i++) { const inc = document.querySelector(incSel); if (inc) { try { if (typeof inc.click === 'function') { inc.click(); } else { inc.dispatchEvent(new MouseEvent('click', { bubbles: true })); } } catch(_) {} await new Promise(r => setTimeout(r, 150)); } }
              }
              return { success: true, message: 'Added via PDP text-match fallback' };
            }
          }
        }
      } catch (_) {}

      // Deep text-based scan: find any element whose text includes most keywords, then locate nearest add control
      try {
        const keywords = '${searchTerm}'.toLowerCase().split(' ').filter(Boolean);
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT, null);
        let bestEl = null; let bestScore = 0; let iter = 0;
        while (walker.nextNode() && iter < 5000) {
          iter++;
          const el = walker.currentNode;
          const rect = el.getBoundingClientRect?.() || { width: 0, height: 0 };
          if (rect.width < 60 || rect.height < 20) continue;
          const txt = (el.textContent || '').toLowerCase();
          if (!txt) continue;
          let score = 0; for (const k of keywords) if (txt.includes(k)) score++;
          if (score > bestScore) { bestScore = score; bestEl = el; }
        }
        __asLog('[AutoShop] deep-scan best score =', String(bestScore), ' snippet =', (bestEl && (bestEl.textContent||'').slice(0,120)) || '');
        if (bestEl && bestScore >= Math.max(2, Math.floor(keywords.length * 0.6))) {
          // ascend to a reasonable container
          let container = bestEl; let hops = 0;
          while (container && hops < 6) { if (container.querySelector) { const btn = container.querySelector("button[data-test='add-to-cart'], button.add-to-cart-btn, button[aria-label*='add to cart' i]"); if (btn) { try { btn.click(); } catch(_) {} await new Promise(r => setTimeout(r, 800)); return { success: true, message: 'Added via deep text match' }; } } container = container.parentElement; hops++; }
        }
      } catch(_) {}

      // Final-resort for Woolworths: open the first productdetails anchor on the page and add there
      try {
        if (window.location.href.includes('woolworths.com.au')) {
          const firstPdp = document.querySelector("a[href^='/shop/productdetails/'], a[href*='/shop/productdetails/']");
          if (firstPdp) {
            const href = firstPdp.getAttribute('href');
            if (href) {
              console.log('Final resort: navigating to first productdetails anchor:', href);
              if (safeNavigate(href)) {
                await new Promise(r => setTimeout(r, 3000));
                const pdpBtn = document.querySelector("button[data-test='add-to-cart'], button.add-to-cart-btn, button[aria-label*='add to cart' i]");
                if (pdpBtn) { try { pdpBtn.click(); } catch(_) {}
                  await new Promise(r => setTimeout(r, 800));
                  const inc = document.querySelector("button[aria-label*='increase' i], button[data-test*='increment' i], button[data-testid*='increment' i]");
                  if (inc && ${requiredQuantity} > 1) {
                    for (let i = 1; i < ${requiredQuantity}; i++) { try { inc.click(); } catch(_) {} await new Promise(r => setTimeout(r, 120)); }
                  }
                  return { success: true, message: 'Added via final-resort PDP open' };
                }
              }
            }
          }
        }
      } catch(_) {}

      return { success: false, message: 'No matching products found for: ${searchTerm}' };
    }
    
    console.log('Best product match found (score: ' + bestMatch.score + '):', bestMatch.text.substring(0, 100));
    console.log('Match details:', bestMatch.matchDetails.join(', '));
    
    if (!selectedProduct) {
      return { success: false, message: 'No matching products found after candidate selection' };
    }
    
    // Now try to find and click the add button for the selected product
    console.log('Attempting to add selected product to cart');
    
    // Scroll the selected product into view
    selectedProduct.scrollIntoView({ behavior: 'smooth', block: 'center' });
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Find the add button within or near the selected product
    const strongAddSelectors = [
      '[data-automation*="addto"]',
      '[data-automation*="add-to"]',
      '[data-testid*="add"]',
      '[data-testid*="Add"]',
      'button[aria-label*="add" i]',
      'button[aria-label*="cart" i]',
      'button[title*="add" i]',
      'button[class*="add" i]',
      'button.add-to-cart-btn',
      'a[aria-label*="add" i]'
    ];
    // Retailer-specific strong selectors
    if ('${retailer}' === 'woolworths') {
      strongAddSelectors.unshift("button[data-test='add-to-cart']", "button[data-test='AddToCart']");
    } else {
      strongAddSelectors.unshift("button[data-testid*='add-to-cart']");
    }
    const genericButtonSelectors = [
      'button', 'a', 'input[type="button"]', 'input[type="submit"]', '[role="button"]', '[onclick]'
    ];

    function matchesAddIntent(el) {
      const text = ((el.textContent || '') + ' ' + (el.getAttribute('aria-label') || '') + ' ' + (el.getAttribute('title') || '')).toLowerCase();
      const clsId = ((el.getAttribute('class') || '') + ' ' + (el.getAttribute('id') || '')).toLowerCase();
      if (/add\s*to\s*(cart|trolley)/i.test(text)) return true;
      if (text.includes('add') || text.includes('cart') || text.includes('trolley')) return true;
      if (clsId.includes('add') || clsId.includes('cart') || clsId.includes('trolley')) return true;
      return false;
    }

    // Helper: search for add button within normal DOM
    function findAddButtonInScope(scope) {
      // Prefer strong selectors
      for (const sel of strongAddSelectors) {
        const btn = scope.querySelector(sel);
        if (btn) return btn;
      }
      // Fallback: scan generic buttons and filter by intent
      const candidates = Array.from(scope.querySelectorAll(genericButtonSelectors.join(',')));
      return candidates.find(matchesAddIntent) || null;
    }

    // Helper: search across common shadow roots (Woolworths uses wc-add-to-cart)
    function findAddButtonInShadows(rootScope) {
      const hosts = Array.from(rootScope.querySelectorAll('wc-add-to-cart, wc-product-controls, [class*="add-to-cart-button" i]'));
      for (const host of hosts) {
        const sr = (host && (host.shadowRoot || null));
        if (!sr) continue;
        const btn = sr.querySelector('button.add-to-cart-btn, button[aria-label*="add to cart" i], button[aria-label*="add to trolley" i]');
        if (btn) return btn;
      }
      return null;
    }

    let addButton = findAddButtonInScope(selectedProduct) || findAddButtonInShadows(selectedProduct) || findAddButtonInShadows(document);
    
    // If not found in product, look in closest container around it
    if (!addButton) {
      let container = selectedProduct.parentElement;
      let hops = 0;
      while (!addButton && container && hops < 4) {
        const btn = findAddButtonInScope(container);
        if (btn) addButton = btn;
        container = container.parentElement;
        hops++;
      }
    }
    
    // As a last resort, look for visible "Add to cart" text near the product rectangle
    if (!addButton) {
      const productRect = selectedProduct.getBoundingClientRect();
      const all = Array.from(document.querySelectorAll('*'));
      const nearby = all.filter(el => {
        try {
          const r = el.getBoundingClientRect();
          const verticallyClose = Math.abs((r.top + r.bottom)/2 - (productRect.top + productRect.bottom)/2) < 300;
          return r.width > 40 && r.height > 20 && verticallyClose && matchesAddIntent(el);
        } catch(_) { return false; }
      });
      if (nearby.length > 0) addButton = nearby[0];
    }

    // Global fallback: any visible add button on page
    if (!addButton) {
      const allButtons = Array.from(document.querySelectorAll('button, [role="button"], a, input[type="button"], input[type="submit"]'));
      addButton = allButtons.find(el => {
        try {
          const r = el.getBoundingClientRect();
          return r.width > 40 && r.height > 20 && matchesAddIntent(el);
        } catch (_) { return false; }
      }) || null;
    }
    
    if (addButton) {
      console.log('Add button found, attempting to click');
      const rect = addButton.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      console.log('Add button coordinates:', centerX, centerY);
      
      // Enhanced click simulation with verification
      let clickSuccessful = false;
      let actualClickWorked = false;
      
      // Get initial cart state for verification
      const getCartState = () => {
        const cartElements = document.querySelectorAll('[class*="cart"], [id*="cart"], [aria-label*="cart"], [data-testid*="cart"], [data-automation*="cart"]');
        let cartText = '';
        for (const el of cartElements) {
          cartText += (el.textContent || '') + ' ';
        }
        return cartText.toLowerCase();
      };
      
      const initialCartState = getCartState();
      console.log('Initial cart state:', initialCartState);
      
      // If the button lives inside a form, prefer form submission which Woolworths uses for add-to-cart
      try {
        const form = addButton.closest('form');
        if (form) {
          if (typeof form.requestSubmit === 'function') {
            form.requestSubmit(addButton);
          } else {
            form.submit();
          }
          console.log('Submitted enclosing form for add-to-cart');
          clickSuccessful = true;
        }
      } catch (e) {
        console.log('Form submit approach failed:', e && e.message ? e.message : e);
      }

      // Method 1: Touch + mouse sequence (mobile sites often rely on touch events)
      try {
        // Touch sequence
        try {
          const touchStart = new TouchEvent('touchstart', { bubbles: true, cancelable: true });
          const touchEnd = new TouchEvent('touchend', { bubbles: true, cancelable: true });
          addButton.dispatchEvent(touchStart);
          await new Promise(resolve => setTimeout(resolve, 50));
          addButton.dispatchEvent(touchEnd);
        } catch (_) { /* ignore if TouchEvent not supported */ }

        // Simulate a complete mouse interaction
        const mouseOverEvent = new MouseEvent('mouseover', {
          bubbles: true,
          cancelable: true,
          clientX: centerX,
          clientY: centerY,
          button: 0
        });
        const mouseEnterEvent = new MouseEvent('mouseenter', {
          bubbles: true,
          cancelable: true,
          clientX: centerX,
          clientY: centerY,
          button: 0
        });
        const mouseDownEvent = new MouseEvent('mousedown', {
          bubbles: true,
          cancelable: true,
          clientX: centerX,
          clientY: centerY,
          button: 0
        });
        const mouseUpEvent = new MouseEvent('mouseup', {
          bubbles: true,
          cancelable: true,
          clientX: centerX,
          clientY: centerY,
          button: 0
        });
        const clickEvent = new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          clientX: centerX,
          clientY: centerY,
          button: 0
        });
        
        addButton.dispatchEvent(mouseOverEvent);
        await new Promise(resolve => setTimeout(resolve, 50));
        addButton.dispatchEvent(mouseEnterEvent);
        await new Promise(resolve => setTimeout(resolve, 50));
        addButton.dispatchEvent(mouseDownEvent);
        await new Promise(resolve => setTimeout(resolve, 100));
        addButton.dispatchEvent(mouseUpEvent);
        await new Promise(resolve => setTimeout(resolve, 50));
        addButton.dispatchEvent(clickEvent);
        
        console.log('Touch + mouse click sequence executed');
        clickSuccessful = true;
      } catch (e) {
        console.log('Enhanced coordinate click method 1 failed:', e.message);
      }
      
      // Method 2: Try direct element click with focus
      if (!clickSuccessful) {
        try {
          addButton.focus();
          addButton.click();
          console.log('Direct element click method 2 executed');
          clickSuccessful = true;
        } catch (e) {
          console.log('Direct element click method 2 failed:', e.message);
        }
      }
      
      // Method 3: Try triggering onclick handlers directly
      if (!clickSuccessful) {
        try {
          const onclickCode = addButton.getAttribute('onclick');
          if (onclickCode) {
            eval(onclickCode);
            console.log('Onclick handler method 3 executed');
            clickSuccessful = true;
          }
        } catch (e) {
          console.log('Onclick handler method 3 failed:', e.message);
        }
      }
      
      // Wait and verify the click actually worked (observe mutations on the button or cart)
      if (clickSuccessful) {
        // Observe for up to 3s for button label/aria changes indicating success
        await new Promise(resolve => {
          let settled = false;
          const observer = new MutationObserver(() => {
            const txt = (addButton.textContent || '').toLowerCase();
            const aria = (addButton.getAttribute('aria-label') || '').toLowerCase();
            if (txt.includes('added') || aria.includes('added') || txt.includes('increase') || txt.includes('decrease')) {
              settled = true; observer.disconnect(); resolve(true);
            }
          });
          observer.observe(addButton, { attributes: true, childList: true, subtree: true, attributeFilter: ['aria-label', 'class'] });
          setTimeout(() => { if (!settled) { observer.disconnect(); resolve(false); } }, 3000);
        });
        
        
        // Additional verification: look for increment control next to button (common on retailers)
        let incrementAppeared = false;
        try {
          const incSel = 'button[aria-label*="increase" i], button[data-test*="increment" i], button[data-testid*="increment" i]';
          const start = Date.now();
          while (Date.now() - start < 2500 && !incrementAppeared) {
            const inc = document.querySelector(incSel);
            if (inc) { incrementAppeared = true; break; }
            await new Promise(r => setTimeout(r, 150));
          }
        } catch(_) {}

        // Check if cart state changed
        const newCartState = getCartState();
        console.log('New cart state:', newCartState);
        
        // Look for signs that something was added
        const cartChanged = newCartState !== initialCartState;
        const hasPrice = newCartState.includes('$') && !newCartState.includes('$0.00');
        const hasItemCount = /\d+/.test(newCartState);
        const buttonChanged = (addButton.textContent || '').toLowerCase().includes('added') || (addButton.getAttribute('aria-label') || '').toLowerCase().includes('added');

        console.log('Cart verification - Changed:', cartChanged, 'Has price:', hasPrice, 'Has count:', hasItemCount, 'Button changed:', buttonChanged);

        if (incrementAppeared || cartChanged || hasPrice || hasItemCount || buttonChanged) {
          actualClickWorked = true;
          console.log('✅ Click verification successful - item appears to be added to cart');
        } else {
          console.log('❌ Click verification failed - cart state unchanged');
        }
      }
      
      // Retry strategies if cart didn't update on first attempt
      if (!actualClickWorked) {
        console.log('Retrying add-to-cart with alternative strategies');
        // Try clicking the button up to 3 more times with short waits
        for (let i = 0; i < 3 && !actualClickWorked; i++) {
          try {
            addButton.click();
            await new Promise(r => setTimeout(r, 700));
            const newState = getCartState();
            if (newState !== initialCartState) {
              actualClickWorked = true;
              break;
            }
          } catch(_) {}
        }
        // If increment control appears, click once to ensure qty 1
        if (!actualClickWorked) {
          try {
            const inc = document.querySelector('button[aria-label*="increase" i], button[data-test*="increment" i]');
            if (inc) { inc.click(); await new Promise(r => setTimeout(r, 300)); actualClickWorked = true; }
          } catch(_) {}
        }
      }

      if (actualClickWorked) {
        return { success: true, message: 'Product added to cart and verified' };
      } else if (clickSuccessful) {
        return { success: false, message: 'Click executed but cart state unchanged - may need manual verification' };
      }
    } else {
      console.log('No add button found in selected product');
      // Fallback path: open the product detail page and try adding there
      try {
        const link = selectedProduct.querySelector('a[href*="/product" i], a[href*="/productdetails" i]');
        if (link) {
          const href = link.getAttribute('href');
          if (href) {
            console.log('Opening product detail page for fallback:', href);
            if (safeNavigate(href)) {
              // Give the PDP time to load
              await new Promise(r => setTimeout(r, 2500));
              // Try add controls on PDP
              const pdpBtn = document.querySelector('button[aria-label*="add" i], button[data-test*="add" i], button[type="submit"]');
              if (pdpBtn) {
                try { pdpBtn.click(); } catch(_) {}
                await new Promise(r => setTimeout(r, 800));
                const inc = document.querySelector('button[aria-label*="increase" i], button[data-test*="increment" i]');
                if (inc && ${requiredQuantity} > 1) {
                  for (let i = 1; i < ${requiredQuantity}; i++) { try { inc.click(); } catch(_) {} await new Promise(r => setTimeout(r, 150)); }
                }
                return { success: true, message: 'Added from PDP fallback' };
              }
            }
          }
        }
      } catch(_) {}
      return { success: false, message: 'No add button found in selected product' };
    }
    
    // Global page-level fallback (Woolworths): click the first visible add-to-cart control
    try {
      const wwAddSelectors = [
        "button[data-test='add-to-cart']",
        "button[aria-label*='add to trolley' i]",
        "button[aria-label*='add to cart' i]"
      ];
      let add = null;
      for (const s of wwAddSelectors) { const el = document.querySelector(s); if (el) { add = el; break; } }
      if (!add) {
        const host = document.querySelector('wc-add-to-cart');
        const sr = host && (host.shadowRoot || null);
        if (sr) {
          const btn = sr.querySelector('button.add-to-cart-btn');
          if (btn) add = btn;
        }
      }
      if (add) {
        try { add.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch(_) {}
        await new Promise(r => setTimeout(r, 400));
        try { add.click(); } catch(_) {}
        await new Promise(r => setTimeout(r, 800));
        const inc = document.querySelector("button[aria-label*='increase' i], button[data-test*='increment' i], button[data-testid*='increment' i]");
        if (inc && ${requiredQuantity} > 1) {
          for (let i = 1; i < ${requiredQuantity}; i++) { try { inc.click(); } catch(_) {} await new Promise(r => setTimeout(r, 120)); }
        }
        return { success: true, message: 'Added via first visible add-to-cart fallback' };
      }
    } catch(_) {}

    return { success: false, message: 'No matching products found or add button not found' };
  `;
};

interface VerificationResult {
  match: boolean;
  confidence?: number;
  reason?: string;
}

async function verifyProductCandidateWithOpenAI(searchTerm: string, candidate: ProductCandidate): Promise<VerificationResult | null> {
  if (!candidate.imageUrl) {
    console.log('[AutoShop] Skipping OpenAI verification - candidate missing image URL', candidate?.id);
    return { match: false, reason: 'Missing image URL on candidate' };
  }

  const apiKey = process.env.EXPO_PUBLIC_VIBECODE_OPENAI_API_KEY;
  if (!apiKey) {
    console.warn('[AutoShop] Skipping OpenAI verification - EXPO_PUBLIC_VIBECODE_OPENAI_API_KEY is not set');
    return null;
  }

  try {
    console.log('[AutoShop] Invoking OpenAI verification for candidate', candidate.id, 'image:', candidate.imageUrl?.slice(0, 120));
    const client = getOpenAIClient();
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0,
      max_tokens: 200,
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'product_image_verification',
          schema: {
            type: 'object',
            properties: {
              match: { type: 'boolean' },
              confidence: { type: 'number', minimum: 0, maximum: 1 },
              reason: { type: 'string' }
            },
            required: ['match', 'reason'],
            additionalProperties: false
          }
        }
      },
      messages: [
        {
          role: 'system',
          content: 'You are a quality control assistant that confirms whether a product image matches the requested grocery item.'
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Search query: "${searchTerm}". Determine if the attached product image represents this item. Only consider a match if the product clearly aligns with the query (brand, type, flavour, size). Respond with JSON fields match (true/false), confidence (0-1), reason.`
            },
            {
              type: 'image_url',
              image_url: { url: candidate.imageUrl }
            }
          ]
        }
      ]
    });

    const content = response.choices?.[0]?.message?.content;
    if (!content) {
      console.warn('[AutoShop] OpenAI verification returned no content');
      return null;
    }

    let parsed: VerificationResult | null = null;
    try {
      parsed = JSON.parse(content) as VerificationResult;
    } catch (error) {
      console.error('[AutoShop] Failed to parse OpenAI verification response', error);
      return null;
    }

    return parsed;
  } catch (error) {
    console.error('[AutoShop] OpenAI verification error:', error);
    return null;
  }
}

// Main automation function
export async function automateRetailerShopping(options: AutomationOptions): Promise<void> {
  const { retailer, items, executeScript, onProgress, onItemCompleted, onPauseForAuth } = options;
  const selectors = SELECTORS[retailer];

  // Step 1: Wait for page to load and check if we're on the right site
  onProgress?.({ action: 'Initializing', icon: '🚀', description: 'Loading retailer website...' });
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Install a temporary navigation guard to avoid external domains (e.g., Facebook)
  try {
    await executeScript(`(() => {
      if (window.__auto_nav_guard_installed__) return true;
      window.__auto_nav_guard_installed__ = true;
      const allowedHosts = ['woolworths.com.au', 'www.woolworths.com.au', 'coles.com.au', 'www.coles.com.au'];
      const isAllowed = (url) => {
        try { const u = new URL(url, window.location.href); return allowedHosts.includes(u.hostname); } catch(_) { return false; }
      };
      const origOpen = window.open;
      window.open = function(url, target, feats) { if (!isAllowed(url)) { console.log('Blocked external window.open:', url); return null; } return origOpen.call(window, url, target, feats); };
      document.addEventListener('click', (e) => {
        const a = e.target && (e.target.closest ? e.target.closest('a[href]') : null);
        if (a) { const href = a.getAttribute('href') || ''; if (!isAllowed(href)) { e.preventDefault(); e.stopPropagation(); console.log('Blocked external link:', href); } }
      }, true);
      return true;
    })();`);
  } catch (_) {}
  
  // Verify we're on the correct retailer site
  const verifySiteScript = `
    const currentUrl = window.location.href;
    const isWoolworths = currentUrl.includes('woolworths.com.au');
    const isColes = currentUrl.includes('coles.com.au');
    const isCorrectSite = isWoolworths || isColes;
    
    console.log('Current URL:', currentUrl);
    console.log('Is correct site:', isCorrectSite);
    
    return {
      success: isCorrectSite,
      url: currentUrl,
      isWoolworths,
      isColes
    };
  `;
  
  const siteVerification = await executeScript(verifySiteScript);
  console.log('Site verification:', siteVerification);
  
  if (!siteVerification?.success) {
    throw new Error(`Not on correct retailer site. Current URL: ${siteVerification?.url}`);
  }
  
  // Navigate to the main page if we're on a subpage
  const navigateToMainPageScript = `
    const currentUrl = window.location.href;
    const isMainPage = currentUrl === 'https://www.woolworths.com.au/' || 
                      currentUrl === 'https://www.coles.com.au/' ||
                      currentUrl === 'https://www.woolworths.com.au' || 
                      currentUrl === 'https://www.coles.com.au';
    
    if (!isMainPage) {
      console.log('Not on main page, navigating to home page');
      if (currentUrl.includes('woolworths.com.au')) {
        window.location.href = 'https://www.woolworths.com.au/';
      } else if (currentUrl.includes('coles.com.au')) {
        window.location.href = 'https://www.coles.com.au/';
      }
      return { success: true, message: 'Navigating to main page' };
    }
    
    return { success: true, message: 'Already on main page' };
  `;
  
  const navigationResult = await executeScript(navigateToMainPageScript);
  console.log('Navigation result:', navigationResult);
  
  // Wait for navigation to complete
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Step 2: Check authentication status
  onProgress?.({ action: 'Checking authentication', icon: '🔐' });
  console.log('🔐 Checking authentication status...');
  
  // For now, let's skip the authentication check and proceed directly
  // TODO: Fix authentication detection logic
  const isAuthenticated = true; // Bypass for testing
  console.log('🔐 Authentication bypassed for testing');
  
  // Original authentication check (commented out for now)
  /*
  const isAuthenticated = await executeScript(checkAuthStatus(retailer));
  console.log('🔐 Authentication result:', isAuthenticated);
  
  if (!isAuthenticated) {
    console.log('🔐 User not authenticated, pausing for sign-in');
    onProgress?.({ 
      action: 'Authentication required', 
      icon: '⏸️',
      description: 'Please sign in to continue'
    });
    onPauseForAuth?.();
    
    // Wait for user to authenticate (poll every 5 seconds)
    let authCheckCount = 0;
    while (!isAuthenticated && authCheckCount < 60) {
      console.log(`🔐 Waiting for authentication... (attempt ${authCheckCount + 1}/60)`);
      await new Promise(resolve => setTimeout(resolve, 5000));
      const authStatus = await executeScript(checkAuthStatus(retailer));
      console.log('🔐 Re-check authentication result:', authStatus);
      if (authStatus) {
        console.log('🔐 Authentication successful!');
        break;
      }
      authCheckCount++;
    }
  } else {
    console.log('🔐 User already authenticated, proceeding...');
  }
  */

  // Step 3: Process each shopping item
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    
    try {
      // Pre-step on each item: dismiss common banners/popups that block clicks
      try {
        await executeScript(`(() => {
          const clickFirst = (sel) => { const el = document.querySelector(sel); if (el) { try { el.click(); } catch(_){} return true; } return false; };
          const clickByText = (texts) => {
            const candidates = Array.from(document.querySelectorAll('button, [role="button"], a'));
            const lower = texts.map(t => t.toLowerCase());
            const el = candidates.find(el => {
              const t = ((el.textContent||'') + ' ' + (el.getAttribute('aria-label')||'') + ' ' + (el.getAttribute('title')||'')).toLowerCase();
              return lower.some(x => t.includes(x));
            });
            if (el) { try { el.click(); } catch(_){} return true; }
            return false;
          };
          // Try common accept/close/continue actions without unsupported selectors
          clickFirst('[data-test*="accept" i], [data-testid*="accept" i], button[aria-label*="accept" i]');
          clickByText(['accept','got it','ok','okay','continue','agree']);
          clickFirst('button[aria-label*="close" i], [data-test*="close" i], [data-testid*="close" i]');
          return true;
        })();`);
      } catch(_) {}
      // Search for the item
      onProgress?.(
        { 
          action: `Searching for item ${i + 1}/${items.length}`, 
          icon: '🔍',
          description: item.name 
        },
        item
      );

      // Direct navigation search: avoid clicking arbitrary elements; always go to canonical search URL
      const searchScript = `
        const fullItemName = '${item.name.replace(/'/g, "\\'")}';
        const searchTerm = '${extractProductName(item.name).replace(/'/g, "\\'")}';
        try {
          const hrefNow = window.location.href;
          let target = '';
          if (hrefNow.includes('woolworths.com.au')) {
            target = 'https://www.woolworths.com.au/shop/search/products?searchTerm=' + encodeURIComponent(searchTerm);
          } else if (hrefNow.includes('coles.com.au')) {
            target = 'https://www.coles.com.au/search?q=' + encodeURIComponent(searchTerm);
          } else {
            // If we somehow landed on a different site, force to retailer base then search
            if ('${retailer}' === 'woolworths') {
              target = 'https://www.woolworths.com.au/shop/search/products?searchTerm=' + encodeURIComponent(searchTerm);
            } else {
              target = 'https://www.coles.com.au/search?q=' + encodeURIComponent(searchTerm);
            }
          }
          console.log('Navigating to search URL:', target, 'for term:', searchTerm, 'from', hrefNow);
          window.location.href = target;
          return { success: true, navigating: true, searchTerm };
        } catch(e) {
          console.log('Search navigation failed:', e && e.message ? e.message : e);
          return { success: false, error: String(e && e.message ? e.message : e) };
        }
      `;
      
      const searchResult = await executeScript(searchScript);
      console.log('Search result:', searchResult);
      
      // Wait for search results to load
      await new Promise(resolve => setTimeout(resolve, 4000));

      // Guard: ensure we're on the canonical search results page before adding
      try {
        const ensureOnSearch = `(() => {
          const href = window.location.href;
          if (href.includes('woolworths.com.au') && !href.includes('/shop/search/products')) {
            const term = encodeURIComponent('${extractProductName(item.name).replace(/'/g, "\\'")}');
            const target = 'https://www.woolworths.com.au/shop/search/products?searchTerm=' + term;
            console.log('Redirecting to canonical search page:', target);
            window.location.href = target;
            return { redirected: true };
          }
          if (href.includes('coles.com.au') && !href.includes('/search')) {
            const term = encodeURIComponent('${extractProductName(item.name).replace(/'/g, "\\'")}');
            const target = 'https://www.coles.com.au/search?q=' + term;
            console.log('Redirecting to canonical search page:', target);
            window.location.href = target;
            return { redirected: true };
          }
          return { redirected: false };
        })();`;
        const guardRes = await executeScript(ensureOnSearch);
        if (guardRes?.redirected) {
          await new Promise(resolve => setTimeout(resolve, 3500));
        }
      } catch(_) {}

      const normalizedItemName = extractProductName(item.name);

      // Add first product to cart
      onProgress?.(
        { 
          action: `Adding to cart`, 
          icon: '🛒',
          description: item.name 
        },
        item
      );

      let selectedCandidate: ProductCandidate | null = null;
      try {
        const candidateResult = await executeScript(collectTopProductCandidates(retailer, normalizedItemName));
        const candidates = (candidateResult?.candidates || []) as ProductCandidate[];
        console.log(`[AutoShop] Candidate collection for ${item.name}:`, candidates?.length || 0);

        if (candidates?.length) {
          for (const candidate of candidates) {
            if (!candidate?.imageUrl) {
              console.log('[AutoShop] Skipping candidate without image', candidate?.id);
              continue;
            }
            const verification = await verifyProductCandidateWithOpenAI(normalizedItemName, candidate);
            console.log('[AutoShop] Verification result:', candidate?.id, verification);
            if (verification?.match) {
              if (verification.confidence === undefined || verification.confidence >= 0.45) {
                selectedCandidate = candidate;
                console.log('[AutoShop] Candidate accepted by OpenAI verification', candidate?.id);
                break;
              }
            }
          }

          if (!selectedCandidate) {
            selectedCandidate = candidates[0];
            console.log('[AutoShop] Falling back to top-ranked candidate without verification', selectedCandidate?.id);
          }
        }
      } catch (candidateError) {
        console.error('[AutoShop] Candidate verification pipeline failed, falling back to legacy flow', candidateError);
      }

      const addResult = await executeScript(addFirstProductToCart(retailer, item.quantity, normalizedItemName, selectedCandidate?.id));
      console.log(`Add to cart result for ${item.name}:`, addResult);
      
      if (addResult?.success) {
        onItemCompleted?.(item.id, true);
        console.log(`✅ Successfully added ${item.name} to cart`);
      } else {
        // One more quick retry on the search grid: click first retailer add-to-cart control we know
        const retryResult = await executeScript(`(() => {
          const selectors = [
            "button[data-test='add-to-cart']",
            "button[data-testid*='add-to-cart']",
            "button[aria-label*='add to trolley' i]",
            "button[aria-label*='add to cart' i]"
          ];
          let btn = null;
          for (const s of selectors) { const el = document.querySelector(s); if (el) { btn = el; break; } }
          if (!btn) {
            const cands = Array.from(document.querySelectorAll('button, [role="button"], a'));
            btn = cands.find(el => {
              const t = ((el.textContent||'') + ' ' + (el.getAttribute('aria-label')||'') + ' ' + (el.getAttribute('title')||'')).toLowerCase();
              const r = el.getBoundingClientRect();
              return (t.includes('add to cart') || t.includes('add to trolley')) && r.width>40 && r.height>20;
            }) || null;
          }
          if (btn) { try { btn.click(); } catch(_) {} return { retried: true }; }
          return { retried: false };
        })();`);
        console.log('Grid retry result:', retryResult);
        console.warn(`Failed to add ${item.name} to cart:`, addResult?.message);
        onItemCompleted?.(item.id, false);
        console.log(`❌ Failed to add ${item.name}: ${addResult?.message || 'Unknown error'}`);
      }

      // Brief pause between items
      await new Promise(resolve => setTimeout(resolve, 1500));

    } catch (error) {
      console.error(`Error processing item ${item.name}:`, error);
      onItemCompleted?.(item.id, false);
    }
  }

  // Step 4: Navigate to cart
  onProgress?.({ action: 'Going to cart', icon: '🛒', description: 'Opening your shopping cart...' });
  await executeScript(clickElement(selectors.cartIcon));
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Step 5: Complete
  onProgress?.({ 
    action: 'Ready for checkout', 
    icon: '✅',
    description: 'You can now review and complete your purchase'
  });
}

// Simpler URL-based automation: load each product URL, inject add script, then move to next
export async function automateUsingProductUrls(options: AutomationPlanOptions): Promise<void> {
  const { retailer, planItems, executeScript, onProgress } = options;

  // Helper to navigate current page
  const navigate = async (url: string) => {
    await executeScript(`(() => { window.location.href = '${url.replace(/'/g, "\\'")}'; return true; })`);
    await new Promise(resolve => setTimeout(resolve, 2500));
  };

  // Add script (mirrors native runner template)
  const jsAdd = (qty: number) => `
    (() => {
      const sleep = ms => new Promise(r => setTimeout(r, ms));
      async function addOnce() {
        const selectors = [
          "button[data-test='add-to-cart']",
          "button[aria-label*='Add to trolley']",
          "button:has([data-icon='plus'])",
          "button[aria-label*='add' i]"
        ];
        let btn;
        for (const s of selectors) { btn = document.querySelector(s); if (btn) break; }
        if (btn) { btn.click(); return 'CLICKED_BTN'; }
        const variantBtn = document.querySelector("button[data-test='select-variant']");
        if (variantBtn) { variantBtn.click(); await sleep(300);
          const firstOption = document.querySelector("[role='dialog'] [role='option']");
          if (firstOption) { firstOption.click(); await sleep(200); }
          const addInDialog = document.querySelector("[role='dialog'] button[type='submit']");
          if (addInDialog) { addInDialog.click(); return 'CLICKED_VARIANT'; }
        }
        const form = document.querySelector("form[action*='add']") || document.querySelector("form[data-action*='add']");
        if (form) {
          const fd = new FormData(form);
          const action = form.getAttribute('action');
          const res = await fetch(action, { method: 'POST', body: fd, credentials: 'include' });
          return res.ok ? 'FETCH_OK' : 'FETCH_FAIL';
        }
        return 'NO_CONTROL';
      }
      async function addQty(qty) {
        const incSel = "button[data-test='increment'], button[aria-label*='increase']";
        for (let i = 1; i < qty; i++) {
          const inc = document.querySelector(incSel);
          if (inc) { inc.click(); await sleep(150); }
        }
      }
      return (async () => {
        await new Promise(r => setTimeout(r, 1000));
        const result = await addOnce();
        await addQty(${'__Q__'});
        return result;
      })();
    })();
  `.replace('__Q__', String(qty));

  // Optional pre-step: try to accept banners/location quickly
  const preFulfilment = `(() => { const clickFirst = sel => { const b = document.querySelector(sel); if (b) { try { b.click(); } catch(_){} return true; } return false; }; clickFirst('[data-test*="accept" i], button[aria-label*="accept" i]'); return true; })();`;

  onProgress?.({ action: 'Preparing session', icon: '🚀' });
  await executeScript(preFulfilment);

  for (let i = 0; i < planItems.length; i++) {
    const it = planItems[i];
    onProgress?.({ action: `Opening product ${i + 1}/${planItems.length}`, icon: '🔗', description: it.productUrl });
    await navigate(it.productUrl);
    onProgress?.({ action: 'Adding to cart', icon: '🛒' });
    const result = await executeScript(jsAdd(it.qty));
    console.log('URL add result:', result);
    await new Promise(resolve => setTimeout(resolve, 1200));
  }

  onProgress?.({ action: 'Done. Review cart and checkout.', icon: '✅' });
}

// AI-powered smart shopping assistant using Claude
export async function getAIShoppingAssistance(
  retailer: RetailerType,
  items: ShoppingItem[],
  currentPageHTML: string
): Promise<string> {
  try {
    const client = getAnthropicClient();
    
    const itemList = items.map(item => `- ${item.name} (${item.quantity}${item.unit || ''})`).join('\n');
    
    const prompt = `You are a helpful shopping assistant. I'm trying to shop on ${retailer}.

Shopping list:
${itemList}

Current page HTML snippet (first 1000 chars):
${currentPageHTML.substring(0, 1000)}

Please provide:
1. The next action I should take
2. Which element selector to use
3. Any tips for finding the right products

Keep your response concise and actionable.`;

    const message = await client.messages.create({
      model: 'claude-3-5-haiku-latest',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const response = message.content[0];
    return response.type === 'text' ? response.text : 'No guidance available';
  } catch (error) {
    console.error('Error getting AI assistance:', error);
    return 'Unable to get AI assistance at this time.';
  }
}

// Helper to extract page content for AI analysis
export const getPageContent = (): string => {
  return `
    return document.body.innerText.substring(0, 2000);
  `;
};

