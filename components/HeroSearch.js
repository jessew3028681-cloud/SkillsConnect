'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import SearchBar from './SearchBar';

export default function HeroSearch() {
  const router = useRouter();

  const handleSearch = (query) => {
    if (query.trim()) {
      router.push(`/browse?keyword=${encodeURIComponent(query.trim())}`);
    } else {
      router.push('/browse');
    }
  };

  return (
    <div className="w-100" style={{ maxWidth: '580px' }}>
      <SearchBar 
        placeholder="Try searching 'Plumbing', 'Electrical', 'Accra'..." 
        onSearch={handleSearch} 
      />
    </div>
  );
}
