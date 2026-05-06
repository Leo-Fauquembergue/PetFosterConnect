import { Link } from "react-router-dom";

export default function Legal() {
  return (
    <div className="font-openSans text-gray-800 p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl md:text-4xl text-center font-montserrat font-bold mb-12 text-secondary">
        Mentions Légales
      </h1>

      <article className="space-y-12">
        <section className="bg-gray-50 p-8 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="text-xl font-montserrat font-bold mb-6 text-primary border-b border-primary/20 pb-2">
            Édition et Hébergement
          </h2>
          <div className="space-y-3 text-gray-700">
            <p>
              <span className="font-semibold text-secondary">Projet :</span> Pet Foster Connect
            </p>
            <p>
              <span className="font-semibold text-secondary">Équipe :</span> Groupe de 4
              développeurs
            </p>
            <p>
              <span className="font-semibold text-secondary">Environnement :</span> Docker /
              PostgreSQL
            </p>
            <p>
              <span className="font-semibold text-secondary">Contact :</span>{" "}
              <a
                href="mailto:contact@petfosterconnect.com"
                className="text-primary hover:underline"
              >
                contact@petfosterconnect.com
              </a>
            </p>
          </div>
        </section>

        <section className="px-4">
          <h2 className="text-xl font-montserrat font-bold mb-6 text-secondary">
            Droits de propriété intellectuelle
          </h2>
          <div className="space-y-4 text-gray-600 leading-relaxed text-sm md:text-base">
            <p>
              Le présent site est la propriété de Pet Foster Connect, qui en est l’auteur au sens
              des articles L.111.1 et suivants du Code de la propriété intellectuelle.
            </p>
            <p>
              Les photographies, textes, slogans, dessins, images, séquences animées sonores ou non
              ainsi que toutes œuvres intégrées dans le site sont la propriété de La Société
              Protectrice des Animaux ou de tiers ayant autorisé La Société Protectrice des Animaux
              à les utiliser.
            </p>
            <p>
              La reproduction, sur un support papier ou informatique, du site est autorisée sous
              réserve qu’elle soit strictement réservée à un usage personnel, excluant tout usage à
              des fins publicitaires et/ou commerciales et/ou d’informations.
            </p>
          </div>
        </section>

        <section className="px-4 border-t border-gray-100 pt-12">
          <h2 className="text-xl font-montserrat font-bold mb-6 text-secondary">
            Protection des données personnelles
          </h2>
          <div className="space-y-4 text-gray-600 leading-relaxed text-sm md:text-base">
            <p>
              Conformément au règlement (UE) 2016/679 du Parlement européen et du Conseil, toute
              personne dispose d’un droit d’accès, de rectification et de suppression de ses données
              personnelles.
            </p>
            <p>
              Les données collectées ne peuvent être utilisées qu’aux fins prévues par la loi et
              doivent être protégées contre tout accès non autorisé.
            </p>
            <p>
              Pour en savoir plus sur ces traitements, vous pouvez consulter notre{" "}
              <Link to="/confidentialite" className="text-primary font-semibold hover:underline">
                politique de confidentialité
              </Link>
              .
            </p>
          </div>
        </section>
      </article>
    </div>
  );
}
