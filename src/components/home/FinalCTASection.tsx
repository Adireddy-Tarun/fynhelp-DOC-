import { Link } from "react-router-dom";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export default function FinalCTASection() {
  const ref = useScrollReveal();

  return (
    <section
      ref={ref}
      className="bg-fyn-red py-16 md:py-24 px-5 text-center"
    >
      <div className="max-w-[700px] mx-auto reveal-up">
        <h2
          className="font-display font-black text-white leading-[1.1] text-[32px] md:text-5xl lg:text-[56px]"
          style={{ fontFamily: "'Oswald', sans-serif" }}
        >
          Join the Waitlist Now
        </h2>

        <p className="text-white/90 text-lg md:text-xl mt-4 leading-relaxed">
          Be among the first 100 businesses to get 6 months FREE access to CFO Fynny
        </p>

        <div className="mt-8">
          <Link
            to="/waitlist"
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 bg-white text-fyn-ink font-bold text-base md:text-lg px-10 py-4 rounded-lg shadow-md hover:scale-[1.05] hover:shadow-xl active:scale-[0.98] transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/60"
            style={{ fontFamily: "'DM Sans', sans-serif", minHeight: "56px" }}
          >
            Join Waitlist <span aria-hidden>→</span>
          </Link>
        </div>

        <p className="text-white font-medium text-base md:text-lg mt-5">
          (First 100 users get Pro Plan FREE for 6 months Worth ₹45,000)
        </p>

        <p className="text-white/70 text-sm mt-3">
          No credit card required • Launch access May 2026
        </p>
      </div>
    </section>
  );
}
