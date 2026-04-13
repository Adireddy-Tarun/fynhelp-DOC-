import { Link } from "react-router-dom";

export default function FinalCTASection() {
  return (
    <section className="bg-fyn-beige py-20 text-center">
      <div className="fyn-container">
        <h2 className="text-3xl md:text-4xl lg:text-[48px] leading-[1.2] text-fyn-ink mb-4 font-display">
          Start finding your numbers today.
        </h2>
        <p className="text-fyn-ink/60 text-lg mb-8 max-w-xl mx-auto">
          Join 10,000+ Indian businesses who finally understand their finances.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
          <Link to="/signup" className="bg-fyn-red text-white font-semibold px-8 py-3.5 rounded-lg hover-btn-primary">
            Start 15-Day Free Trial
          </Link>
          <button className="border-[1.5px] border-fyn-ink text-fyn-ink font-semibold px-8 py-3.5 rounded-lg hover-btn-secondary">
            Book a Demo
          </button>
        </div>
        <p className="text-fyn-ink/35 text-sm">
          Questions? Email support@fynhelp.com or call +91-XXXXXXXXXX
        </p>
      </div>
    </section>
  );
}
