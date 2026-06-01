import React from 'react';
import { useInfiniteScrewQuery } from 'reactscrew';

export default function App() {
  const { data, fetchNextPage, hasNextPage, isFetching, pageParams } =
    useInfiniteScrewQuery('post', 'list', {
      initialPageParam: 1,
      getNextPageParam: (_lastPage, _pages, currentPage) =>
        currentPage < 3 ? currentPage + 1 : undefined
    });

  return (
    <div>
      <h1>Infinite Posts</h1>
      <p>Loaded pages: {pageParams.join(', ')}</p>
      <pre>{JSON.stringify(data, null, 2)}</pre>
      <button disabled={!hasNextPage || isFetching} onClick={() => fetchNextPage()}>
        Load next page
      </button>
    </div>
  );
}
