
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

const dishes = [
  {
    name: "Classic Veg Meals",
    category: "South Indian",
    price: "₹80",
    image:
      "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=900&q=85",
    tag: "Bestseller",
  },
  {
    name: "Paneer Rice",
    category: "Chef's Special",
    price: "₹70",
    image:
      "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=900&q=85",
    tag: "Popular",
  },
  {
    name: "Fresh Sandwich",
    category: "Quick Bites",
    price: "₹45",
    image:
      "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=900&q=85",
    tag: "Fresh",
  },
];

const benefits = [
  {
    number: "01",
    title: "Freshly prepared",
    description: "Enjoy delicious meals prepared fresh for your campus day.",
  },
  {
    number: "02",
    title: "Easy ordering",
    description: "Browse the menu and place your order in just a few clicks.",
  },
  {
    number: "03",
    title: "Less waiting",
    description: "Make your canteen experience smoother and more convenient.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#080d0b] text-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#080d0b]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 md:px-8">
          <BrandLogo appearance="dark" />

          <div className="hidden items-center gap-9 text-sm text-white/70 md:flex">
            <a href="#home" className="transition hover:text-emerald-400">
              Home
            </a>
            <a href="#menu" className="transition hover:text-emerald-400">
              Menu
            </a>
            <a href="#about" className="transition hover:text-emerald-400">
              Our Story
            </a>
            <a href="#contact" className="transition hover:text-emerald-400">
              Contact
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden px-3 py-2 text-sm font-medium text-white/80 transition hover:text-emerald-400 sm:block"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-[#C2A36B] px-5 py-3 text-xs font-bold tracking-wide text-[#0B211C] transition hover:-translate-y-0.5 hover:bg-[#D2B984]"
            >
              ORDER ONLINE ↗
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section
        id="home"
        className="relative isolate overflow-hidden"
      >
        <div className="absolute -right-40 top-10 -z-10 h-96 w-96 rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute -left-40 bottom-0 -z-10 h-96 w-96 rounded-full bg-[#C2A36B]/10 blur-[120px]" />

        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 md:grid-cols-2 md:px-8 md:py-28">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-4 py-2 text-xs tracking-widest text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              A BETTER CAMPUS FOOD EXPERIENCE
            </div>

            <h2 className="mt-8 max-w-2xl font-serif text-5xl font-medium leading-[1.12] tracking-tight md:text-7xl">
              Good food.
              <br />
              Great moments.
              <br />
              <span className="italic text-emerald-400">
                Smarter living.
              </span>
            </h2>

            <p className="mt-7 max-w-lg text-base leading-8 text-white/55">
              Your favourite campus meals, now just a few clicks away.
              Explore the menu, order with ease and enjoy every moment
              of your day.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href="/signup"
                className="rounded-full bg-[#C2A36B] px-8 py-4 text-sm font-bold text-[#0B211C] transition hover:-translate-y-1 hover:bg-[#D2B984]"
              >
                Explore & Order →
              </Link>

              <Link
                href="/login"
                className="rounded-full border border-white/20 px-8 py-4 text-sm font-semibold text-white transition hover:border-emerald-400 hover:text-emerald-400"
              >
                Sign In
              </Link>
            </div>

            <div className="mt-14 flex flex-wrap gap-10 border-t border-white/10 pt-8">
              <div>
                <p className="font-serif text-3xl text-white">Fresh</p>
                <p className="mt-1 text-xs text-white/40">Every day</p>
              </div>
              <div>
                <p className="font-serif text-3xl text-white">Simple</p>
                <p className="mt-1 text-xs text-white/40">Ordering</p>
              </div>
              <div>
                <p className="font-serif text-3xl text-white">Smart</p>
                <p className="mt-1 text-xs text-white/40">Management</p>
              </div>
            </div>
          </div>

          {/* Hero food image */}
          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -inset-5 rounded-[40px] bg-emerald-500/10 blur-3xl" />

            <div className="relative overflow-hidden rounded-[30px] border border-white/15 bg-[#111b16] p-3 shadow-2xl shadow-black/50">
              <div
                className="relative min-h-[390px] overflow-hidden rounded-[23px] bg-cover bg-center md:min-h-[510px]"
                style={{
                  backgroundImage:
                    "linear-gradient(0deg, rgba(0,0,0,.65), transparent 65%), url('https://images.unsplash.com/photo-1547592180-85f173990554?w=1200&q=90')",
                }}
              >
                <div className="absolute left-5 top-5 rounded-full border border-white/20 bg-black/40 px-4 py-2 text-xs backdrop-blur-md">
                  ✦ Made for your day
                </div>

                <div className="absolute bottom-6 left-6 right-6">
                  <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">
                    THE CAMPUS TABLE
                  </p>
                  <h3 className="mt-2 font-serif text-3xl md:text-4xl">
                    Taste the good life.
                  </h3>
                  <p className="mt-2 text-sm text-white/70">
                    Good food, great company, every single day.
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-7 -left-4 rounded-2xl border border-white/10 bg-[#14221a] p-4 shadow-xl md:-left-10">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🌿</span>
                <div>
                  <p className="text-sm font-bold">Fresh & Delicious</p>
                  <p className="mt-1 text-xs text-white/50">
                    Your campus food destination
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#0d1510] px-5 py-20 md:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[.7fr_1.3fr] md:items-center">
          <div>
            <p className="text-xs font-bold tracking-[0.3em] text-[#C2A36B]">MADE FOR CAMPUS LIFE</p>
            <h2 className="mt-4 font-serif text-4xl leading-tight md:text-5xl">A little more care in every meal.</h2>
          </div>
          <blockquote className="border-l border-[#C2A36B]/60 pl-7 md:pl-10">
            <p className="font-serif text-2xl leading-relaxed text-white/85 md:text-3xl">“A warm meal, ready when you are. That’s one less thing to think about on a busy day.”</p>
            <footer className="mt-6 text-xs uppercase tracking-[0.2em] text-white/45">The Smart Canteen experience</footer>
          </blockquote>
        </div>
      </section>

      {/* Featured Menu */}
      <section id="menu" className="border-t border-white/10 bg-[#0d1510] py-24">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="text-xs font-bold tracking-[0.3em] text-emerald-400">
                A LITTLE SOMETHING DELICIOUS
              </p>
              <h2 className="mt-4 font-serif text-4xl md:text-5xl">
                The chef's picks.
              </h2>
              <p className="mt-3 text-sm text-white/45">
                A taste of what awaits you at the canteen.
              </p>
            </div>

            <Link
              href="/login"
              className="text-sm font-semibold text-emerald-400 transition hover:text-emerald-300"
            >
              Explore full menu ↗
            </Link>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {dishes.map((dish) => (
              <article
                key={dish.name}
                className="group overflow-hidden rounded-3xl border border-white/10 bg-[#121c16] transition duration-300 hover:-translate-y-2 hover:border-emerald-400/30"
              >
                <div className="relative h-60 overflow-hidden">
                  <img
                    src={dish.image}
                    alt={dish.name}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                  />
                  <span className="absolute left-4 top-4 rounded-full bg-[#102019]/90 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-emerald-300 backdrop-blur">
                    {dish.tag}
                  </span>
                </div>

                <div className="p-6">
                  <p className="text-xs uppercase tracking-widest text-emerald-400">
                    {dish.category}
                  </p>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <h3 className="font-serif text-2xl">{dish.name}</h3>
                    <span className="text-lg font-bold text-[#D2B984]">
                      {dish.price}
                    </span>
                  </div>
                  <Link
                    href="/login"
                    className="mt-6 inline-flex text-sm font-semibold text-white/60 transition hover:text-emerald-400"
                  >
                    Order this item →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="about" className="py-24">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-bold tracking-[0.3em] text-emerald-400">
              MORE THAN JUST A MEAL
            </p>
            <h2 className="mt-4 font-serif text-4xl leading-tight md:text-5xl">
              A simpler way to enjoy your campus day.
            </h2>
          </div>

          <div className="mt-14 grid gap-10 md:grid-cols-3">
            {benefits.map((benefit) => (
              <div
                key={benefit.number}
                className="border-t border-white/15 pt-6"
              >
                <p className="font-serif text-4xl text-emerald-400">
                  {benefit.number}
                </p>
                <h3 className="mt-6 text-xl font-semibold">
                  {benefit.title}
                </h3>
                <p className="mt-3 max-w-xs text-sm leading-7 text-white/45">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="px-5 pb-24 md:px-8">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[32px] border border-emerald-300/20 bg-[#13271b] px-7 py-16 text-center md:py-20">
          <div className="absolute -right-20 -top-28 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
          <div className="relative">
            <p className="text-xs font-bold tracking-[0.3em] text-emerald-300">
              YOUR NEXT FAVOURITE MEAL AWAITS
            </p>
            <h2 className="mx-auto mt-5 max-w-2xl font-serif text-4xl leading-tight md:text-6xl">
              Craving something delicious?
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-white/55">
              Make your next campus meal a little more special.
              Join Smart Canteen and get started.
            </p>
            <Link
              href="/signup"
              className="mt-9 inline-flex rounded-full bg-[#C2A36B] px-9 py-4 text-sm font-bold text-[#0B211C] transition hover:-translate-y-1 hover:bg-[#D2B984]"
            >
              Get Started Today →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        id="contact"
        className="border-t border-white/10 bg-[#060a08] px-5 py-10 md:px-8"
      >
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 md:flex-row md:items-center">
          <BrandLogo appearance="dark" size="compact" />

          <div className="flex flex-wrap gap-6 text-sm text-white/50">
            <a href="#home" className="hover:text-emerald-400">Home</a>
            <a href="#menu" className="hover:text-emerald-400">Menu</a>
            <a href="#about" className="hover:text-emerald-400">About</a>
            <Link href="/login" className="hover:text-emerald-400">Login</Link>
            <Link href="/signup" className="hover:text-emerald-400">Sign Up</Link>
          </div>
        </div>

        <div className="mx-auto mt-8 max-w-7xl border-t border-white/10 pt-6 text-center text-xs text-white/30">
          © {new Date().getFullYear()} Smart Canteen Management System.
          All rights reserved.
        </div>
      </footer>
    </main>
  );
}
