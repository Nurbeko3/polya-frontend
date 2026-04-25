import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background text-foreground">
      <div className="text-7xl font-extrabold text-primary">404</div>
      <div className="text-xl font-semibold">Sahifa topilmadi</div>
      <div className="text-sm text-muted-foreground">Siz qidirgan sahifa mavjud emas</div>
      <Link
        href="/"
        className="mt-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold text-sm no-underline hover:opacity-90 transition-opacity"
      >
        Bosh sahifaga qaytish
      </Link>
    </div>
  );
}
