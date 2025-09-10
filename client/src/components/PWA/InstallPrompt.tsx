import React, { useState } from 'react';
import { X, Download, Smartphone, Zap, Wifi, Bell } from 'lucide-react';
import { usePWA } from '../../hooks/usePWA';

interface InstallPromptProps {
  onClose?: () => void;
  className?: string;
}

export function InstallPrompt({ onClose, className = '' }: InstallPromptProps) {
  const { isInstallable, install } = usePWA();
  const [isInstalling, setIsInstalling] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  if (!isInstallable) {
    return null;
  }

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      const success = await install();
      if (success) {
        onClose?.();
      }
    } catch (error) {
      console.error('Installation failed:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleClose = () => {
    onClose?.();
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center ${className}`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md transform rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-6 shadow-2xl transition-all">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600">
            <Smartphone className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">
            Install MovieStreamer
          </h2>
          <p className="mt-2 text-slate-300">
            Get the full app experience on your device
          </p>
        </div>

        {/* Features */}
        <div className="mb-6 space-y-3">
          <div className="flex items-center gap-3 text-slate-200">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/20">
              <Zap className="h-4 w-4 text-green-400" />
            </div>
            <span className="text-sm">Faster loading and better performance</span>
          </div>
          
          <div className="flex items-center gap-3 text-slate-200">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20">
              <Wifi className="h-4 w-4 text-blue-400" />
            </div>
            <span className="text-sm">Works offline with cached content</span>
          </div>
          
          <div className="flex items-center gap-3 text-slate-200">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20">
              <Bell className="h-4 w-4 text-purple-400" />
            </div>
            <span className="text-sm">Push notifications for new movies</span>
          </div>
        </div>

        {/* Details toggle */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="mb-4 w-full text-left text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          {showDetails ? '▼' : '▶'} What happens when I install?
        </button>

        {/* Details */}
        {showDetails && (
          <div className="mb-6 rounded-lg bg-slate-800/50 p-4 text-sm text-slate-300">
            <ul className="space-y-2">
              <li>• Adds MovieStreamer to your home screen</li>
              <li>• Opens in full-screen mode like a native app</li>
              <li>• Caches movies for offline viewing</li>
              <li>• Enables push notifications (optional)</li>
              <li>• Takes up minimal storage space</li>
              <li>• Can be uninstalled anytime</li>
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 rounded-xl border border-slate-600 px-4 py-3 text-slate-300 hover:bg-slate-700 transition-colors"
          >
            Maybe Later
          </button>
          
          <button
            onClick={handleInstall}
            disabled={isInstalling}
            className="flex-1 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-3 font-semibold text-white hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 transition-all"
          >
            {isInstalling ? (
              <div className="flex items-center justify-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Installing...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Download className="h-4 w-4" />
                Install App
              </div>
            )}
          </button>
        </div>

        {/* Footer */}
        <p className="mt-4 text-center text-xs text-slate-400">
          Free • No account required • Works on all devices
        </p>
      </div>
    </div>
  );
}

// Compact install banner for mobile
export function InstallBanner({ onClose }: { onClose?: () => void }) {
  const { isInstallable, install } = usePWA();
  const [isInstalling, setIsInstalling] = useState(false);

  if (!isInstallable) {
    return null;
  }

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      const success = await install();
      if (success) {
        onClose?.();
      }
    } catch (error) {
      console.error('Installation failed:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <div className="fixed bottom-safe left-4 right-4 z-40 sm:hidden">
      <div className="rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 p-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
            <Smartphone className="h-5 w-5 text-white" />
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-white text-sm">
              Install MovieStreamer
            </p>
            <p className="text-white/80 text-xs">
              Get the app experience
            </p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-white/80 hover:bg-white/20 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
            
            <button
              onClick={handleInstall}
              disabled={isInstalling}
              className="rounded-lg bg-white/20 px-3 py-2 text-sm font-medium text-white hover:bg-white/30 disabled:opacity-50 transition-colors"
            >
              {isInstalling ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                'Install'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
