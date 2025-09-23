const PHARMACY_MAP = {
  '24 Apteka': 'apteka24',
  Annifarm: 'annifarm',
};

type Props = {
  search: string | null;
};

export default function Filters({ search }: Props) {
  const pharmacyFiltersElements = Object.entries(PHARMACY_MAP).map(([key, value]) => (
    <div key={key}>
      <input
        type="radio"
        value={value}
      />
      {key}
    </div>
  ));

  return (
    <div className="flex w-[20%] flex-col">
      <div>
        <p>Search</p>
        <input
          className="w-[70%] rounded-2xl border-2 px-4 outline-none"
          type="text"
          name="query"
          placeholder="Ex. vitamin c ..."
          value={search ?? ''}
        />
      </div>
      <div>
        <p>Available</p>
        <div>
          <input type="radio" />
          <span>All</span>
          <input type="radio" />
          <span>No</span>
        </div>
      </div>
      <div>
        <p>By pharmacy name:</p>
        {pharmacyFiltersElements}
      </div>
    </div>
  );
}
