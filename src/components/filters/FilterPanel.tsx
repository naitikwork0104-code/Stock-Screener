'use client';

import { useCallback } from 'react';
import { useFilterStore } from '@/stores/filter-store';
import { useFilterPresets } from '@/hooks/useStockData';
import { FILTER_FIELD_LABELS, ALL_FILTER_FIELDS } from '@/lib/filter-engine';
import type { FilterField, FilterOperator, FilterRule } from '@/types';
import { cn } from '@/lib/utils/format';

const OPERATORS: { value: FilterOperator; label: string }[] = [
  { value: 'eq', label: '=' },
  { value: 'neq', label: '≠' },
  { value: 'gt', label: '>' },
  { value: 'gte', label: '≥' },
  { value: 'lt', label: '<' },
  { value: 'lte', label: '≤' },
  { value: 'between', label: 'Between' },
  { value: 'in', label: 'In' },
  { value: 'contains', label: 'Contains' },
];

function FilterRuleRow({ rule }: { rule: FilterRule }) {
  const updateRule = useFilterStore((s) => s.updateRule);
  const removeRule = useFilterStore((s) => s.removeRule);
  const toggleRule = useFilterStore((s) => s.toggleRule);

  return (
    <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded" role="group" aria-label={`Filter: ${FILTER_FIELD_LABELS[rule.field]}`}>
      <input
        type="checkbox"
        checked={rule.enabled}
        onChange={() => toggleRule(rule.id)}
        aria-label={`Enable filter ${FILTER_FIELD_LABELS[rule.field]}`}
        className="rounded"
      />
      <select
        value={rule.field}
        onChange={(e) => updateRule(rule.id, { field: e.target.value as FilterField })}
        aria-label="Filter field"
        className="text-sm border rounded px-2 py-1 bg-white dark:bg-gray-700"
      >
        {ALL_FILTER_FIELDS.map((f) => (
          <option key={f} value={f}>{FILTER_FIELD_LABELS[f]}</option>
        ))}
      </select>
      <select
        value={rule.operator}
        onChange={(e) => updateRule(rule.id, { operator: e.target.value as FilterOperator })}
        aria-label="Filter operator"
        className="text-sm border rounded px-2 py-1 bg-white dark:bg-gray-700 w-20"
      >
        {OPERATORS.map((op) => (
          <option key={op.value} value={op.value}>{op.label}</option>
        ))}
      </select>
      <input
        type="text"
        value={String(rule.value)}
        onChange={(e) => {
          const val = e.target.value;
          const num = Number(val);
          updateRule(rule.id, { value: isNaN(num) ? val : num });
        }}
        aria-label="Filter value"
        className="text-sm border rounded px-2 py-1 bg-white dark:bg-gray-700 flex-1 min-w-0"
      />
      <button
        onClick={() => removeRule(rule.id)}
        aria-label={`Remove filter ${FILTER_FIELD_LABELS[rule.field]}`}
        className="text-red-500 hover:text-red-700 px-2"
      >
        ×
      </button>
    </div>
  );
}

export function FilterPanel({ resultCount, timing }: { resultCount: number; timing: { filterMs: number; total: number } }) {
  const rules = useFilterStore((s) => s.rules);
  const addRule = useFilterStore((s) => s.addRule);
  const clearRules = useFilterStore((s) => s.clearRules);
  const setRules = useFilterStore((s) => s.setRules);
  const searchQuery = useFilterStore((s) => s.searchQuery);
  const setSearchQuery = useFilterStore((s) => s.setSearchQuery);
  const { data: presets } = useFilterPresets();

  const handleAddRule = useCallback(() => {
    addRule({
      id: `rule-${Date.now()}`,
      field: 'pe',
      operator: 'lt',
      value: 20,
      enabled: true,
    });
  }, [addRule]);

  return (
    <div className="flex flex-col gap-3 p-4" role="search" aria-label="Stock filters">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Filters</h2>
        <span className="text-sm text-gray-500" aria-live="polite">
          {resultCount.toLocaleString()} results ({timing.filterMs.toFixed(0)}ms)
        </span>
      </div>

      <input
        type="search"
        placeholder="Search symbol or name..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        aria-label="Search stocks"
        className="w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800"
      />

      {presets && presets.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => setRules(preset.rules.map((r) => ({ ...r, id: `${r.id}-${Date.now()}` })))}
              className="px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full hover:bg-blue-200"
              aria-label={`Apply preset: ${preset.name}`}
            >
              {preset.name}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
        {rules.map((rule) => (
          <FilterRuleRow key={rule.id} rule={rule} />
        ))}
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleAddRule}
          className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + Add Filter
        </button>
        <button
          onClick={clearRules}
          className={cn('px-3 py-1.5 text-sm border rounded hover:bg-gray-100 dark:hover:bg-gray-700', rules.length === 0 && 'opacity-50')}
          disabled={rules.length === 0}
        >
          Clear All
        </button>
      </div>
    </div>
  );
}
