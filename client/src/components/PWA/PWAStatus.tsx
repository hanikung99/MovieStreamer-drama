import React, { useState } from 'react';
import { 
  Wifi, 
  WifiOff, 
  Download, 
  RefreshCw, 
  Bell, 
  BellOff,
  Smartphone,
  HardDrive,
  Trash2,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { usePWA, usePushNotifications, useOfflineStorage } from '../../hooks/usePWA';

interface PWAStatusProps {
  className?: string;
}

export function PWAStatus({ className = '' }: PWAStatusProps) {
  const { 
    isInstalled, 
    isOffline, 
    isUpdateAvailable, 
    skipWaiting, 
    checkForUpdates 
  } = usePWA();
  
  const { 
    permission, 
    subscription, 
    requestPermission, 
    subscribe, 
    unsubscribe 
  } = usePushNotifications();
  
  const { 
    usage, 
    clearCache, 
    refreshUsage 
  } = useOfflineStorage();

  const [isUpdating, setIsUpdating] = useState(false);
  const [isClearingCache, setIsClearingCache] = useState(false);

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      await checkForUpdates();
      skipWaiting();
    } catch (error) {
      console.error('Update failed:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClearCache = async () => {
    setIsClearingCache(true);
    try {
      await clearCache();
      await refreshUsage();
    } catch (error) {
      console.error('Clear cache failed:', error);
    } finally {
      setIsClearingCache(false);
    }
  };

  const handleNotificationToggle = async () => {
    if (permission === 'granted' && subscription) {
      await unsubscribe();
    } else {
      const granted = await requestPermission();
      if (granted) {
        await subscribe();
      }
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStoragePercentage = () => {
    if (!usage || usage.quota === 0) return 0;
    return Math.round((usage.used / usage.quota) * 100);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Connection Status */}
      <div className="rounded-xl bg-slate-800/50 p-4">
        <div className="flex items-center gap-3 mb-3">
          {isOffline ? (
            <WifiOff className="h-5 w-5 text-red-400" />
          ) : (
            <Wifi className="h-5 w-5 text-green-400" />
          )}
          <h3 className="font-semibold text-white">
            Connection Status
          </h3>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-slate-300">
            {isOffline ? 'Offline' : 'Online'}
          </span>
          <div className={`h-2 w-2 rounded-full ${
            isOffline ? 'bg-red-400' : 'bg-green-400'
          }`} />
        </div>
        
        {isOffline && (
          <p className="mt-2 text-sm text-slate-400">
            You're offline. Cached content is still available.
          </p>
        )}
      </div>

      {/* App Installation Status */}
      <div className="rounded-xl bg-slate-800/50 p-4">
        <div className="flex items-center gap-3 mb-3">
          <Smartphone className="h-5 w-5 text-indigo-400" />
          <h3 className="font-semibold text-white">
            App Installation
          </h3>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-slate-300">
            {isInstalled ? 'Installed as App' : 'Running in Browser'}
          </span>
          {isInstalled ? (
            <CheckCircle className="h-5 w-5 text-green-400" />
          ) : (
            <Info className="h-5 w-5 text-slate-400" />
          )}
        </div>
        
        {isInstalled && (
          <p className="mt-2 text-sm text-slate-400">
            MovieStreamer is installed and running as a native app.
          </p>
        )}
      </div>

      {/* Updates */}
      {isUpdateAvailable && (
        <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-4">
          <div className="flex items-center gap-3 mb-3">
            <Download className="h-5 w-5 text-blue-400" />
            <h3 className="font-semibold text-white">
              Update Available
            </h3>
          </div>
          
          <p className="text-slate-300 mb-3">
            A new version of MovieStreamer is available.
          </p>
          
          <button
            onClick={handleUpdate}
            disabled={isUpdating}
            className="flex items-center gap-2 rounded-lg bg-blue-500 px-3 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-50 transition-colors"
          >
            {isUpdating ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Update Now
              </>
            )}
          </button>
        </div>
      )}

      {/* Push Notifications */}
      <div className="rounded-xl bg-slate-800/50 p-4">
        <div className="flex items-center gap-3 mb-3">
          {permission === 'granted' && subscription ? (
            <Bell className="h-5 w-5 text-green-400" />
          ) : (
            <BellOff className="h-5 w-5 text-slate-400" />
          )}
          <h3 className="font-semibold text-white">
            Push Notifications
          </h3>
        </div>
        
        <div className="flex items-center justify-between mb-3">
          <span className="text-slate-300">
            {permission === 'granted' && subscription ? 'Enabled' : 'Disabled'}
          </span>
          <button
            onClick={handleNotificationToggle}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              permission === 'granted' && subscription
                ? 'bg-green-500'
                : 'bg-slate-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                permission === 'granted' && subscription
                  ? 'translate-x-6'
                  : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        
        <p className="text-sm text-slate-400">
          {permission === 'granted' && subscription
            ? 'You\'ll receive notifications about new movies and updates.'
            : 'Enable notifications to stay updated with new content.'
          }
        </p>
      </div>

      {/* Storage Usage */}
      {usage && (
        <div className="rounded-xl bg-slate-800/50 p-4">
          <div className="flex items-center gap-3 mb-3">
            <HardDrive className="h-5 w-5 text-purple-400" />
            <h3 className="font-semibold text-white">
              Storage Usage
            </h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-300">Used</span>
              <span className="text-white font-medium">
                {formatBytes(usage.used)}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-300">Available</span>
              <span className="text-white font-medium">
                {formatBytes(usage.quota)}
              </span>
            </div>
            
            {/* Storage bar */}
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getStoragePercentage()}%` }}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">
                {getStoragePercentage()}% used
              </span>
              
              <button
                onClick={handleClearCache}
                disabled={isClearingCache}
                className="flex items-center gap-1 rounded-lg bg-slate-700 px-2 py-1 text-xs text-slate-300 hover:bg-slate-600 disabled:opacity-50 transition-colors"
              >
                {isClearingCache ? (
                  <>
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    Clearing...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3 w-3" />
                    Clear Cache
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PWA Features Info */}
      <div className="rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 p-4">
        <h3 className="font-semibold text-white mb-3">
          PWA Features Active
        </h3>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <span className="text-slate-300">Offline functionality</span>
          </div>
          
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <span className="text-slate-300">Background sync</span>
          </div>
          
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <span className="text-slate-300">Automatic updates</span>
          </div>
          
          <div className="flex items-center gap-2">
            {isInstalled ? (
              <CheckCircle className="h-4 w-4 text-green-400" />
            ) : (
              <AlertCircle className="h-4 w-4 text-yellow-400" />
            )}
            <span className="text-slate-300">App-like experience</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Compact status indicator
export function PWAStatusIndicator({ className = '' }: { className?: string }) {
  const { isOffline, isUpdateAvailable, isInstalled } = usePWA();
  const { permission, subscription } = usePushNotifications();

  const getStatusColor = () => {
    if (isOffline) return 'bg-red-500';
    if (isUpdateAvailable) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusText = () => {
    if (isOffline) return 'Offline';
    if (isUpdateAvailable) return 'Update Available';
    return 'Online';
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`h-2 w-2 rounded-full ${getStatusColor()}`} />
      <span className="text-xs text-slate-400">
        {getStatusText()}
      </span>
      
      {isInstalled && (
        <div className="flex items-center gap-1">
          <Smartphone className="h-3 w-3 text-indigo-400" />
          <span className="text-xs text-slate-400">PWA</span>
        </div>
      )}
      
      {permission === 'granted' && subscription && (
        <Bell className="h-3 w-3 text-green-400" />
      )}
    </div>
  );
}
