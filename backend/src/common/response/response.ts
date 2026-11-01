export type ResponseMeta = {
  request_id?: string;
  [key: string]: unknown;
};

export class Response<T = unknown> {
  readonly data: T;
  readonly meta?: ResponseMeta;

  constructor({ data, meta }: { data: T; meta?: ResponseMeta }) {
    this.data = data;
    this.meta = meta;
  }
}
