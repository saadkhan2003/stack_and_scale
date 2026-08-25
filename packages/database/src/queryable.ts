export type QueryResult<Row = Record<string, unknown>> = Readonly<{
  rows: Row[];
}>;

export type Queryable<Row = Record<string, unknown>> = Readonly<{
  query(text: string, values?: readonly unknown[]): Promise<QueryResult<Row>>;
}>;
