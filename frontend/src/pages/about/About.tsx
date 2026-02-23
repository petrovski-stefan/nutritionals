export default function About() {
  return (
    <main className="bg-neutral min-h-screen px-4 py-12">
      <div className="mx-auto max-w-4xl rounded-2xl bg-white p-8 shadow-md">
        <header className="mb-6">
          <h1 className="text-dark text-3xl font-bold">Правна изјава и услови за користење</h1>
        </header>

        <section className="mb-6">
          <h2 className="text-dark mb-2 text-xl font-semibold">1. Општо</h2>
          <p className="text-dark/80">
            Платформата Nutritionals е информативен сервис кој собира јавно достапни информации за
            производи, нивните цени и попусти од локални аптеки. Целта е да ви помогне да споредите
            понуди. Со користење на платформата, вие се согласувате со овие услови.
          </p>
          <p className="text-dark/80 mt-2">
            Платформата не е официјален претставник на аптеките и не врши продажба или испорака на
            производи.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-dark mb-2 text-xl font-semibold">2. Ограничување на одговорност</h2>
          <p className="text-dark/80">
            Информациите на платформата се само информативни. Цените, попустите и достапноста може
            да се разликуваат од тоа што е прикажано, и не претставуваат гаранција или договорна
            обврска.
          </p>
          <p className="text-dark/80 mt-2">
            Платформата не презема одговорност за какви било штети, загуби или пропуштена добивка
            кои може да произлезат од користење на информациите.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-dark mb-2 text-xl font-semibold">3. Потврда на информации</h2>
          <p className="text-dark/80">
            Секогаш потврдете ги информациите директно кај аптеката или официјалниот продавач пред
            да извршите купување. Платформата е само за споредба и информативни цели.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-dark mb-2 text-xl font-semibold">4. Податоци од трети страни</h2>
          <p className="text-dark/80">
            Некои информации може да бидат обезбедени од трети страни или автоматизирани системи.
            Платформата не гарантира точност или законитост на тие податоци.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-dark mb-2 text-xl font-semibold">5. Прифаќање</h2>
          <p className="text-dark/80">
            Со користење на платформата, вие потврдувате дека сте ги прочитале и прифатиле овие
            услови. Доколку не се согласувате, ве молиме веднаш напуштете ја платформата
            Nutritionals.
          </p>
        </section>

        <section className="border-t border-neutral-100 pt-4">
          <p className="text-dark/60 mt-2 text-sm">Последно ажурирање: 15.02.2025</p>
        </section>
      </div>
    </main>
  );
}
