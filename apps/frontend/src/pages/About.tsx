export default function About() {
  return (
    <div className="font-openSans text-gray-800 p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl md:text-4xl text-center font-montserrat font-bold mb-12 text-secondary">
        À propos de nous
      </h1>

      <article className="space-y-16">
        <section className="relative">
          <div className="absolute -left-4 top-0 bottom-0 w-1 bg-primary/20 rounded-full" />
          <h2 className="text-2xl font-montserrat font-bold mb-6 text-primary flex items-center gap-3">
            Une mission de cœur
          </h2>
          <div className="text-lg leading-relaxed space-y-4">
            <p>
              Chez Pet Foster Connect, nous croyons que chaque animal mérite une seconde chance.
              Notre plateforme solidaire est née d’un constat simple : les refuges débordent, et
              trop d’animaux attendent désespérément un foyer.
            </p>
            <p>
              Notre rôle est de créer ce lien précieux entre les associations de protection animale
              et les particuliers prêts à ouvrir leur maison et leur cœur, que ce soit pour un
              accueil temporaire ou une adoption définitive.
            </p>
          </div>
        </section>

        <section className="bg-gray-50 p-8 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="text-2xl font-montserrat font-bold mb-6 text-secondary">
            Pourquoi nous existons
          </h2>
          <div className="text-lg leading-relaxed space-y-6">
            <p>
              Chaque jour, des chiens, chats et autres compagnons sont abandonnés ou maltraités. Les
              refuges, saturés, manquent d’espace et de moyens.
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 list-none">
              {[
                "Les annonces d’adoption se perdent dans les réseaux sociaux.",
                "Les associations passent des heures à trier des candidatures.",
                "Les particuliers peinent à trouver l’animal qui leur correspond.",
                "Les délais d'attente en refuge sont trop longs.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 bg-white p-4 rounded-xl shadow-sm">
                  <span className="text-primary font-bold">✓</span>
                  <span className="text-sm md:text-base text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
            <p className="font-semibold text-primary pt-4 italic">Nous avons voulu changer cela.</p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-montserrat font-bold mb-6 text-secondary">Notre promesse</h2>
          <div className="text-lg leading-relaxed space-y-6">
            <p>
              Pet Foster Connect est bien plus qu’une plateforme : c’est un pont entre les animaux
              en détresse et les personnes prêtes à leur offrir une nouvelle vie.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                {
                  title: "Centralisation",
                  desc: "Tous les profils d'animaux sur un seul espace.",
                },
                {
                  title: "Simplicité",
                  desc: "Des formulaires clairs et adaptés aux besoins.",
                },
                {
                  title: "Soutien",
                  desc: "Un tableau de bord pour faire gagner du temps aux refuges.",
                },
                {
                  title: "Responsabilité",
                  desc: "Des informations précises pour chaque candidat.",
                },
              ].map((item) => (
                <div key={item.title} className="border-l-4 border-primary/30 pl-4 py-2">
                  <h3 className="font-bold text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="text-center pt-8 border-t border-gray-100">
          <h2 className="text-2xl font-montserrat font-bold mb-6 text-secondary">
            Ensemble, sauvons des vies
          </h2>
          <p className="text-lg leading-relaxed max-w-2xl mx-auto">
            Chaque accueil temporaire est une bouffée d’air pour un refuge. Chaque adoption est une
            histoire qui commence. Avec Pet Foster Connect, nous voulons que ces histoires se
            multiplient, et que plus aucun animal ne reste dans l’ombre.
          </p>
        </section>
      </article>
    </div>
  );
}
