import type { PublicProductSortBy, PublicProductSortOrder } from "@market-place/shared/api";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

const DEFAULT_PAGE_SIZE = 12;
const DEFAULT_SORT_BY: PublicProductSortBy = "createdAt";
const DEFAULT_SORT_ORDER: PublicProductSortOrder = "desc";

const allowedSortBy: PublicProductSortBy[] = ["createdAt", "price", "name"];
const allowedSortOrder: PublicProductSortOrder[] = ["asc", "desc"];

function parsePositiveNumberParam(value: string | null, fallback: number) {
  const parsedValue = Number(value);

  if (!value || Number.isNaN(parsedValue) || parsedValue < 1) {
    return fallback;
  }

  return parsedValue;
}

type UseProductListSearchParamsOptions = {
  defaultPageSize?: number;
};

export function useProductListSearchParams(options: UseProductListSearchParamsOptions = {}) {
  const defaultPageSize = options.defaultPageSize ?? DEFAULT_PAGE_SIZE;
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get("search") ?? "");

  useEffect(() => {
    setSearchInput(searchParams.get("search") ?? "");
  }, [searchParams]);

  const params = useMemo(() => {
    const pageNumber = parsePositiveNumberParam(searchParams.get("pageNumber"), 1);
    const pageSize = parsePositiveNumberParam(searchParams.get("pageSize"), defaultPageSize);
    const categoryId = searchParams.get("categoryId") ?? undefined;
    const search = searchParams.get("search")?.trim() || undefined;
    const sortBy = allowedSortBy.includes(searchParams.get("sortBy") as PublicProductSortBy)
      ? (searchParams.get("sortBy") as PublicProductSortBy)
      : DEFAULT_SORT_BY;
    const sortOrder = allowedSortOrder.includes(searchParams.get("sortOrder") as PublicProductSortOrder)
      ? (searchParams.get("sortOrder") as PublicProductSortOrder)
      : DEFAULT_SORT_ORDER;

    return {
      pageNumber,
      pageSize,
      categoryId,
      search,
      sortBy,
      sortOrder,
    };
  }, [defaultPageSize, searchParams]);

  const updateParams = (updates: Record<string, string | undefined>) => {
    const nextParams = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (!value) {
        nextParams.delete(key);
        return;
      }

      nextParams.set(key, value);
    });

    setSearchParams(nextParams);
  };

  return {
    params,
    searchInput,
    setSearchInput,
    setCategory: (categoryId?: string) =>
      updateParams({
        categoryId,
        pageNumber: "1",
      }),
    submitSearch: (value: string) => {
      const nextSearch = value.trim();
      setSearchInput(value);
      updateParams({
        search: nextSearch || undefined,
        pageNumber: "1",
      });
    },
    setSortBy: (sortBy: PublicProductSortBy) =>
      updateParams({
        sortBy,
        pageNumber: "1",
      }),
    setSortOrder: (sortOrder: PublicProductSortOrder) =>
      updateParams({
        sortOrder,
        pageNumber: "1",
      }),
    setPage: (pageNumber: number) =>
      updateParams({
        pageNumber: String(pageNumber),
      }),
  };
}
