import { Link } from "react-router-dom";

export default function FinalCTASection() {
  return (
    <section className="bg-fyn-red py-20 text-center">
      <div className="fyn-container">
        <h2 className="font-display font-black text-4xl md:text-5xl lg:text-[56px] leading-[1.15] text-white mb-4">
          Start finding your numbers today.
        </h2>
        <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto">
          Join 10,000+ Indian businesses who finally understand their finances.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link to="/waitlist" className="bg-white text-fyn-red font-semibold px-8 py-4 rounded-lg text-base hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
            Start 15-Day Free Trial
          </Link>
          <button className="border-[1.5px] border-white text-white font-semibold px-8 py-4 rounded-lg text-base hover:bg-white/10 transition-all duration-200">
            Book a 20-minute demo
          </button>
        </div>
        <div className="flex flex-wrap justify-center gap-6 mb-8">
          {["No credit card required", "Setup in 10 minutes", "Cancel anytime"].map((t) => (
            <span key={t} className="flex items-center gap-2 text-white/70 text-sm">
              <span className="w-2 h-2 rounded-full bg-white/60" />
              {t}
            </span>
          ))}
        </div>
        <p className="text-white/40 text-sm">
          Questions? Contact us at support@fynhelp.com
        </p>
      </div>
    </section>
  );
}
