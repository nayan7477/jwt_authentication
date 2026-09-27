import apiClient from './ApiClient.jsx';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function ParentComponent() {
    return (
        <QueryClientProvider client={queryClient}>
            <childComponen />
        </QueryClientProvider>
    );
}


    const { isPending, error, data } = useQuery({
        queryKey: ['repoData'],
        queryFn: () => apiClient.post('login').then((res) => res.json()),
    });

