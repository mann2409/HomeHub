import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { WebView, WebViewMessageEvent, WebViewNavigation } from 'react-native-webview';
import { ArrowCounterClockwise, BagSimple, ShoppingCartSimple, CaretLeft } from 'phosphor-react-native';
import type { RetailerKey } from '../api/mealdb';

interface RecipeWebViewScreenProps {
  url: string;
  retailer: RetailerKey;
  recipeName: string;
  onClose?: () => void;
}

const RETAILER_WEB_CONFIG: Record<RetailerKey, { hosts: string[]; recipePathMatch: string }> = {
  woolworths: {
    hosts: ['woolworths.com.au', 'www.woolworths.com.au'],
    recipePathMatch: '/shop/recipes/',
  },
  coles: {
    hosts: ['coles.com.au', 'www.coles.com.au'],
    recipePathMatch: '/recipes',
  },
};

const buildFallbackUrl = (name: string, retailer: RetailerKey): string => {
  const encoded = encodeURIComponent(name);
  if (retailer === 'coles') {
    return `https://www.coles.com.au/search?q=${encoded}&tab=recipes`;
  }
  return `https://www.woolworths.com.au/shop/search/recipes?searchTerm=${encoded}`;
};

const isAllowedHost = (hostname: string): boolean => {
  if (!hostname) return false;
  return (
    hostname === 'woolworths.com.au' ||
    hostname.endsWith('.woolworths.com.au') ||
    hostname === 'coles.com.au' ||
    hostname.endsWith('.coles.com.au')
  );
};

type ScriptPayload = {
  type: 'shop-success' | 'shop-fail' | 'add-success' | 'add-fail';
  status: string;
};

const createAutoClickScript = (
  matches: string[],
  successPayload: ScriptPayload,
  failurePayload: ScriptPayload
) => `
  (function() {
    const targets = ${JSON.stringify(matches.map(m => m.toLowerCase()))};
    const successPayload = ${JSON.stringify(successPayload)};
    const failurePayload = ${JSON.stringify(failurePayload)};
    let attempts = 0;
    const MAX_ATTEMPTS = 12;
    const tryClick = () => {
      attempts++;
      const elements = Array.from(document.querySelectorAll('button, [role="button"], a'));
      const target = elements.find(el => {
        if (!el || typeof el.innerText !== 'string') return false;
        const text = el.innerText.toLowerCase();
        return targets.some(match => text.includes(match));
      });
      if (target) {
        try { target.click(); } catch (e) {}
        if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
          window.ReactNativeWebView.postMessage(JSON.stringify(successPayload));
        }
        return true;
      }
      if (attempts >= MAX_ATTEMPTS) {
        if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
          window.ReactNativeWebView.postMessage(JSON.stringify(failurePayload));
        }
        return true;
      }
      return false;
    };
    if (tryClick()) { return true; }
    const timer = setInterval(() => {
      if (tryClick()) { clearInterval(timer); }
    }, 650);
    return true;
  })();
`;

const SHOP_RECIPE_SCRIPT = createAutoClickScript(
  ['shop recipe'],
  { type: 'shop-success', status: 'Opening "Shop recipe"…' },
  { type: 'shop-fail', status: 'Could not find the "Shop recipe" button yet. Scroll down and try again.' }
);

const ADD_TO_CART_SCRIPT = createAutoClickScript(
  ['add to cart', 'add cart', 'add all ingredients'],
  { type: 'add-success', status: 'Attempting to add all ingredients to your Woolworths cart…' },
  { type: 'add-fail', status: 'Could not find an "Add to cart" button yet. Once the shop page loads, try again.' }
);

const CHECK_ERROR_SCRIPT = `
  (function() {
    try {
      const text = document.body ? document.body.innerText.toLowerCase() : '';
      if (!text) { return true; }
      const signals = [
        "this page can't be reached",
        "error 404",
        "can't find the page you're looking for",
        "sorry, we can't find",
        "page not found"
      ];
      if (signals.some(signal => text.includes(signal))) {
        window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'page-error' }));
      }
    } catch (e) {}
    return true;
  })();
`;

