'use client';

import { ApolloProvider } from '@apollo/client';
import { ridesClient, userClient } from '@/lib/apollo-client';
import { ReactNode } from 'react';

export default function RideDetailsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ApolloProvider client={ridesClient}>
      <ApolloProvider client={userClient}>
        {children}
      </ApolloProvider>
    </ApolloProvider>
  );
}