"use client"

import { usePathname } from 'next/navigation';
import Header from '@/app/header/page';

interface HeaderClientWrapperProps {
  isLoggedIn: boolean;
  userRole: string | null;
  userFirstName?: string;
  userLastName?: string;
  userAvatarUrl?: string;
}

export default function HeaderClientWrapper({
  isLoggedIn,
  userRole,
  userFirstName,
  userLastName,
  userAvatarUrl,
}: HeaderClientWrapperProps) {
  const pathname = usePathname();

  const hideHeader = pathname === '/auth/login' || pathname === '/auth/signup';

  if (hideHeader) {
    return null;
  }

  return (
    <Header 
      isLoggedIn={isLoggedIn} 
      userRole={userRole} 
      userFirstName={userFirstName} 
      userLastName={userLastName} 
      userAvatarUrl={userAvatarUrl} 
    />
  );
}
