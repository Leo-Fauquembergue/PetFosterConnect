export default function PrivacyPolicy() {
  return (
    <div className="font-openSans text-gray-800 p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl md:text-4xl text-center font-montserrat font-bold mb-12 text-secondary">
        Politique de Confidentialité
      </h1>

      <article className="space-y-12">
        <section className="bg-primary/5 p-8 rounded-2xl border border-primary/10 shadow-sm">
          <p className="text-lg leading-relaxed text-gray-700">
            Votre vie privée et la sécurité de vos données sont importantes pour nous. Ce document
            décrit les informations collectées par Pet Foster Connect lorsque vous visitez ou
            utilisez notre plateforme.
          </p>
          <p className="mt-4 text-sm text-gray-600">Dernière mise à jour : 6 mai 2026.</p>
        </section>

        <div className="grid grid-cols-1 gap-12 px-4">
          <section>
            <h2 className="text-xl font-montserrat font-bold mb-4 text-secondary flex items-center gap-2">
              <span className="w-2 h-6 bg-primary rounded-full" />
              Définitions
            </h2>
            <div className="space-y-3 text-gray-600 leading-relaxed text-sm md:text-base">
              <p>
                En tant que client de ce service, vous êtes un "Utilisateur", "Visiteur" ou "Vous".
                Le site web ou tout service que nous proposons est désigné par les termes "site web"
                ou "service".
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-montserrat font-bold mb-4 text-secondary flex items-center gap-2">
              <span className="w-2 h-6 bg-primary rounded-full" />
              Données collectées
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed text-sm md:text-base">
              <p>
                Nous ne partageons, ne vendons, n’échangeons ou ne louons aucune information
                d'identification personnelle avec des tiers, sauf si la loi l'exige ou si vous
                violez nos conditions d'utilisation.
              </p>
              <p>
                Afin de fournir certaines fonctionnalités, nous pouvons faire appel à d'autres
                services tiers (paiement, communication, statistiques). Chacun de ces services a sa
                propre politique de confidentialité consultable sur leurs sites respectifs.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-montserrat font-bold mb-4 text-secondary flex items-center gap-2">
              <span className="w-2 h-6 bg-primary rounded-full" />
              RGPD & Droits des utilisateurs
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed text-sm md:text-base">
              <p>
                Le Règlement Général sur la Protection des Données (RGPD) encadre la protection des
                données et la vie privée pour les individus au sein de l'Union européenne.
              </p>
              <p>
                Vous avez le droit de savoir comment vos informations sont traitées, de demander une
                correction, une mise à jour ou une suppression de vos données. Pour toute question,
                contactez-nous à :{" "}
                <span className="text-primary font-semibold">admin@petfosterconnect.com</span>
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-montserrat font-bold mb-4 text-secondary flex items-center gap-2">
              <span className="w-2 h-6 bg-primary rounded-full" />
              Conservation & Sécurité
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed text-sm md:text-base">
              <p>
                Nous conservons les informations aussi longtemps que nécessaire pour vous fournir le
                service demandé. Les données sont protégées par des moyens commercialement
                acceptables pour éviter la perte, le vol ou l'accès non autorisé.
              </p>
              <p>
                Les mots de passe sont stockés sous forme de hachage et ne peuvent être récupérés.
              </p>
            </div>
          </section>

          <section className="border-t border-gray-100 pt-8 text-center italic text-gray-500 text-sm">
            <p>
              En utilisant notre site web, vous consentez à notre politique de confidentialité et
              acceptez ses conditions.
            </p>
          </section>
        </div>
      </article>
    </div>
  );
}
