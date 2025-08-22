import { useState, useMemo } from "react";

export const usePagination = (data, itemsPerPage) => {
  const [currentPage, setCurrentPage] = useState(1);

  const { currentItems, totalPages, visiblePageNumbers } = useMemo(() => {
    const totalItems = data.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;

    const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

    // Visible page numbers logic
    const range = 5; // Number of visible pages
    const start = Math.max(1, currentPage - Math.floor(range / 2));
    const end = Math.min(totalPages, start + range - 1);
    const visiblePageNumbers = Array.from(
      { length: end - start + 1 },
      (_, i) => start + i
    );

    return { currentItems, totalPages, visiblePageNumbers };
  }, [data, currentPage, itemsPerPage]);

  return {
    currentItems,
    totalPages,
    visiblePageNumbers,
    currentPage,
    setCurrentPage,
  };
};
