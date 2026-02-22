import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <Header />
          {/* Banner Section */}
          <section className="flex-1 flex flex-col items-center justify-center text-center px-6">
            
            {/* Branding Text */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight">
              Phoenix<span className="text-red-500">ERP</span>
            </h1>

            <p className="mt-6 text-lg md:text-xl text-gray-900 dark:text-gray-300 max-w-2xl">
              Rise. Transform. Scale your enterprise.
            </p>

            {/* Image BELOW Text */}
            <div className="mt-10">
              <Image
                src="/logo.png"   // put your image in /public folder
                alt="Phoenix Logo"
                width={670}
                height={500}
                className="object-contain"
                priority
              />
            </div>

          </section>
        <Footer />
      </div>
    </main>
  );
}
