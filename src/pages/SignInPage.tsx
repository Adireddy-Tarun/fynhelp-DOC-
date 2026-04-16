import { Link } from "react-router-dom";
import FynLogo from "@/components/FynLogo";

const SignInPage = () => (
  <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
    {/* Left */}
    <div className="bg-fyn-ink p-12 flex flex-col justify-center">
      <FynLogo variant="light" />
      <h2 className="text-white font-serif text-3xl mt-8 mb-4">Welcome back.</h2>
      <p className="text-white/60">Nidhi has been watching your numbers.</p>
    </div>

    {/* Right */}
    <div className="bg-fyn-beige p-12 flex flex-col justify-center">
      <h2 className="text-fyn-ink font-serif text-2xl mb-6">Sign in to your account</h2>
      <form className="space-y-4 max-w-md">
        <div>
          <label className="text-sm mb-1 block text-secondary-foreground">Email address</label>
          <input
            type="email"
            placeholder="rajesh@example.com"
            className="w-full h-[42px] px-4 bg-fyn-beige border border-fyn-ink-10 rounded text-sm focus:outline-none focus:ring-2 focus:ring-fyn-red text-secondary-foreground"
          />
        </div>
        <div>
          <label className="text-sm mb-1 block text-secondary-foreground">Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            className="w-full h-[42px] px-4 bg-fyn-beige border border-fyn-ink-10 rounded text-sm focus:outline-none focus:ring-2 focus:ring-fyn-red text-secondary-foreground"
          />
        </div>
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm cursor-pointer text-secondary-foreground">
            <input type="checkbox" className="accent-[#C41E1E]" />
            Remember me
          </label>
          <a href="#" className="text-fyn-red text-sm hover:underline">Forgot password?</a>
        </div>
        <button type="submit" className="w-full bg-fyn-red text-white py-3 rounded-lg font-medium text-base hover:opacity-90 transition-opacity">
          Sign In
        </button>
        <p className="text-sm text-center text-secondary-foreground">
          Don't have an account? <Link to="/signup" className="text-fyn-red hover:underline">Start free trial →</Link>
        </p>
        <p className="text-xs text-center mt-4 text-secondary-foreground">
          Logging in as a CA partner? <a href="#" className="text-fyn-gold hover:underline">Use your partner portal →</a>
        </p>
      </form>
    </div>
  </div>
);

export default SignInPage;
