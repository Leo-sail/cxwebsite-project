/**
 * Service Worker for Performance Optimization
 * 实现缓存策略和离线支持
 */

const CACHE_NAME = 'cms-app-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';
const API_CACHE = 'api-v1';

// 需要缓存的静态资源
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico'
];

// API 缓存策略配置
const API_CACHE_CONFIG = {
  maxAge: 5 * 60 * 1000, // 5分钟
  maxEntries: 100
};

// 静态资源缓存策略配置
const STATIC_CACHE_CONFIG = {
  maxAge: 24 * 60 * 60 * 1000, // 24小时
  maxEntries: 200
};

/**
 * 安装事件 - 预缓存静态资源
 */
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Static assets cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Failed to cache static assets', error);
      })
  );
});

/**
 * 激活事件 - 清理旧缓存
 */
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== API_CACHE) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim();
      })
  );
});

/**
 * 获取事件 - 实现缓存策略
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // 跳过非 GET 请求
  if (request.method !== 'GET') {
    return;
  }
  
  // 跳过 Chrome 扩展请求
  if (url.protocol === 'chrome-extension:') {
    return;
  }
  
  // API 请求缓存策略
  if (url.pathname.startsWith('/api/') || url.hostname.includes('supabase')) {
    event.respondWith(handleApiRequest(request));
    return;
  }
  
  // 静态资源缓存策略
  if (isStaticAsset(url)) {
    event.respondWith(handleStaticAsset(request));
    return;
  }
  
  // 页面请求缓存策略
  if (request.destination === 'document') {
    event.respondWith(handlePageRequest(request));
    return;
  }
  
  // 其他资源使用网络优先策略
  event.respondWith(handleOtherRequests(request));
});

/**
 * 处理 API 请求 - 网络优先，缓存备用
 */
async function handleApiRequest(request) {
  const cache = await caches.open(API_CACHE);
  
  try {
    // 尝试网络请求
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // 缓存成功的响应
      const responseClone = networkResponse.clone();
      await cache.put(request, responseClone);
      
      // 清理过期缓存
      await cleanExpiredCache(API_CACHE, API_CACHE_CONFIG);
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Network failed, trying cache for API request');
    
    // 网络失败，尝试缓存
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // 返回离线页面或错误响应
    return new Response(
      JSON.stringify({ error: '网络连接失败，请检查网络设置' }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * 处理静态资源 - 缓存优先，网络备用
 */
async function handleStaticAsset(request) {
  const cache = await caches.open(STATIC_CACHE);
  
  // 先检查缓存
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    // 后台更新缓存
    updateCacheInBackground(request, cache);
    return cachedResponse;
  }
  
  try {
    // 缓存未命中，请求网络
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const responseClone = networkResponse.clone();
      await cache.put(request, responseClone);
      
      // 清理过期缓存
      await cleanExpiredCache(STATIC_CACHE, STATIC_CACHE_CONFIG);
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Failed to fetch static asset', error);
    
    // 返回默认响应
    return new Response('资源加载失败', {
      status: 404,
      statusText: 'Not Found'
    });
  }
}

/**
 * 处理页面请求 - 网络优先，缓存备用
 */
async function handlePageRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // 缓存页面
      const cache = await caches.open(DYNAMIC_CACHE);
      const responseClone = networkResponse.clone();
      await cache.put(request, responseClone);
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Network failed, trying cache for page request');
    
    // 尝试缓存
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // 返回离线页面
    const offlineResponse = await cache.match('/');
    return offlineResponse || new Response('页面不可用', {
      status: 404,
      statusText: 'Not Found'
    });
  }
}

/**
 * 处理其他请求 - 网络优先
 */
async function handleOtherRequests(request) {
  try {
    return await fetch(request);
  } catch (error) {
    console.log('Service Worker: Failed to fetch other request', error);
    return new Response('请求失败', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

/**
 * 后台更新缓存
 */
async function updateCacheInBackground(request, cache) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      await cache.put(request, networkResponse);
    }
  } catch (error) {
    console.log('Service Worker: Background cache update failed', error);
  }
}

/**
 * 清理过期缓存
 */
async function cleanExpiredCache(cacheName, config) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  if (keys.length > config.maxEntries) {
    // 删除最旧的缓存项
    const keysToDelete = keys.slice(0, keys.length - config.maxEntries);
    await Promise.all(keysToDelete.map(key => cache.delete(key)));
  }
}

/**
 * 判断是否为静态资源
 */
function isStaticAsset(url) {
  const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.woff', '.woff2', '.ttf', '.eot'];
  return staticExtensions.some(ext => url.pathname.endsWith(ext));
}

/**
 * 消息处理 - 与主线程通信
 */
self.addEventListener('message', (event) => {
  const { type, payload } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'CLEAR_CACHE':
      clearAllCaches().then(() => {
        event.ports[0].postMessage({ success: true });
      }).catch((error) => {
        event.ports[0].postMessage({ success: false, error: error.message });
      });
      break;
      
    case 'GET_CACHE_SIZE':
      getCacheSize().then((size) => {
        event.ports[0].postMessage({ size });
      });
      break;
      
    default:
      console.log('Service Worker: Unknown message type', type);
  }
});

/**
 * 清理所有缓存
 */
async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(cacheNames.map(name => caches.delete(name)));
  console.log('Service Worker: All caches cleared');
}

/**
 * 获取缓存大小
 */
async function getCacheSize() {
  const cacheNames = await caches.keys();
  let totalSize = 0;
  
  for (const name of cacheNames) {
    const cache = await caches.open(name);
    const keys = await cache.keys();
    totalSize += keys.length;
  }
  
  return totalSize;
}

/**
 * 错误处理
 */
self.addEventListener('error', (event) => {
  console.error('Service Worker: Error occurred', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('Service Worker: Unhandled promise rejection', event.reason);
});

console.log('Service Worker: Script loaded');