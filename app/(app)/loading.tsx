export default function AppLoading() {
  return (
    <div className="flex min-h-[70dvh] items-center justify-center">
      <div
        className="h-8 w-8 animate-spin rounded-full border-[3px] border-line border-t-wine"
        role="status"
        aria-label="Cargando"
      />
    </div>
  );
}
