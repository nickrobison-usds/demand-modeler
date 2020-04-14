type Issues = (Date | stirng)[][]

type RuleResult = {
  rule: string;
  headers: string[];
  issues: Issues;
  total: number;
};
