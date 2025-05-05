import React from 'react';
import FrontPageHeader from '@/components/frontpage/FrontPageHeader';
import FrontPageFooter from '@/components/frontpage/FrontPageFooter';
import HomePageContent from '@/components/frontpage/HomePageContent';

export default function HomePage() {
  const iconWrapperStyle = "text-white rounded-full p-2 cursor-pointer transition-opacity hover:opacity-80"; 
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <FrontPageHeader iconWrapperStyle={iconWrapperStyle}/>
      <HomePageContent />
      <FrontPageFooter iconWrapperStyle={iconWrapperStyle}/>
    </div>
  );
}