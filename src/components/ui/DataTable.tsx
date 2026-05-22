/**
 * DataTable Component
 * 
 * A reusable data table component with features:
 * - Pagination (client-side and server-side)
 * - Sorting
 * - Filtering
 * - Row selection (bulk actions)
 * - Responsive design
 * - Loading and error states
 * - Custom cell rendering
 * - Accessible with proper ARIA attributes
 */

'use client';

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight, 
  ArrowUp, 
  ArrowDown, 
  ArrowUpDown,
  Search,
  Filter,
  MoreVertical,
  X
} from 'lucide-react';
import { Button } from './Button';
import { Select } from './Select';
import { TextInput } from './TextInput';

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (value: any, item: T) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  error?: string | null;
  pagination?: {
    pageSize?: number;
    currentPage?: number;
    onPageChange?: (page: number) => void;
    totalItems?: number;
    serverSide?: boolean;
  };
  sorting?: {
    key: string;
    direction: 'asc' | 'desc';
    onSortChange?: (key: string, direction: 'asc' | 'desc') => void;
    serverSide?: boolean;
  };
  selection?: {
    selectedIds: Set<string | number>;
    onSelectionChange: (ids: Set<string | number>) => void;
    idKey: keyof T;
  };
  actions?: (item: T) => React.ReactNode;
  searchable?: boolean;
  searchPlaceholder?: string;
  className?: string;
  emptyMessage?: string;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  isLoading = false,
  error = null,
  pagination,
  sorting,
  selection,
  actions,
  searchable = false,
  searchPlaceholder = 'Search...',
  className = '',
  emptyMessage = 'No data available',
}: DataTableProps<T>) {
  // Client-side states (used if server-side is not enabled)
  const [clientPage, setClientPage] = useState(1);
  const [clientPageSize, setClientPageSize] = useState(pagination?.pageSize || 10);
  const [clientSort, setClientSort] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(
    sorting ? { key: sorting.key, direction: sorting.direction } : null
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [focusedRowIndex, setFocusedRowIndex] = useState<number>(-1);
  
  const tableRef = useRef<HTMLTableElement>(null);

  // Derived values
  const isServerSidePagination = pagination?.serverSide;
  const isServerSideSorting = sorting?.serverSide;
  const currentPage = isServerSidePagination ? (pagination?.currentPage || 1) : clientPage;
  const pageSize = isServerSidePagination ? (pagination?.pageSize || 10) : clientPageSize;
  
  // Filtering logic (client-side)
  const filteredData = useMemo(() => {
    if (isServerSidePagination || !searchTerm) return data;
    
    return data.filter(item => 
      Object.values(item).some(val => 
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [data, searchTerm, isServerSidePagination]);

  // Sorting logic (client-side)
  const sortedData = useMemo(() => {
    if (isServerSideSorting || !clientSort) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[clientSort.key];
      const bVal = b[clientSort.key];

      if (aVal === bVal) return 0;
      
      const multiplier = clientSort.direction === 'asc' ? 1 : -1;
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return aVal.localeCompare(bVal) * multiplier;
      }
      
      return (aVal < bVal ? -1 : 1) * multiplier;
    });
  }, [filteredData, clientSort, isServerSideSorting]);

  // Pagination logic (client-side)
  const paginatedData = useMemo(() => {
    if (isServerSidePagination) return sortedData;
    
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize, isServerSidePagination]);

  const totalItems = isServerSidePagination ? (pagination?.totalItems || 0) : sortedData.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  // Handlers
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    
    if (isServerSidePagination && pagination?.onPageChange) {
      pagination.onPageChange(page);
    } else {
      setClientPage(page);
    }
    
    // Scroll to top of table on page change
    tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const handleSort = (key: string) => {
    const column = columns.find(c => c.key === key);
    if (!column?.sortable) return;

    let direction: 'asc' | 'desc' = 'asc';
    
    if (clientSort?.key === key) {
      direction = clientSort.direction === 'asc' ? 'desc' : 'asc';
    }

    if (isServerSideSorting && sorting?.onSortChange) {
      sorting.onSortChange(key, direction);
    } else {
      setClientSort({ key, direction });
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selection) return;
    
    if (e.target.checked) {
      const allIds = paginatedData.map(item => item[selection.idKey]);
      selection.onSelectionChange(new Set(allIds));
    } else {
      selection.onSelectionChange(new Set());
    }
  };

  const handleSelectOne = (id: string | number) => {
    if (!selection) return;
    
    const newSelected = new Set(selection.selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    selection.onSelectionChange(newSelected);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (paginatedData.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedRowIndex(prev => Math.min(prev + 1, paginatedData.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedRowIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && focusedRowIndex >= 0) {
      if (selection) {
        const id = paginatedData[focusedRowIndex][selection.idKey];
        handleSelectOne(id);
      }
    }
  };

  // Reset page when search changes
  useEffect(() => {
    if (!isServerSidePagination) {
      setClientPage(1);
    }
  }, [searchTerm, isServerSidePagination]);

  return (
    <div className={`flex flex-col gap-4 ${className}`} onKeyDown={handleKeyDown}>
      {/* Table Header Controls */}
      {(searchable || selection?.selectedIds.size! > 0) && (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex-1 w-full md:max-w-xs relative">
            {searchable && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--mute)]" />
                <TextInput
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  aria-label="Search table"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--mute)] hover:text-[var(--foreground)]"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
          
          {selection && selection.selectedIds.size > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--surface-soft)] rounded-md border border-[var(--hairline)]">
              <span className="text-sm font-medium text-[var(--foreground)]">
                {selection.selectedIds.size} selected
              </span>
              <button
                onClick={() => selection.onSelectionChange(new Set())}
                className="text-xs text-[var(--mute)] hover:text-red-500 font-medium"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      )}

      {/* Table Container */}
      <div className="relative border border-[var(--hairline)] rounded-lg overflow-hidden bg-[var(--surface-card)]">
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 z-10 bg-[var(--surface-card)]/50 backdrop-blur-[1px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 animate-spin border-b-2 border-[var(--primary)] rounded-full" />
              <p className="text-sm font-medium text-[var(--mute)]">Loading data...</p>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table 
            ref={tableRef}
            className="w-full border-collapse text-left text-sm"
            role="grid"
            aria-busy={isLoading}
          >
            <thead className="bg-[var(--surface-soft)] border-b border-[var(--hairline)]">
              <tr>
                {selection && (
                  <th className="p-4 w-10">
                    <input
                      type="checkbox"
                      className="rounded border-[var(--hairline)] bg-[var(--surface-card)] text-[var(--primary)] focus:ring-[var(--primary)]/50"
                      checked={paginatedData.length > 0 && selection.selectedIds.size === paginatedData.length}
                      onChange={handleSelectAll}
                      aria-label="Select all rows"
                    />
                  </th>
                )}
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`
                      p-4 font-bold text-[var(--mute)] uppercase tracking-wider
                      ${column.sortable ? 'cursor-pointer hover:bg-[var(--surface-card)]/50 transition-colors' : ''}
                      ${column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'}
                    `}
                    style={{ width: column.width }}
                    onClick={() => column.sortable && handleSort(column.key)}
                    role="columnheader"
                    aria-sort={clientSort?.key === column.key ? (clientSort.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                  >
                    <div className={`flex items-center gap-2 ${column.align === 'center' ? 'justify-center' : column.align === 'right' ? 'justify-end' : 'justify-start'}`}>
                      {column.header}
                      {column.sortable && (
                        <span className="text-[var(--ash)]">
                          {clientSort?.key === column.key ? (
                            clientSort.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                          ) : (
                            <ArrowUpDown className="w-3 h-3 opacity-30" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
                {actions && <th className="p-4 w-20 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--hairline)] bg-[var(--surface-card)]">
              {paginatedData.length === 0 && !isLoading ? (
                <tr>
                  <td
                    colSpan={columns.length + (selection ? 1 : 0) + (actions ? 1 : 0)}
                    className="p-12 text-center text-[var(--mute)] italic"
                  >
                    {error || emptyMessage}
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, rowIndex) => {
                  const id = item[selection?.idKey || 'id'];
                  const isSelected = selection?.selectedIds.has(id);
                  
                  return (
                    <tr
                      key={id || rowIndex}
                      className={`
                        transition-colors duration-150
                        ${isSelected ? 'bg-[var(--primary)]/5 dark:bg-[var(--primary)]/10' : 'hover:bg-[var(--surface-soft)]/50'}
                        ${focusedRowIndex === rowIndex ? 'bg-[var(--surface-soft)]' : ''}
                      `}
                      role="row"
                      aria-selected={isSelected}
                    >
                      {selection && (
                        <td className="p-4">
                          <input
                            type="checkbox"
                            className="rounded border-[var(--hairline)] bg-[var(--surface-card)] text-[var(--primary)] focus:ring-[var(--primary)]/50"
                            checked={isSelected}
                            onChange={() => handleSelectOne(id)}
                            aria-label={`Select row ${rowIndex + 1}`}
                          />
                        </td>
                      )}
                      {columns.map((column) => (
                        <td
                          key={column.key}
                          className={`
                            p-4 text-[var(--foreground)]
                            ${column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'}
                            ${column.className || ''}
                          `}
                        >
                          {column.render
                            ? column.render(item[column.key], item)
                            : String(item[column.key] || '')}
                        </td>
                      ))}
                      {actions && (
                        <td className="p-4 text-right">
                          {actions(item)}
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-1 py-2">
          <p className="text-sm text-[var(--mute)]">
            Showing <span className="font-semibold text-[var(--foreground)]">{(currentPage - 1) * pageSize + 1}</span> to <span className="font-semibold text-[var(--foreground)]">{Math.min(currentPage * pageSize, totalItems)}</span> of <span className="font-semibold text-[var(--foreground)]">{totalItems}</span> results
          </p>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1 || isLoading}
              aria-label="First page"
            >
              <ChevronsLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || isLoading}
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Show pages around current page
                let pageNum = i + 1;
                if (totalPages > 5) {
                  if (currentPage > 3) {
                    pageNum = currentPage - 3 + i + 1;
                    if (pageNum > totalPages) pageNum = totalPages - 5 + i + 1;
                  }
                }
                
                if (pageNum <= 0 || pageNum > totalPages) return null;
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? 'primary' : 'ghost'}
                    size="sm"
                    className="w-8 h-8 p-0"
                    onClick={() => handlePageChange(pageNum)}
                    disabled={isLoading}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || isLoading}
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages || isLoading}
              aria-label="Last page"
            >
              <ChevronsRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
