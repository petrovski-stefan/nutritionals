export default function About() {
  return (
    <div className="px-4 py-8 sm:px-6 sm:py-12">
      <div className="border-border bg-surface-raised mx-auto max-w-4xl rounded-xl border p-6 shadow-sm sm:p-8">
        <header className="mb-6">
          <h1 className="text-text text-2xl font-bold sm:text-3xl">За нас и правна изјава</h1>
        </header>

        <section className="mb-6">
          <h2 className="text-text mb-2 text-xl font-semibold">1. Општо</h2>
          <p className="text-text">
            Платформата Nutriceni е информативен сервис кој собира јавно достапни информации за
            производи, нивните цени и попусти од локални аптеки. Целта е да ви помогне да споредите
            понуди. Со користење на платформата, вие се согласувате со овие услови.
          </p>
          <p className="text-text mt-2">
            Платформата не е официјален претставник на аптеките и не врши продажба или испорака на
            производи.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-text mb-2 text-xl font-semibold">2. Ограничување на одговорност</h2>
          <p className="text-text">
            Информациите на платформата се само информативни. Цените, попустите и достапноста може
            да се разликуваат од тоа што е прикажано, и не претставуваат гаранција или договорна
            обврска.
          </p>
          <p className="text-text mt-2">
            Платформата не презема одговорност за какви било штети, загуби или пропуштена добивка
            кои може да произлезат од користење на информациите.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-text mb-2 text-xl font-semibold">3. Потврда на информации</h2>
          <p className="text-text">
            Секогаш потврдете ги информациите директно кај аптеката или официјалниот продавач пред
            да извршите купување. Платформата е само за споредба и информативни цели.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-text mb-2 text-xl font-semibold">4. Податоци од трети страни</h2>
          <p className="text-text">
            Некои информации може да бидат обезбедени од трети страни или автоматизирани системи.
            Платформата не гарантира точност или законитост на тие податоци.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-text mb-2 text-xl font-semibold">5. Прифаќање</h2>
          <p className="text-text">
            Со користење на платформата, вие потврдувате дека сте ги прочитале и прифатиле овие
            услови. Доколку не се согласувате, ве молиме веднаш напуштете ја платформата Nutriceni.
          </p>
        </section>

        <section className="border-border border-t pt-4">
          <p className="text-text-muted mt-2 text-sm">Последно ажурирање: 01.03.2026</p>
        </section>
      </div>
    </div>
  );
}
