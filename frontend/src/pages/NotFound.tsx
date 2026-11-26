import SectionCtaLink from '@/components/home/SectionCtaLink';

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-16 text-center sm:px-6">
      <title>Страницата не постои | Nutriceni</title>

      <p className="text-text-muted text-sm font-semibold">404</p>
      <h1 className="text-text text-2xl font-bold sm:text-3xl">Страницата не постои</h1>
      <p className="text-text-muted">Линкот можеби е застарен или погрешно напишан.</p>

      <div className="mt-2 flex flex-wrap justify-center gap-x-6 gap-y-2">
        <SectionCtaLink to="/">Почетна</SectionCtaLink>
        <SectionCtaLink to="/compare">Спореди цени</SectionCtaLink>
      </div>
    </div>
  );
}
