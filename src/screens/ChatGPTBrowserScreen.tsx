import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, ArrowLeft, ArrowRight, ArrowClockwise } from 'phosphor-react-native';

interface ChatGPTBrowserScreenProps {
  onClose: () => void;
}

export default function ChatGPTBrowserScreen({ onClose }: ChatGPTBrowserScreenProps) {
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUrl, setCurrentUrl] = useState('https://chatgpt.com');

  const handleGoBack = () => {
    if (webViewRef.current && canGoBack) {
      webViewRef.current.goBack();
    }
  };

  const handleGoForward = () => {
    if (webViewRef.current && canGoForward) {
      webViewRef.current.goForward();
    }
  };

  const handleRefresh = () => {
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={handleGoBack}
            disabled={!canGoBack}
          >
            <ArrowLeft size={24} color={canGoBack ? '#333' : '#ccc'} weight="bold" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.navButton}
            onPress={handleGoForward}
            disabled={!canGoForward}
          >
            <ArrowRight size={24} color={canGoForward ? '#333' : '#ccc'} weight="bold" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.navButton} onPress={handleRefresh}>
            <ArrowClockwise size={24} color="#333" weight="bold" />
          </TouchableOpacity>
        </View>

        <View style={styles.headerCenter}>
          <Text style={styles.urlText} numberOfLines={1}>
            {currentUrl}
          </Text>
        </View>

        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <X size={24} color="#333" weight="bold" />
        </TouchableOpacity>
      </View>

      {/* Loading Indicator */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10A37F" />
          <Text style={styles.loadingText}>Loading ChatGPT...</Text>
        </View>
      )}

      {/* WebView */}
      <WebView
        ref={webViewRef}
        source={{ uri: 'https://chatgpt.com' }}
        style={styles.webview}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        onNavigationStateChange={(navState) => {
          setCanGoBack(navState.canGoBack);
          setCanGoForward(navState.canGoForward);
          setCurrentUrl(navState.url);
        }}
        // Allow cookies and storage for login
        sharedCookiesEnabled={true}
        thirdPartyCookiesEnabled={true}
        // Enable JavaScript
        javaScriptEnabled={true}
        domStorageEnabled={true}
        // User agent (optional - makes it look like a regular browser)
        userAgent="Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1"
        // Allow mixed content (http and https)
        mixedContentMode="always"
        // Enable zoom
        scalesPageToFit={true}
        // Allow file access
        allowFileAccess={true}
        // Optimize performance
        startInLoadingState={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    gap: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    gap: 8,
  },
  headerCenter: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  urlText: {
    fontSize: 13,
    color: '#666',
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  loadingContainer: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  webview: {
    flex: 1,
  },
});


