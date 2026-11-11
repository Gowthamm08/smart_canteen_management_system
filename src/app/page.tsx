
import Link from "next/link";

const features = [
  {
    icon: "🍽️",
    title: "Explore Food",
    description: "Discover delicious food and browse the canteen menu.",
  },
  {
    icon: "🛒",
    title: "Easy Ordering",
    description: "Place your food orders quickly and conveniently.",
  },
  {
    icon: "⚡",
    title: "Save Time",
    description: "Spend less time waiting and more time enjoying your meal.",
  },
];

const steps = [
  { number: "01", title: "Create an account", description: "Sign up or log in to your account." },
  { number: "02", title: "Explore the menu", description: "Choose your favourite food items." },
  { number: "03", title: "Place your order", description: "Submit your order and enjoy your food." },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="text-3xl">🍴</span>
            <span className="text-xl font-extrabold text-slate-900">
              Smart Canteen
            </span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <a href="#home" className="font-medium hover:text-orange-600">Home</a>
            <a href="#features" className="font-medium hover:text-orange-600">Features</a>
            <a href="#how-it-works" className="font-medium hover:text-orange-600">How It Works</a>
            <a href="#about" className="font-medium hover:text-orange-600">About</a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-xl px-4 py-2 font-semibold text-slate-800 hover:bg-slate-100"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="rounded-xl bg-orange-500 px-5 py-2.5 font-bold text-white shadow-md transition hover:bg-orange-600"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section id="home" className="overflow-hidden bg-gradient-to-br from-orange-50 via-white to-amber-100">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-24 md:grid-cols-2">
          <div>
            <span className="inline-block rounded-full bg-orange-100 px-4 py-2 text-sm font-bold text-orange-700">
              🍴 Welcome to Smart Canteen
            </span>

            <h1 className="mt-6 text-5xl font-black leading-tight md:text-6xl">
              Delicious Food.
              <span className="block text-orange-500">Smarter Ordering.</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              Your campus food experience, made easier. Explore the menu,
              order your favourite meals and enjoy a smarter canteen experience.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href="/signup"
                className="rounded-xl bg-orange-500 px-7 py-4 font-bold text-white shadow-lg transition hover:-translate-y-1 hover:bg-orange-600"
              >
                Get Started →
              </Link>

              <Link
                href="/login"
                className="rounded-xl border-2 border-slate-300 bg-white px-7 py-4 font-bold text-slate-800 transition hover:border-orange-500"
              >
                Login to Account
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-8 text-sm text-slate-600">
              <div>
                <p className="text-2xl font-black text-slate-900">Easy</p>
                <p>Food ordering</p>
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900">Smart</p>
                <p>Management</p>
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900">Fast</p>
                <p>Experience</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="relative flex h-80 w-80 items-center justify-center rounded-full bg-orange-200 shadow-2xl md:h-[440px] md:w-[440px]">
              <div className="absolute inset-5 rounded-full border-2 border-dashed border-orange-400" />
              <span className="text-[150px] md:text-[210px]">🍱</span>
              <div className="absolute -bottom-3 right-0 rounded-2xl bg-white p-4 shadow-xl">
                <p className="font-bold text-slate-900">Fresh & Delicious</p>
                <p className="text-sm text-slate-500">Made for your day ❤️</p>
              </div>
              <div className="absolute -left-5 top-12 rounded-2xl bg-white p-4 text-3xl shadow-lg">
                🥗
              </div>
              <div className="absolute -right-3 top-20 rounded-2xl bg-white p-4 text-3xl shadow-lg">
                🍔
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-24">
        <div className="text-center">
          <p className="font-bold uppercase tracking-widest text-orange-500">
            Why Smart Canteen?
          </p>
          <h2 className="mt-3 text-4xl font-black">A Better Food Experience</h2>
          <p className="mt-4 text-slate-500">
            Everything you need for a convenient campus dining experience.
          </p>
        </div>

        <div className="mt-14 grid gap-7 md:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-3xl border border-slate-100 bg-white p-8 shadow-lg transition hover:-translate-y-2 hover:shadow-xl"
            >
              <div className="text-5xl">{feature.icon}</div>
              <h3 className="mt-6 text-xl font-extrabold">{feature.title}</h3>
              <p className="mt-3 leading-7 text-slate-500">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-slate-50 px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <p className="font-bold uppercase tracking-widest text-orange-500">
              Simple Process
            </p>
            <h2 className="mt-3 text-4xl font-black">How It Works</h2>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.number} className="rounded-3xl bg-white p-8 shadow-md">
                <p className="text-4xl font-black text-orange-500">{step.number}</p>
                <h3 className="mt-5 text-xl font-bold">{step.title}</h3>
                <p className="mt-3 text-slate-500">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="mx-auto max-w-5xl px-6 py-24 text-center">
        <span className="text-5xl">🏫</span>
        <h2 className="mt-5 text-4xl font-black">About Smart Canteen</h2>
        <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-600">
          Smart Canteen Management System is designed to make campus food
          services more convenient and organized through digital ordering,
          inventory management and efficient canteen operations.
        </p>

        <Link
          href="/signup"
          className="mt-8 inline-block rounded-xl bg-orange-500 px-8 py-4 font-bold text-white transition hover:bg-orange-600"
        >
          Join Smart Canteen →
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 px-6 py-10 text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 md:flex-row">
          <div>
            <p className="text-xl font-extrabold">🍴 Smart Canteen</p>
            <p className="mt-2 text-sm text-slate-400">
              Management System
            </p>
          </div>

          <p className="text-sm text-slate-400">
            © {new Date().getFullYear()} Smart Canteen Management System.
            All rights reserved.
          </p>

          <div className="flex gap-5">
            <Link href="/login" className="text-sm hover:text-orange-400">Login</Link>
            <Link href="/signup" className="text-sm hover:text-orange-400">Sign Up</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
