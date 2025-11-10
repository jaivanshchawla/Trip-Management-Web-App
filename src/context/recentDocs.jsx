import { createContext, useContext } from "react";
import useSWR from "swr";

// Define the RecentDocsCtx context
const RecentDocsCtx = createContext({
    documents: [],
    counts: {
        tripDocuments: 0,
        driverDocuments: 0,
        truckDocuments: 0,
        companyDocuments: 0,
        otherDocuments: 0,
    },
    docsLoading: false,
    error: null,
});

// Hook to use the RecentDocsCtx
export const useRecentDocsCtx = () => useContext(RecentDocsCtx);

// Fetcher function for SWR
const fetcher = (url) => fetch(url).then((res) => res.json());

// RecentDocumentsProvider component to provide the context
export const RecentDocumentsProvider = ({ children }) => {
    const { data, error, isLoading } = useSWR("/api/documents/recent", fetcher);

    // Handle case where data is still loading or unavailable
    const documents = data?.documents || [];
    const counts = data?.counts || {
        tripDocuments: 0,
        driverDocuments: 0,
        truckDocuments: 0,
        companyDocuments : 0,
        otherDocuments: 0,
    };

    return (
        <RecentDocsCtx.Provider
            value={{
                documents,
                counts,
                docsLoading: isLoading,
                error,
            }}
        >
            {children}
        </RecentDocsCtx.Provider>
    );
};
