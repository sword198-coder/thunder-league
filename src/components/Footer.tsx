export default function Footer() {
  return (
    <footer className="bg-primary text-white/70 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center">
              <span className="text-white font-bold text-xs">TL</span>
            </div>
            <span className="text-sm font-semibold text-white">
              Thunder<span className="text-secondary">League</span>
            </span>
          </div>
          <p className="text-xs text-white/50">
            &copy; {new Date().getFullYear()} Thunder League. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
