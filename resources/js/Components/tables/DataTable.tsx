import { router } from '@inertiajs/react';
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    ChevronUp,
    ChevronDown,
} from 'lucide-react';
import { useState  } from 'react';
import type {ReactNode} from 'react';

export interface Column<T> {
    key: string;
    label: string;
    sortable?: boolean;
    render?: (item: T) => ReactNode;
    className?: string;
}

interface DataTableProps<T extends { id: number | string }> {
    data: T[];
    columns: Column<T>[];
    pagination?: {
        currentPage: number;
        lastPage: number;
        perPage: number;
        total: number;
        from: number;
        to: number;
    };
    onPageChange?: (page: number) => void;
    onSort?: (key: string, direction: 'asc' | 'desc') => void;
    sortKey?: string;
    sortDirection?: 'asc' | 'desc';
    emptyMessage?: string;
    loading?: boolean;
    rowClassName?: (item: T) => string;
    onRowClick?: (item: T) => void;
}

export function DataTable<T extends { id: number | string }>({
    data,
    columns,
    pagination,
    onPageChange,
    onSort,
    sortKey,
    sortDirection,
    emptyMessage = 'No hay datos disponibles',
    loading = false,
    rowClassName,
    onRowClick,
}: DataTableProps<T>) {
    const handleSort = (key: string) => {
        if (onSort) {
            const newDirection =
                sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc';
            onSort(key, newDirection);
        }
    };

    return (
        <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    className={`px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400 ${
                                        column.sortable
                                            ? 'cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700'
                                            : ''
                                    } ${column.className ?? ''}`}
                                    onClick={() =>
                                        column.sortable &&
                                        handleSort(column.key)
                                    }
                                >
                                    <div className="flex items-center gap-1">
                                        {column.label}
                                        {column.sortable &&
                                            sortKey === column.key && (
                                                <span className="text-primary-500">
                                                    {sortDirection === 'asc' ? (
                                                        <ChevronUp className="h-4 w-4" />
                                                    ) : (
                                                        <ChevronDown className="h-4 w-4" />
                                                    )}
                                                </span>
                                            )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                        {loading ? (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="px-4 py-8 text-center text-gray-500"
                                >
                                    <div className="flex justify-center">
                                        <svg
                                            className="text-primary-500 h-6 w-6 animate-spin"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            />
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            />
                                        </svg>
                                    </div>
                                </td>
                            </tr>
                        ) : data.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                                >
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            data.map((item) => (
                                <tr
                                    key={item.id}
                                    className={`transition-colors ${
                                        onRowClick
                                            ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800'
                                            : ''
                                    } ${rowClassName?.(item) ?? ''}`}
                                    onClick={() => onRowClick?.(item)}
                                >
                                    {columns.map((column) => (
                                        <td
                                            key={column.key}
                                            className={`px-4 py-3 text-sm whitespace-nowrap text-gray-900 dark:text-gray-100 ${column.className ?? ''}`}
                                        >
                                            {column.render
                                                ? column.render(item)
                                                : ((
                                                      item as Record<
                                                          string,
                                                          unknown
                                                      >
                                                  )[column.key]?.toString() ??
                                                  '-')}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {pagination && pagination.lastPage > 1 && (
                <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Mostrando {pagination.from} a {pagination.to} de{' '}
                        {pagination.total} resultados
                    </div>
                    <div className="flex gap-1">
                        <button
                            onClick={() => onPageChange?.(1)}
                            disabled={pagination.currentPage === 1}
                            className="rounded p-1 hover:bg-gray-100 disabled:opacity-50 dark:hover:bg-gray-700"
                        >
                            <ChevronsLeft className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() =>
                                onPageChange?.(pagination.currentPage - 1)
                            }
                            disabled={pagination.currentPage === 1}
                            className="rounded p-1 hover:bg-gray-100 disabled:opacity-50 dark:hover:bg-gray-700"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>

                        {Array.from(
                            { length: Math.min(5, pagination.lastPage) },
                            (_, i) => {
                                let page: number;
                                if (pagination.lastPage <= 5) {
                                    page = i + 1;
                                } else if (pagination.currentPage <= 3) {
                                    page = i + 1;
                                } else if (
                                    pagination.currentPage >=
                                    pagination.lastPage - 2
                                ) {
                                    page = pagination.lastPage - 4 + i;
                                } else {
                                    page = pagination.currentPage - 2 + i;
                                }
                                return (
                                    <button
                                        key={page}
                                        onClick={() => onPageChange?.(page)}
                                        className={`min-w-[2rem] rounded px-2 py-1 text-sm ${
                                            pagination.currentPage === page
                                                ? 'bg-primary-500 text-white'
                                                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                );
                            },
                        )}

                        <button
                            onClick={() =>
                                onPageChange?.(pagination.currentPage + 1)
                            }
                            disabled={
                                pagination.currentPage === pagination.lastPage
                            }
                            className="rounded p-1 hover:bg-gray-100 disabled:opacity-50 dark:hover:bg-gray-700"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => onPageChange?.(pagination.lastPage)}
                            disabled={
                                pagination.currentPage === pagination.lastPage
                            }
                            className="rounded p-1 hover:bg-gray-100 disabled:opacity-50 dark:hover:bg-gray-700"
                        >
                            <ChevronsRight className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
