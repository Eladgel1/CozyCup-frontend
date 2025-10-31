import { Link } from 'react-router-dom';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { motion, useScroll, useTransform } from 'framer-motion';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

const cardFx = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: 'easeOut' } },
  hover: { y: -4, scale: 1.01, transition: { type: 'spring', stiffness: 240, damping: 16 } },
};

const tileFx = cardFx;
const stepFx = cardFx;

export default function Home() {
  // Subtle parallax for hero text
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 200], [0, -24]);

  return (
    <div className="space-y-8">
      {/* Hero */}
      <motion.section
        className="relative overflow-hidden rounded-[var(--radius)] hero-bg text-white"
        initial="hidden"
        animate="show"
        variants={container}
      >
        {/* micro-zoom image overlay (swap the URL if needed) */}
        <motion.div
          aria-hidden
          className="absolute inset-0 bg-[url('/src/assets/images/hero.jpg')] bg-cover bg-center"
          animate={{ scale: [1, 1.1] }}
          transition={{ duration: 12, repeat: Infinity, repeatType: 'mirror', ease: 'linear' }}
          style={{ willChange: 'transform' }}
        />
        {/* gradient on top of bg */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/25 to-transparent" />

        <motion.div className="relative z-10 p-10" style={{ y: heroY }}>
          <motion.p
            variants={fadeUp}
            className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs backdrop-blur"
          >
            <span className="opacity-90">Fresh • Fast • Cozy</span>
          </motion.p>

          <motion.h1 variants={fadeUp} className="mt-3 text-3xl font-semibold tracking-tight drop-shadow">
            Cozy up your day ☕
          </motion.h1>

          <motion.p variants={fadeUp} className="mt-2 max-w-xl opacity-90">
            Fresh coffee, comfy seats, and a smooth digital experience.
            <br></br>
            Order ahead or book a seat.
          </motion.p>

          <motion.div variants={container} className="mt-6 flex flex-wrap items-center gap-3">
            <motion.div variants={fadeUp}>
              <Link to="/menu">
                <Button className="px-5 py-2">Order now</Button>
              </Link>
            </motion.div>

            <motion.div variants={fadeUp}>
              <Link to="/bookings">
                <Button variant="ghost" className="px-5 py-2 bg-white/15 hover:bg-white/20 text-white">
                  Book a seat
                </Button>
              </Link>
            </motion.div>

            <motion.div variants={fadeUp}>
              <Link to="/wallet" className="text-sm underline-offset-4 hover:underline opacity-90">
                Check wallet →
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Quick actions */}
      <motion.section
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={container}
      >
        <ActionCard
          variants={cardFx}
          title="Menu"
          desc="Discover classics and seasonal specials."
          to="/menu"
          img="/src/assets/images/menu/latte.jpg"
        />
        <ActionCard
          variants={cardFx}
          title="Book a Seat"
          desc="Reserve your spot and skip the wait."
          to="/bookings"
          img="/src/assets/images/menu/cappuccino.jpg"
        />
        <ActionCard
          variants={cardFx}
          title="Wallet"
          desc="Manage passes and track your balance."
          to="/wallet"
          img="/src/assets/images/menu/croissant.jpg"
        />
      </motion.section>

      {/* Popular today */}
      <section>
        <div className="mb-3 flex items-end justify-between">
          <h2 className="text-xl font-semibold">Popular today</h2>
          <Link to="/menu" className="text-sm text-[var(--muted)] hover:underline">
            Explore full menu
          </Link>
        </div>

        <motion.div
          className="grid grid-cols-1 gap-4 sm:grid-cols-3"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={container}
        >
          <PromoTile
            variants={tileFx}
            name="Iced Latte"
            tag="Barista favorite"
            price="$5.20"
            to="/menu"
            img="/src/assets/images/menu/iced_latte.jpg"
          />
          <PromoTile
            variants={tileFx}
            name="Almond Croissant"
            tag="Freshly baked"
            price="$3.90"
            to="/menu"
            img="/src/assets/images/menu/almond_croissant.jpg"
          />
          <PromoTile
            variants={tileFx}
            name="Affogato"
            tag="Dessert treat"
            price="$5.90"
            to="/menu"
            img="/src/assets/images/menu/affogato.jpg"
          />
        </motion.div>
      </section>

      {/* How it works */}
      <section>
        <h2 className="mb-3 text-xl font-semibold">How it works</h2>
        <motion.div
          className="grid grid-cols-1 gap-4 sm:grid-cols-3"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={container}
        >
          <Step variants={stepFx} n="1" title="Pick your favorite" desc="Choose from coffee, tea, and pastries." />
          <Step variants={stepFx} n="2" title="Select pickup window" desc="We prepare it fresh, right on time." />
          <Step variants={stepFx} n="3" title="Enjoy & earn" desc="Use passes, top up your wallet, and enjoy." />
        </motion.div>
      </section>

      {/* The Cozy vibe */}
      <motion.section
        className="rounded-[var(--radius)] border bg-[var(--card)]"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex flex-col items-start gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm uppercase tracking-wide text-[var(--muted)]">The Cozy vibe</div>
            <p className="mt-1 max-w-2xl text-[15px] leading-6">
              “The perfect spot to get things done, or just slow down with a warm cup.
              <br />
              Friendly staff, smooth ordering, and the croissants are unreal.”
            </p>
          </div>
          <Link to="/menu">
            <Button className="px-5 py-2">Grab a coffee</Button>
          </Link>
        </div>
      </motion.section>
    </div>
  );
}

/* ---------- sub components ---------- */

function ActionCard({ title, desc, to, img, variants }) {
  return (
    <Link to={to} className="group block">
      <motion.div
        className="card overflow-hidden transition hover:shadow-lg"
        variants={variants}
        whileHover="hover"
        initial={false}
      >
        <div className="relative h-28 w-full overflow-hidden rounded-t-[var(--radius)]">
          <img
            src={img}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>
        <Card.Body>
          <h3 className="font-semibold">{title}</h3>
          <p className="muted mt-1 text-sm">{desc}</p>
          <span className="mt-2 inline-block text-sm text-[var(--muted)] group-hover:underline">Go →</span>
        </Card.Body>
      </motion.div>
    </Link>
  );
}

function PromoTile({ name, tag, price, to, img, variants }) {
  return (
    <Link to={to} className="group block">
      <motion.div
        className="relative h-44 overflow-hidden rounded-[var(--radius)]"
        variants={variants}
        whileHover="hover"
        initial={false}
      >
        <img
          src={img}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 text-white drop-shadow">
          <div className="inline-flex items-center rounded-full bg-white/15 px-2 py-0.5 text-[11px] backdrop-blur">
            {tag}
          </div>
          <div className="mt-1 flex items-center justify-between">
            <div className="text-lg font-semibold">{name}</div>
            <div className="rounded bg-black/50 px-2 py-0.5 text-sm">{price}</div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

function Step({ n, title, desc, variants }) {
  return (
    <motion.div className="card p-5" variants={variants} whileHover="hover" initial={false}>
      <div className="mb-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/10 text-sm font-medium">
        {n}
      </div>
      <div className="font-semibold">{title}</div>
      <div className="muted mt-1 text-sm">{desc}</div>
    </motion.div>
  );
}
