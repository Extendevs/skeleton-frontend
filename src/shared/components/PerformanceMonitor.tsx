import { useState, useEffect } from 'react';
import { useMemoryMonitor } from '../hooks/usePerformanceMonitor';
import { SecureStorage } from '../../core/security/SecureStorage';

interface PerformanceMonitorProps {
  enabled?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

/**
 * Development Performance Monitor Component
 * Shows real-time performance metrics in development
 */
export const PerformanceMonitor = ({ 
  enabled = import.meta.env.DEV,
  position = 'bottom-right' 
}: PerformanceMonitorProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [storageStats, setStorageStats] = useState<any>(null);
  const memoryInfo = useMemoryMonitor(2000);

  useEffect(() => {
    if (!enabled) return;

    // Update storage stats periodically
    const interval = setInterval(() => {
      const stats = SecureStorage.getStorageStats();
      setStorageStats(stats);
    }, 5000);

    return () => clearInterval(interval);
  }, [enabled]);

  if (!enabled) return null;

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4'
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50`}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        title="Monitor de Rendimiento"
      >
        📊
      </button>

      {/* Monitor Panel */}
      {isVisible && (
        <div className="mt-2 bg-black bg-opacity-90 text-green-400 p-4 rounded-lg shadow-xl font-mono text-xs min-w-[300px]">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-bold text-white">Monitor de Rendimiento</h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-red-400 hover:text-red-300"
            >
              ✕
            </button>
          </div>

          {/* Memory Info */}
          {memoryInfo && (
            <div className="mb-3">
              <h4 className="text-white text-xs mb-1">Uso de Memoria:</h4>
              <div className="space-y-1">
                <div>Usado: {formatBytes(memoryInfo.usedJSHeapSize)}</div>
                <div>Total: {formatBytes(memoryInfo.totalJSHeapSize)}</div>
                <div>Límite: {formatBytes(memoryInfo.jsHeapSizeLimit)}</div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      (memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit) > 0.8
                        ? 'bg-red-500'
                        : (memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit) > 0.6
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                    style={{
                      width: `${(memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit) * 100}%`
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Storage Info */}
          {storageStats && (
            <div className="mb-3">
              <h4 className="text-white text-xs mb-1">Almacenamiento:</h4>
              <div className="space-y-1">
                <div>Elementos Totales: {storageStats.totalItems}</div>
                <div>Elementos Seguros: {storageStats.secureItems}</div>
                <div>Tamaño: ~{storageStats.estimatedSize} KB</div>
              </div>
            </div>
          )}

          {/* Performance Tips */}
          <div className="border-t border-gray-600 pt-2">
            <h4 className="text-white text-xs mb-1">Consejos:</h4>
            <div className="text-xs space-y-1">
              <div>• Usa React.memo() para componentes costosos</div>
              <div>• Implementa scroll virtual para listas grandes</div>
              <div>• Monitorea el tamaño del bundle con build:analyze</div>
            </div>
          </div>

          {/* Actions */}
          <div className="border-t border-gray-600 pt-2 mt-2">
            <button
              onClick={() => {
                if (window.gc) {
                  window.gc();
                  console.log('[Performance] Manual garbage collection triggered');
                } else {
                  console.warn('[Performance] Garbage collection not available');
                }
              }}
              className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700 mr-2"
            >
              Forzar GC
            </button>
            <button
              onClick={() => {
                SecureStorage.clearSecureStorage();
                localStorage.clear();
                sessionStorage.clear();
                console.log('[Performance] All storage cleared');
              }}
              className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700"
            >
              Limpiar Almacenamiento
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Type declaration for window.gc
declare global {
  interface Window {
    gc?: () => void;
  }
}
