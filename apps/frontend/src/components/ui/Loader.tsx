export default function Loader({ text = "Chargement..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] p-8">
      <div className="w-10 h-10 border-4 border-gray-200 border-t-primary rounded-full animate-spin mb-4" />
      <p className="text-gray-500 font-medium animate-pulse">{text}</p>
    </div>
  );
}
