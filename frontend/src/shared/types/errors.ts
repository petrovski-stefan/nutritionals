export type FlattenedClientError<T extends object> = {
  formErrors: string[];
  fieldErrors: {
    [K in keyof T]?: string[];
  };
};
