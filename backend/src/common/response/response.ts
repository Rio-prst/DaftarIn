export type ResponseMeta = {
  request_id?: string;
  [key: string]: unknown;
};

export class Response<T = unknown> {
  readonly status: string;
  readonly data?: T;
  readonly meta?: ResponseMeta;

  constructor({
    status,
    data,
    meta,
  }: {
    status: string;
    data?: T;
    meta?: ResponseMeta;
  }) {
    this.status = status;
    this.data = data;
    this.meta = meta;
  }
}
