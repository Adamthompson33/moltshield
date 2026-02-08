'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function EnlistPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to scan page with matrix tab
    router.push('/scan?tab=matrix');
  }, [router]);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#07080a',
      color: '#e2e4e9',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: 16,
    }}>
      <div style={{ fontSize: 48 }}>🚨</div>
      <div style={{ fontSize: 14, color: '#6b7280' }}>
        Redirecting to Defense Matrix...
      </div>
    </div>
  );
}
