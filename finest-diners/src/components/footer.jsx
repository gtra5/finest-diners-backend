import { ArrowRight } from "lucide-react";

export default function FooterStatement() {
  return (
    <>
     <style>{`@import url('https://fonts.googleapis.com/css2?family=Mouse+Memoirs&display=swap');`}</style>
    <footer
      className="bg-[#050A0A] text-emerald-50"
      
    >
      <div className="mx-auto max-w-7xl px-6 pt-20">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-7">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#6B7C2F]">
              Now taking reservations
            </p>
            <h3 className="mt-4 font-serif text-3xl leading-snug text-emerald-50 md:text-4xl"
            
            >
              A seat at our table is the best gift you can give yourself this
              season.
            </h3>
            <button className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#6B7C2F] px-6 py-3 text-lg font-bold text-black border-2 border border-white transition hover:bg-amber-200"
            style={{
              fontFamily: "Mouse Memoirs, serif",
            }}
            >
              Book a table
              <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#fff",
                    color:"black",
                    borderRadius: "50%",
                    width: "clamp(28px, 4vw, 36px)",
                    height: "clamp(28px, 4vw, 36px)",
                    flexShrink: 0,
                  }}
                >
               <ArrowRight className="h-4 w-4" />
               </span>
            </button>
          </div>

          <div className="md:col-span-5">
            <div className="grid grid-cols-2 gap-8 text-sm">
              <div>
                <h4 className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#6B7C2F]">
                  Explore
                </h4>
                <ul className="mt-4 space-y-2 text-emerald-100">
                  <li>
                    <a href="#" className="hover:text-amber-300">
                      Menu
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-amber-300">
                      Reservations
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-amber-300">
                      Events
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-amber-300">
                      Gift Cards
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#6B7C2F]">
                  Contact
                </h4>
                <ul className="mt-4 space-y-2 text-emerald-100">
                  <li>128 Linden Ave</li>
                  <li>Brooklyn, NY</li>
                  <li>+1 (212) 555 0182</li>
                  <li>hello@finestdiners.com</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Oversized wordmark */}
        <div className=" overflow-hidden text-center">
          <h2
            className="select-none whitespace-nowrap"
            style={{
              fontSize: "clamp(80px, 20vw, 320px)",
              fontWeight: 900,
              color: "#6B7C2F",
              WebkitTextStroke: "1px #FFFFFF",
              letterSpacing: "-0.27em",
              lineHeight: 1,
              pointerEvents: "none",
              userSelect: "none",
              fontFamily: "Arial Black, sans-serif",
            }}
          >
            Finest Diners
          </h2>
        </div>

        <div className="flex flex-col items-start justify-between gap-4 border-t border-emerald-50/15 py-6 text-xs text-emerald-200/70 md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} Finest Diners — Brooklyn, NY</p>
          <div className="flex items-center gap-5">
            <a href="#" className="hover:text-amber-300">
              Instagram
            </a>
            <a href="#" className="hover:text-amber-300">
              Facebook
            </a>
            <a href="#" className="hover:text-amber-300">
              Twitter
            </a>
          </div>
        </div>
      </div>
    </footer>
    </>
  );
}
