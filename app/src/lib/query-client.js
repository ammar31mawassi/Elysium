import { QueryClient } from '@tanstack/react-query';

export const APP_QUERY_STALE_TIME_MS = 5 * 60 * 1000;
export const APP_QUERY_GC_TIME_MS = 30 * 60 * 1000;

export const queryClientInstance = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			retry: 1,
			staleTime: APP_QUERY_STALE_TIME_MS,
			gcTime: APP_QUERY_GC_TIME_MS,
		},
	},
});
