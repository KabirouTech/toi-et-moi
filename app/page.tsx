'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Heart, MessageCircle, Calendar, Star, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: 'easeOut' as const },
  }),
}

const features = [
  {
    icon: Heart,
    title: 'Souvenirs partagés',
    description: 'Conservez vos moments précieux ensemble dans un espace intime et sécurisé',
  },
  {
    icon: MessageCircle,
    title: '36 Questions',
    description: 'Approfondissez votre connexion avec des conversations profondes et significatives',
  },
  {
    icon: Calendar,
    title: 'Notre calendrier',
    description: 'Ne manquez jamais une date importante de votre histoire commune',
  },
]

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#180f24]">
      {/* Nebula orbs */}
      <div className="pointer-events-none absolute top-[-10%] left-[20%] h-[500px] w-[500px] rounded-full bg-[#ff77ff] opacity-[0.08] blur-[120px]" />
      <div className="pointer-events-none absolute top-[30%] right-[-5%] h-[400px] w-[400px] rounded-full bg-[#d4bbff] opacity-[0.06] blur-[100px]" />
      <div className="pointer-events-none absolute bottom-[10%] left-[10%] h-[350px] w-[350px] rounded-full bg-[#ffadf9] opacity-[0.07] blur-[100px]" />

      {/* Star particles */}
      <Star className="absolute top-[12%] left-[8%] size-2 text-[#ffadf9]/20 animate-pulse" />
      <Star className="absolute top-[22%] right-[12%] size-1.5 text-[#d4bbff]/15 animate-pulse [animation-delay:1s]" />
      <Star className="absolute top-[55%] left-[15%] size-1.5 text-[#ffadf9]/15 animate-pulse [animation-delay:2s]" />
      <Star className="absolute top-[70%] right-[20%] size-2 text-[#d4bbff]/10 animate-pulse [animation-delay:0.5s]" />
      <Star className="absolute top-[35%] right-[5%] size-1.5 text-[#ffadf9]/10 animate-pulse [animation-delay:1.5s]" />
      <Star className="absolute bottom-[15%] left-[30%] size-1.5 text-[#d4bbff]/10 animate-pulse [animation-delay:3s]" />
      <Sparkles className="absolute top-[18%] right-[25%] size-2 text-[#ffadf9]/15 animate-pulse [animation-delay:2.5s]" />
      <Sparkles className="absolute bottom-[25%] right-[10%] size-2 text-[#d4bbff]/12 animate-pulse [animation-delay:1.8s]" />

      {/* Sticky nav */}
      <nav className="sticky top-0 z-50 flex h-16 items-center justify-between px-6 bg-[#180f24]/60 backdrop-blur-xl">
        <span className="text-lg font-light italic text-[#ffadf9]">Toi et Moi</span>
        <Link
          href="/auth/login"
          className="text-sm text-[#d7c0d1] transition-colors hover:text-[#ecddfb]"
        >
          Se connecter
        </Link>
      </nav>

      {/* Hero section */}
      <section className="relative flex min-h-[80vh] flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center gap-6"
        >
          <motion.div custom={0} variants={fadeUp}>
            <Heart className="mx-auto mb-2 size-8 text-[#ffadf9]/50" />
          </motion.div>

          <motion.h1
            custom={1}
            variants={fadeUp}
            className="text-7xl font-light italic tracking-tight text-[#ffadf9] sm:text-9xl"
          >
            Toi et Moi
          </motion.h1>

          <motion.p
            custom={2}
            variants={fadeUp}
            className="max-w-lg text-lg text-[#d7c0d1]"
          >
            Un espace numérique privé pour deux
          </motion.p>

          <motion.div
            custom={3}
            variants={fadeUp}
            className="mt-6 flex flex-col items-center gap-4"
          >
            <Button
              size="lg"
              className="h-12 rounded-full bg-gradient-to-tr from-[#ffadf9] to-[#ff77ff] px-10 text-base font-bold text-[#37003a] shadow-[0_10px_20px_rgba(255,119,255,0.2)] transition-all hover:shadow-[0_14px_28px_rgba(255,119,255,0.3)] hover:brightness-110"
              render={<Link href="/auth/signup" />}
            >
              Créer votre espace
            </Button>

            <Link
              href="/auth/login"
              className="text-sm text-[#d7c0d1]/70 transition-colors hover:text-[#ecddfb]"
            >
              Déjà un compte ?
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Features section */}
      <section className="relative mx-auto max-w-5xl px-6 py-24">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="flex flex-col items-center"
        >
          <motion.h2
            custom={0}
            variants={fadeUp}
            className="mb-16 text-center font-['Inter'] text-xs uppercase tracking-widest text-[#d7c0d1]"
          >
            Concu pour la proximite
          </motion.h2>

          <div className="grid w-full gap-6 sm:grid-cols-3">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                custom={i + 1}
                variants={fadeUp}
                className={`group rounded-[2rem] border border-white/[0.08] bg-white/5 p-8 text-center backdrop-blur-[12px] transition-colors hover:bg-white/[0.08] ${
                  i === 1 ? 'sm:translate-y-6' : ''
                }`}
              >
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#ffadf9]/10">
                  <feature.icon className="size-6 text-[#ffadf9] transition-colors group-hover:text-[#ff77ff]" />
                </div>
                <h3 className="mb-2 text-sm font-medium tracking-wide text-[#ecddfb]">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-[#d7c0d1]/70">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Bottom CTA section */}
      <section className="relative mx-auto max-w-2xl px-6 py-24 text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="flex flex-col items-center gap-6"
        >
          <motion.h2
            custom={0}
            variants={fadeUp}
            className="text-3xl font-light italic text-[#ecddfb] sm:text-4xl"
          >
            Commencez votre voyage
          </motion.h2>

          <motion.p
            custom={1}
            variants={fadeUp}
            className="max-w-md text-[#d7c0d1]/70"
          >
            Rejoignez les couples qui cultivent leur connexion chaque jour
          </motion.p>

          <motion.div
            custom={2}
            variants={fadeUp}
            className="mt-4 flex flex-wrap items-center justify-center gap-4"
          >
            <Button
              size="lg"
              className="h-12 rounded-full bg-gradient-to-tr from-[#ffadf9] to-[#ff77ff] px-10 text-base font-bold text-[#37003a] shadow-[0_10px_20px_rgba(255,119,255,0.2)] transition-all hover:shadow-[0_14px_28px_rgba(255,119,255,0.3)] hover:brightness-110"
              render={<Link href="/auth/signup" />}
            >
              Commencer
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="h-12 rounded-full border-white/10 bg-transparent px-10 text-base text-[#ecddfb] hover:bg-white/5 hover:text-[#ecddfb]"
              render={<Link href="/auth/login" />}
            >
              Se connecter
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 text-center">
        <span className="text-sm font-light italic text-[#ffadf9]/40">
          Toi et Moi
        </span>
      </footer>
    </div>
  )
}
