export default function HowToUse() {
  return (
    <main className="bg-neutral min-h-screen px-4 py-12">
      <div className="mx-auto max-w-4xl rounded-2xl bg-white p-8 shadow-md">
        <header className="mb-6">
          <h1 className="text-dark text-3xl font-bold">Упатство за користење</h1>
        </header>

        <section className="mb-6">
          <h2 className="text-dark mb-2 text-xl font-semibold">1. Почетна</h2>
          <p className="text-dark/80">
            <strong>Брзо пребарување:</strong> Внесете име на производ за брзо да ја пронајдете
            цената.
          </p>
          <p className="text-dark/80 mt-2">
            <strong>Најголеми попусти:</strong> Прегледајте ги суплементите со најголем тековен
            попуст.
          </p>
          <p className="text-dark/80 mt-2">
            <strong>Поддржани аптеки:</strong> Проверете колку производи може да пронајдете од
            секоја поддржана аптека.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-dark mb-2 text-xl font-semibold">2. Споредба</h2>
          <p className="text-dark/80">
            <strong>Групи на производи:</strong> Секоја група претставува истиот производ од
            различни аптеки.
          </p>
          <p className="text-dark/80 mt-2">
            <strong>Пребарување по бренд:</strong> Филтрирајте производи по бренд.
          </p>
          <p className="text-dark/80 mt-2">
            <strong>Филтрирање по категорија:</strong> Намалете го изборот по категории како
            Витамини, Минерали, Антиоксиданти, Рибини масла итн.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-dark mb-2 text-xl font-semibold">3. Паметно пребарување</h2>
          <p className="text-dark/80">
            <strong>Пребарување по здравствена цел:</strong> Внесете здравствена цел или проблем и
            добијте препораки од AI за суплементи.
          </p>
          <p className="text-dark/80 mt-2">
            <strong>Дополнителни филтри:</strong> Можете да ги филтрирате резултатите по аптека или
            категорија за поточни препораки.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-dark mb-2 text-xl font-semibold">4. Најава / Регистрација</h2>
          <p className="text-dark/80">
            <strong>Создајте профил:</strong> Регистрирајте се со корисничко име и лозинка (не е
            потребна е-пошта).
          </p>
          <p className="text-dark/80 mt-2">
            <strong>Предности:</strong> Откако ќе се најавите, можете да креирате и управувате со
            вашите листи на суплементи.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-dark mb-2 text-xl font-semibold">5. Листи</h2>
          <p className="text-dark/80">
            <strong>Управување со суплементи:</strong> Додајте или отстранете суплементи од вашите
            листи.
          </p>
          <p className="text-dark/80 mt-2">
            <strong>Организација:</strong> Креирајте нови листи, ажурирајте ги нивните имиња и
            бришете ги по потреба.
          </p>
        </section>

        <section className="border-t border-neutral-100 pt-4">
          <p className="text-dark/60 mt-2 text-sm">Последно ажурирање: 01.03.2026</p>
        </section>
      </div>
    </main>
  );
}
