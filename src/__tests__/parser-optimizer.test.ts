import { describe, it, expect } from 'vitest';
import { parseFiltersToAST, combineAST, optimizeAST } from '@/lib/filter-engine';
import type { FilterRule, FilterASTNode } from '@/types';

describe('Parser', () => {
  it('returns empty and node for no rules', () => {
    const ast = parseFiltersToAST([]);
    expect(ast.type).toBe('and');
    if (ast.type === 'and') expect(ast.children).toHaveLength(0);
  });

  it('returns single rule node', () => {
    const rules: FilterRule[] = [{ id: '1', field: 'pe', operator: 'lt', value: 20, enabled: true }];
    const ast = parseFiltersToAST(rules);
    expect(ast.type).toBe('rule');
  });

  it('skips disabled rules', () => {
    const rules: FilterRule[] = [
      { id: '1', field: 'pe', operator: 'lt', value: 20, enabled: false },
      { id: '2', field: 'pb', operator: 'lt', value: 5, enabled: true },
    ];
    const ast = parseFiltersToAST(rules);
    expect(ast.type).toBe('rule');
  });

  it('combines AST nodes', () => {
    const node1: FilterASTNode = { type: 'rule', rule: { id: '1', field: 'pe', operator: 'lt', value: 20, enabled: true } };
    const node2: FilterASTNode = { type: 'rule', rule: { id: '2', field: 'pb', operator: 'lt', value: 5, enabled: true } };
    const combined = combineAST([node1, node2], 'or');
    expect(combined.type).toBe('or');
    const single = combineAST([node1], 'and');
    expect(single).toBe(node1);
    const empty = combineAST([], 'and');
    expect(empty.type).toBe('and');
  });
});

describe('Optimizer', () => {
  it('optimizes AND node ordering', () => {
    const ast: FilterASTNode = {
      type: 'and',
      children: [
        { type: 'rule', rule: { id: '1', field: 'rsi', operator: 'gt', value: 50, enabled: true } },
        { type: 'rule', rule: { id: '2', field: 'sector', operator: 'eq', value: 'Tech', enabled: true } },
      ],
    };
    const optimized = optimizeAST(ast);
    expect(optimized.type).toBe('and');
    if (optimized.type === 'and') {
      expect(optimized.children[0].type).toBe('rule');
      if (optimized.children[0].type === 'rule') {
        expect(optimized.children[0].rule.field).toBe('sector');
      }
    }
  });

  it('optimizes NOT node', () => {
    const ast: FilterASTNode = {
      type: 'not',
      child: { type: 'rule', rule: { id: '1', field: 'pe', operator: 'lt', value: 10, enabled: true } },
    };
    const optimized = optimizeAST(ast);
    expect(optimized.type).toBe('not');
  });

  it('optimizes OR node', () => {
    const ast: FilterASTNode = {
      type: 'or',
      children: [
        { type: 'rule', rule: { id: '1', field: 'pe', operator: 'lt', value: 10, enabled: true } },
        { type: 'rule', rule: { id: '2', field: 'sector', operator: 'eq', value: 'Tech', enabled: true } },
      ],
    };
    const optimized = optimizeAST(ast);
    expect(optimized.type).toBe('or');
  });
});
