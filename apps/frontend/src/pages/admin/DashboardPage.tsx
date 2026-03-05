export default function DashboardPage() {
  return (
    <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 h-full flex flex-col justify-center items-center text-center">
      <h1 className="text-3xl font-bold font-montserrat text-secondary mb-3">Tableau de Bord</h1>

      <p className="text-lg text-gray-500 font-openSans max-w-md">
        Bienvenue dans l'espace d'administration de{" "}
        <span className="text-primary font-semibold">Pet Foster Connect</span>.
      </p>

      <div className="mt-8 px-4 py-2 bg-orange-50 text-primary text-sm font-medium rounded-full">
        Sélectionnez un module dans le menu pour commencer.
      </div>
    </div>
  );
}
