export type BackendBrand = {
  id: number;
  name: string;
};

export type BackendBrandWithGroupCount = BackendBrand & {
  group_count: number;
};
