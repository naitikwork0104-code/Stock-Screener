import type { FilterRule, FilterASTNode } from '@/types';

export function parseFiltersToAST(rules: FilterRule[]): FilterASTNode {
  const enabledRules = rules.filter((r) => r.enabled);
  if (enabledRules.length === 0) {
    return { type: 'and', children: [] };
  }
  if (enabledRules.length === 1) {
    return { type: 'rule', rule: enabledRules[0] };
  }
  return {
    type: 'and',
    children: enabledRules.map((rule) => ({ type: 'rule' as const, rule })),
  };
}

export function combineAST(nodes: FilterASTNode[], operator: 'and' | 'or'): FilterASTNode {
  if (nodes.length === 0) return { type: 'and', children: [] };
  if (nodes.length === 1) return nodes[0];
  return { type: operator, children: nodes };
}
