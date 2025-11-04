import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../api/axiosInstance";

function useDataByUrl({ url, key, params }) {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: [key, url, ...(params ? Object.values(params) : [])],
        queryFn: async () => {
            const res = await axiosInstance.get(url, { params });
            return res.data;
        },
        staleTime: 1000 * 60 * 1,
        cacheTime: 1000 * 60 * 5,
        enabled: !!url,
    });

    return { data, isLoading, error, refetch };
}

export { useDataByUrl }; 