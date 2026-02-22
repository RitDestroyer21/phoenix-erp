import { ThemeSwitcher } from "@/components/theme-switcher";
export function Footer() {
  return (
     <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-2">
          <span>
            Powered by{" "}
            <a
              href="#"
              className="font-bold hover:bold"
              rel="noreferrer"
            >
              Rit Chakraborty
            </a>
          </span>
          <ThemeSwitcher />
      </footer>
  );
}