const RecipeWebViewScreen: React.FC<RecipeWebViewScreenProps> = ({ url, retailer, recipeName, onClose }) => {
  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(url);
  const [autoShopTriggered, setAutoShopTriggered] = useState(false);
  const [autoAddScheduled, setAutoAddScheduled] = useState(false);
  const [fallbackAttempted, setFallbackAttempted] = useState(false);

  const handleShopRecipe = useCallback(() => {
    if (retailer !== 'woolworths') {
      setStatus('Shopping automation is currently available for Woolworths recipes only.');
      return;
    }
    setStatus('Looking for "Shop recipe"…');
    webViewRef.current?.injectJavaScript(SHOP_RECIPE_SCRIPT);
  }, [retailer]);

  const handleAddToCart = useCallback(() => {
    if (retailer !== 'woolworths') {
      setStatus('Shopping automation is currently available for Woolworths recipes only.');
      return;
    }
    setStatus('Looking for "Add to cart"…');
    webViewRef.current?.injectJavaScript(ADD_TO_CART_SCRIPT);
  }, [retailer]);

  useEffect(() => {
    setCurrentUrl(url);
    setAutoShopTriggered(false);
    setAutoAddScheduled(false);
    setFallbackAttempted(false);
    setStatus(`Loading ${retailer === 'coles' ? 'Coles' : 'Woolworths'} recipe…`);
  }, [url, retailer]);

  useEffect(() => {
    if (retailer !== 'woolworths') {
      return;
    }
    if (autoShopTriggered || loading) return;
    let shouldTrigger = true;
    try {
      const parsed = new URL(currentUrl);
      if (!parsed.pathname.includes(RETAILER_WEB_CONFIG.woolworths.recipePathMatch)) {
        shouldTrigger = false;
      }
    } catch {
      shouldTrigger = false;
    }
    if (shouldTrigger) {
      setAutoShopTriggered(true);
      handleShopRecipe();
    }
  }, [autoShopTriggered, loading, currentUrl, handleShopRecipe]);

  const handleMessage = useCallback((event: WebViewMessageEvent) => {
    const message = event.nativeEvent.data;
    if (!message) return;
    try {
      const payload: ScriptPayload = JSON.parse(message);
      if (payload?.status) {
        setStatus(payload.status);
      }
      if (payload?.type === 'shop-success' && !autoAddScheduled) {
        setAutoAddScheduled(true);
        setTimeout(() => {
          handleAddToCart();
        }, 1800);
      }
      if (payload?.type === 'page-error' && !fallbackAttempted) {
        setFallbackAttempted(true);
        const fallbackUrl = buildFallbackUrl(recipeName, retailer).replace(/'/g, "\\'");
        setStatus('Couldn’t open recipe directly; redirecting to search results…');
        webViewRef.current?.injectJavaScript(`
          (function() {
            window.location.href = '${fallbackUrl}';
          })();
          true;
        `);
      }
    } catch {
      if (!fallbackAttempted) {
        setStatus(message);
      }
    }
  }, [autoAddScheduled, handleAddToCart, fallbackAttempted, recipeName, retailer]);

  const handleNavigationChange = useCallback((navState: WebViewNavigation) => {
    setCanGoBack(navState.canGoBack);
    if (navState.url) {
      setCurrentUrl(navState.url);
    }
  }, []);

  const handleShouldStartLoad = useCallback((request: any) => {
    const { url: requestUrl } = request;
    if (!requestUrl) return false;
    if (requestUrl.startsWith('about:blank') || requestUrl.startsWith('javascript:')) {
      return false;
    }
    try {
      const parsed = new URL(requestUrl);
      if (!parsed.protocol.startsWith('http')) {
        return false;
      }
      return isAllowedHost(parsed.hostname);
    } catch (error) {
      return false;
    }
  }, []);

  const handleGoBack = useCallback(() => {
    if (canGoBack) {
      webViewRef.current?.goBack();
    } else {
      onClose?.();
    }
  }, [canGoBack, onClose]);

  const handleReload = useCallback(() => {
    setStatus('Refreshing…');
    webViewRef.current?.reload();
  }, []);

  const injectedBeforeContent = useMemo(
    () => `
      (function() {
        document.addEventListener('click', function(event) {
          const el = event.target;
          if (el && el.getAttribute && el.getAttribute('target') === '_blank') {
            el.removeAttribute('target');
          }
        }, true);
      })();
      true;
    `,
    []
  );

  const automationDisabled = retailer !== 'woolworths';

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ uri: url }}
        onLoadStart={() => {
          setLoading(true);
          setStatus(null);
        }}
        onLoadEnd={() => {
          setLoading(false);
          webViewRef.current?.injectJavaScript(CHECK_ERROR_SCRIPT);
        }}
        onMessage={handleMessage}
        onNavigationStateChange={handleNavigationChange}
        onShouldStartLoadWithRequest={handleShouldStartLoad}
        injectedJavaScriptBeforeContentLoaded={injectedBeforeContent}
        allowsBackForwardNavigationGestures
      />

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      )}

      <View style={styles.actionsBar}>
        <TouchableOpacity style={[styles.actionButton, !canGoBack && styles.actionButtonDisabled]} onPress={handleGoBack} disabled={!canGoBack}>
          <CaretLeft size={18} color={canGoBack ? '#1A1B2E' : '#8E93A6'} weight="bold" />
          <Text style={[styles.actionButtonText, !canGoBack && styles.actionButtonTextDisabled]}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleReload}>
          <ArrowCounterClockwise size={18} color="#1A1B2E" weight="bold" />
          <Text style={styles.actionButtonText}>Reload</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.actionButton,
            automationDisabled && styles.actionButtonDisabled,
          ]}
          onPress={handleShopRecipe}
          disabled={automationDisabled}
        >
          <BagSimple size={18} color="#1A1B2E" weight="bold" />
          <Text
            style={[
              styles.actionButtonText,
              automationDisabled && styles.actionButtonTextDisabled,
            ]}
          >
            {retailer === 'woolworths' ? 'Shop recipe' : 'Open recipe'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.actionButton,
            automationDisabled && styles.actionButtonDisabled,
          ]}
          onPress={handleAddToCart}
          disabled={automationDisabled}
        >
          <ShoppingCartSimple size={18} color="#1A1B2E" weight="bold" />
          <Text
            style={[
              styles.actionButtonText,
              automationDisabled && styles.actionButtonTextDisabled,
            ]}
          >
            Add to cart
          </Text>
        </TouchableOpacity>
      </View>

      {status && (
        <View style={styles.statusBar}>
          <Text style={styles.statusText}>{status}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121429',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(10, 11, 24, 0.2)',
    zIndex: 10,
  },
  actionsBar: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(26, 27, 46, 0.12)',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  actionButtonDisabled: {
    backgroundColor: '#F1F2F7',
  },
  actionButtonText: {
    color: '#1A1B2E',
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtonTextDisabled: {
    color: '#8E93A6',
  },
  statusBar: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    paddingTop: 4,
    backgroundColor: '#121429',
  },
  statusText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
  },
});

export default RecipeWebViewScreen;
