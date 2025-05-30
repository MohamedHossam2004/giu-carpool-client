import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import Cookies from 'js-cookie';

// Create auth link that adds the token to requests
const createAuthLink = () => {
  return setContext((_, { headers }) => {
    // Get the authentication token from cookies
    const token = Cookies.get('accessToken');
    
    // Return the headers to the context so httpLink can read them
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : "",
      }
    };
  });
};

// Create client for rides service
const ridesHttpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_RIDES_URI || 'https://3.239.254.154/graphql',
});

const ridesClient = new ApolloClient({
  link: createAuthLink().concat(ridesHttpLink),
  cache: new InMemoryCache(),
  name: 'rides-client',
});

// Create client for user service
const userHttpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_USER_URI || 'https://3.84.209.34/graphql',
  fetchOptions: {
    // @ts-ignore - This is a development-only setting
    rejectUnauthorized: process.env.NODE_ENV === 'production',
  },
});

const userClient = new ApolloClient({
  link: createAuthLink().concat(userHttpLink),
  cache: new InMemoryCache(),
  name: 'user-client',
});

// Create client for booking service
const bookingHttpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_BOOKING_URI || 'https://54.211.248.22/graphql',
});

const bookingClient = new ApolloClient({
  link: createAuthLink().concat(bookingHttpLink),
  cache: new InMemoryCache(),
  name: 'booking-client',
});

// Create client for payment service
const paymentHttpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_PAYMENT_URI || 'http://100.27.16.234:4002/',
});

const paymentClient = new ApolloClient({
  link: createAuthLink().concat(paymentHttpLink),
  cache: new InMemoryCache(),
  name: 'payment-client',
});

// Default client (for backward compatibility)
const client = ridesClient;

export { 
  client as default,
  ridesClient,
  userClient,
  bookingClient,
  paymentClient
};