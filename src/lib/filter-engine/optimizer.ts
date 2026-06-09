import type { FilterASTNode } from '@/types';

/** Reorder AND children: cheapest predicates first for short-circuit */
function getSelectivityEstimate(node: FilterASTNode): number {
  if (node.type === 'rule') {
    const field = node.rule.field;
    const cheapFields = new Set(['sector', 'industry', 'marketCapCategory', 'watchlistOnly', 'indices']);
    const mediumFields = new Set(['marketCap', 'price', 'changePercent', 'pe', 'pb']);
    if (cheapFields.has(field)) return 0.1;
    if (mediumFields.has(field)) return 0.3;
    return 0.5;
  }
  if (node.type === 'not') return getSelectivityEstimate(node.child);
  const childScores = node.children.map(getSelectivityEstimate);
  return node.type === 'and' ? Math.min(...childScores) : Math.max(...childScores);
}

export function optimizeAST(ast: FilterASTNode): FilterASTNode {
  if (ast.type === 'rule' || ast.type === 'not') {
    if (ast.type === 'not') return { type: 'not', child: optimizeAST(ast.child) };
    return ast;
  }

  const optimizedChildren = ast.children.map(optimizeAST);

  if (ast.type === 'and') {
    const sorted = [...optimizedChildren].sort(
      (a, b) => getSelectivityEstimate(a) - getSelectivityEstimate(b)
    );
    return { type: 'and', children: sorted };
  }

  return { type: ast.type, children: optimizedChildren };
}
