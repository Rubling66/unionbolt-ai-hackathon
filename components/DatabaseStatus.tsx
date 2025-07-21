'use client';

import { useDatabaseStatus } from '@/hooks/use-database-status';
import { Database, Wifi, WifiOff, Loader2 } from 'lucide-react';

export default function DatabaseStatus() {
  const { status } = useDatabaseStatus();

  return (
    <div className="flex items-center space-x-2 text-sm">
      <Database className="w-4 h-4 text-green-500" />
      <span className="text-muted-foreground">Database:</span>
      
      {status.loading ? (
        <div className="flex items-center space-x-1">
          <Loader2 className="w-3 h-3 animate-spin text-yellow-500" />
          <span className="text-yellow-500">Checking...</span>
        </div>
      ) : status.connected ? (
        <div className="flex items-center space-x-1">
          <Wifi className="w-3 h-3 text-green-500" />
          <span className="text-green-500">Connected</span>
        </div>
      ) : (
        <div className="flex items-center space-x-1">
          <WifiOff className="w-3 h-3 text-red-500" />
          <span className="text-red-500">Disconnected</span>
        </div>
      )}
    </div>
  );
}