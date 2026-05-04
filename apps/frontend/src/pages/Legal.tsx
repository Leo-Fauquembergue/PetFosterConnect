import { Link } from "react-router-dom";

export default function Legal() {
  return (
    <div className="font-openSans text-justify p-8 max-w-3xl mx-auto">
      <article className="p-8 max-w-3xl mx-auto">
        <section className="space-y-4 ">
          <h1 className="text-2xl text-center font-montserrat font-bold my-7">MENTIONS LÉGALES</h1>
          <p>Projet Pet Foster Connect - Équipe de 4 développeurs</p>
          <p>Hébergeur : Docker / PostgreSQL</p>
          <p>Contact : contact@petfosterconnect.com</p>
        </section>

        <section className="mt-6 space-y-4">
          <h2 className="text-2xl text-center font-montserrat font-bold my-7">
            Droits de propriété intellectuelle
          </h2>
          <p>
            Le présent site est la propriété de Pet Foster Connect, qui en est l’auteur au sens des
            articles L.111.1 et suivants du Code de la propriété intellectuelle.
          </p>
          <p>
            Les photographies, textes, slogans, dessins, images, séquences animées sonores ou non
            ainsi que toutes œuvres intégrées dans le site sont la propriété de La Société
            Protectrice des Animaux ou de tiers ayant autorisé La Société Protectrice des Animaux à
            les utiliser.
          </p>
          <p>
            La reproduction, sur un support papier ou informatique, du site est autorisée sous
            réserve qu’elle soit strictement réservée à un usage personnel, excluant tout usage à
            des fins publicitaires et/ou commerciales et/ou d’informations, et qu’elle soit conforme
            aux dispositions de l’article L122-5 du Code de la Propriété Intellectuelle.
          </p>
        </section>

        <section className="mt-6 space-y-4">
          <h2 className="text-2xl text-center font-montserrat font-bold my-7">
            Protection des données personnelles
          </h2>
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
            Pour exercer vos droits, vous pouvez nous contacter à l’adresse email suivante :
            contact@petfosterconnect.com
          </p>
          <p>
            Des traitements de données à caractère personnel sont réalisés à travers l’utilisation
            du site{" "}
            <Link to="/" className="text-primary" target="_blank" rel="noopener noreferrer">
              http://petfosterconnect.com
            </Link>
            . Pour en savoir plus sur ces traitements, vous pouvez consulter la{" "}
            <Link to="/confidentialite" className="text-primary underline">
              politique de confidentialité
            </Link>
            .
          </p>
        </section>
      </article>
    </div>
  );
}
