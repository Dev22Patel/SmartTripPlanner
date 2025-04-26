import { motion } from "framer-motion"
import dev from "@/assets/image/dev-bg.png"
import jeet from "@/assets/image/jeet.png"
import stp from "@/assets/image/stp.jpg"
import "../Pages/styles/animations.css"

export default function AboutPage() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  }

  const stagger = {
    animate: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950">
      {/* Project Info Section */}
      <motion.section className="px-4 py-16 md:px-6 lg:py-24" initial="initial" animate="animate" variants={stagger}>
        <div className="mx-auto max-w-6xl">
          <motion.div className="grid gap-12 md:grid-cols-2 items-center" variants={fadeIn}>
            <div className="space-y-6">
              <motion.span
                className="inline-block px-3 py-1 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-full"
                variants={fadeIn}
              >
                About Us
              </motion.span>
              <motion.h2
                className="text-3xl font-bold tracking-tighter sm:text-4xl text-zinc-900 dark:text-zinc-50"
                variants={fadeIn}
              >
                Reimagining Travel Planning
              </motion.h2>
              <motion.p className="text-zinc-600 dark:text-zinc-300 leading-relaxed" variants={fadeIn}>
                Smart Trip Planner is an innovative travel planning platform that combines artificial intelligence with
                human expertise to create perfect travel itineraries. Our system learns from millions of successful
                trips to provide personalized recommendations based on your preferences, budget, and travel style.
              </motion.p>
              <motion.div className="space-y-4" variants={fadeIn}>
                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Key Features</h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    "AI-powered itinerary generation",
                    "Real-time weather integration",
                    "Smart budget optimization",
                    "Local insights and hidden gems",
                    "24/7 travel assistance",
                  ].map((feature, i) => (
                    <motion.li
                      key={i}
                      className="flex items-center gap-2"
                      variants={{
                        initial: { opacity: 0, x: -20 },
                        animate: { opacity: 1, x: 0, transition: { delay: i * 0.1 } },
                      }}
                    >
                      <span className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-blue-600 dark:text-blue-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      <span className="text-sm text-zinc-600 dark:text-zinc-300">{feature}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </div>
            <motion.div
              className="relative overflow-hidden rounded-2xl shadow-2xl"
              variants={{
                initial: { opacity: 0, scale: 0.8 },
                animate: { opacity: 1, scale: 1, transition: { duration: 0.6 } },
              }}
            >
              <img
                src={stp}
                alt="Smart Trip Planner Dashboard"
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-transparent"></div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

       {/* Personal Profile Section with Lightning Effect */}
    <motion.section
      className="px-4 py-16 md:px-6 lg:py-24 bg-gray-100 dark:bg-black/90 overflow-hidden"
      initial="initial"
      whileInView="animate"
      viewport={{ once: true }}
      variants={stagger}
>
  <div className="mx-auto max-w-6xl">
    <motion.div className="grid gap-12 md:grid-cols-2 items-center mt-10" variants={fadeIn}>
      <motion.div
        className="relative group"
        variants={{
            initial: { opacity: 0, scale: 0.9 },
            animate: { opacity: 1, scale: 1 },
        }}
        >
        {/* Lightning effect wrapper - Different for light/dark mode */}
        <div className="absolute inset-0">
        {/* Primary lightning flash - Only in dark mode */}
        <div className="absolute inset-0 dark:bg-gradient-to-r dark:from-transparent dark:via-blue-400/70 dark:to-transparent dark:blur-xl dark:opacity-0 dark:group-hover:opacity-60 transition-opacity duration-300 animate-lightning"></div>

        {/* Secondary lightning flashes - Only in dark mode */}
        <div className="absolute inset-0 dark:bg-gradient-to-tr dark:from-transparent dark:via-cyan-300/50 dark:to-transparent dark:blur-xl dark:opacity-0 dark:group-hover:opacity-40 transition-opacity duration-200 animate-lightning-fast"></div>

        <div className="absolute inset-0 dark:bg-gradient-to-bl dark:from-transparent dark:via-indigo-400/60 dark:to-transparent dark:blur-xl dark:opacity-0 dark:group-hover:opacity-50 transition-opacity duration-500 animate-lightning-slow"></div>
        </div>

        {/* Remove the previous dark blue glow */}
        <div className="absolute -inset-1 dark:bg-none rounded-2xl dark:blur dark:opacity-0"></div>


        {/* Subtle electric current effect */}
        <div className="absolute inset-0 overflow-hidden rounded-xl">
          <div className="absolute inset-0 opacity-10 group-hover:opacity-30 dark:opacity-20 dark:group-hover:opacity-40 transition-opacity">
            <div className="absolute h-20 w-1 bg-blue-300/60 dark:bg-blue-400/80 blur-sm -left-10 top-1/4 rotate-45 animate-lightning-travel"></div>
            <div className="absolute h-20 w-1 bg-cyan-200/60 dark:bg-cyan-300/80 blur-sm -right-10 top-3/4 -rotate-45 animate-lightning-travel-reverse"></div>
          </div>
        </div>

        <a href="https://github.com/Dev22Patel">
        <img
          src={dev || "/placeholder.svg"}
          alt="Profile Picture"
          className="relative w-full h-auto max-w-md mx-auto rounded-xl z-10"
          />
        </a>
      </motion.div>
      <motion.div className="flex flex-col justify-center space-y-6" variants={fadeIn}>
        <motion.span
          className="inline-block px-3 py-1 text-sm font-medium text-blue-600 dark:text-blue-300 bg-blue-100/80 dark:bg-blue-900/30 rounded-full w-fit"
          variants={fadeIn}
          >
          The Team
        </motion.span>
        <div>
          <motion.h2
            className="text-3xl font-bold tracking-tighter sm:text-4xl text-zinc-800 dark:text-blue-50"
            variants={fadeIn}
            >
            Meet the Creator
          </motion.h2>
          <motion.p className="mt-2 text-sm text-zinc-600 dark:text-blue-300" variants={fadeIn}>
            Founder & Lead Developer
          </motion.p>
        </div>
        <motion.p className="text-zinc-700 dark:text-gray-300 leading-relaxed" variants={fadeIn}>
          As a passionate developer and avid traveler, I created Smart Trip Planner to solve the challenges I
          faced while planning my own adventures. With a background in AI and software development, I combined
          cutting-edge technology with practical travel experience to build a platform that makes trip planning
          effortless and enjoyable.
        </motion.p>
        <motion.div className="space-y-4" variants={fadeIn}>
          <h3 className="text-xl font-semibold text-zinc-800 dark:text-blue-50">Expertise</h3>
          <div className="flex flex-wrap gap-2">
            {["AI/ML", "Full Stack Development", "UX Design", "Travel Planning", "MongoDB"].map(
                (skill, i) => (
                    <motion.span
                    key={skill}
                    className="rounded-full bg-blue-100/80 dark:bg-blue-900/40 px-3 py-1 text-sm font-medium text-blue-700 dark:text-blue-300"
                    variants={{
                        initial: { opacity: 0, scale: 0.8 },
                        animate: { opacity: 1, scale: 1, transition: { delay: i * 0.1 } },
                    }}
                    >
                  {skill}
                </motion.span>
              ),
            )}
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  </div>
</motion.section>

<motion.section
      className="px-4 py-16 md:px-6 lg:py-24 bg-gray-100 dark:bg-black/90 overflow-hidden"
      initial="initial"
      whileInView="animate"
      viewport={{ once: true }}
      variants={stagger}
>
  <div className="mx-auto max-w-6xl">
    <motion.div className="grid gap-12 md:grid-cols-2 items-center -mt-2" variants={fadeIn}>
    <motion.div className="flex flex-col justify-center space-y-6" variants={fadeIn}>
        <motion.span
          className="inline-block px-3 py-1 text-sm font-medium text-blue-600 dark:text-blue-300 bg-blue-100/80 dark:bg-blue-900/30 rounded-full w-fit"
          variants={fadeIn}
          >
          The Team
        </motion.span>
        <div>
          <motion.h2
            className="text-3xl font-bold tracking-tighter sm:text-4xl text-zinc-800 dark:text-blue-50"
            variants={fadeIn}
            >
            Meet the Creator
          </motion.h2>
          <motion.p className="mt-2 text-sm text-zinc-600 dark:text-blue-300" variants={fadeIn}>
            Co-Founder & Assistant Developer
          </motion.p>
        </div>
        <motion.p className="text-zinc-700 dark:text-gray-300 leading-relaxed" variants={fadeIn}>
          When Problems, Mind and Opportunity aligns, It's Engineer's job to comeup with a solution, and so did we, Smart Trip Planner felt like a need to me as many rookies don't know how they can easily cover their loved places with a finger tap. Well! Here we are, with Comprehensive Travel Guides, Local Insights and Tips, and Real-time adaptability.
        </motion.p>
        <motion.div className="space-y-4" variants={fadeIn}>
          <h3 className="text-xl font-semibold text-zinc-800 dark:text-blue-50">Expertise</h3>
          <div className="flex flex-wrap gap-2">
            {["Cloud", "Full Stack Development", "UI Designer", "QA"].map(
                (skill, i) => (
                    <motion.span
                    key={skill}
                    className="rounded-full bg-blue-100/80 dark:bg-blue-900/40 px-3 py-1 text-sm font-medium text-blue-700 dark:text-blue-300"
                    variants={{
                        initial: { opacity: 0, scale: 0.8 },
                        animate: { opacity: 1, scale: 1, transition: { delay: i * 0.1 } },
                    }}
                    >
                  {skill}
                </motion.span>
              ),
            )}
          </div>
        </motion.div>
      </motion.div>
      <motion.div
        className="relative group"
        variants={{
            initial: { opacity: 0, scale: 0.9 },
            animate: { opacity: 1, scale: 1 },
        }}
        >
        {/* Lightning effect wrapper - Different for light/dark mode */}
        <div className="absolute inset-0">
        {/* Primary lightning flash - Only in dark mode */}
        <div className="absolute inset-0 dark:bg-gradient-to-r dark:from-transparent dark:via-blue-400/70 dark:to-transparent dark:blur-xl dark:opacity-0 dark:group-hover:opacity-60 transition-opacity duration-300 animate-lightning"></div>

        {/* Secondary lightning flashes - Only in dark mode */}
        <div className="absolute inset-0 dark:bg-gradient-to-tr dark:from-transparent dark:via-cyan-300/50 dark:to-transparent dark:blur-xl dark:opacity-0 dark:group-hover:opacity-40 transition-opacity duration-200 animate-lightning-fast"></div>

        <div className="absolute inset-0 dark:bg-gradient-to-bl dark:from-transparent dark:via-indigo-400/60 dark:to-transparent dark:blur-xl dark:opacity-0 dark:group-hover:opacity-50 transition-opacity duration-500 animate-lightning-slow"></div>
        </div>

        {/* Remove the previous dark blue glow */}
        <div className="absolute -inset-1 dark:bg-none rounded-2xl dark:blur dark:opacity-0"></div>


        {/* Subtle electric current effect */}
        <div className="absolute inset-0 overflow-hidden rounded-xl">
          <div className="absolute inset-0 opacity-10 group-hover:opacity-30 dark:opacity-20 dark:group-hover:opacity-40 transition-opacity">
            <div className="absolute h-20 w-1 bg-blue-300/60 dark:bg-blue-400/80 blur-sm -left-10 top-1/4 rotate-45 animate-lightning-travel"></div>
            <div className="absolute h-20 w-1 bg-cyan-200/60 dark:bg-cyan-300/80 blur-sm -right-10 top-3/4 -rotate-45 animate-lightning-travel-reverse"></div>
          </div>
        </div>

        <a href="https://github.com/JeetBhuptani">
        <img
          src={jeet || "/placeholder.svg"}
          alt="Profile Picture"
          className="relative w-full h-auto max-w-md mx-auto rounded-xl z-10"
          />
        </a>
      </motion.div>
    </motion.div>
  </div>
</motion.section>


      {/* Reimagined Mission Section */}
      <motion.section
        className="px-4 py-16 md:px-6 lg:py-24 bg-zince-950 dark:from-zinc-900 dark:to-zinc-800"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={stagger}
      >
        <div className="mx-auto max-w-6xl">
          <motion.div className="text-center mb-16" variants={fadeIn}>
            <motion.span
              className="inline-block px-3 py-1 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-full mb-4"
              variants={fadeIn}
            >
              Our Vision
            </motion.span>
            <motion.h2
              className="text-3xl font-bold tracking-tighter sm:text-4xl text-zinc-900 dark:text-zinc-50 mb-4"
              variants={fadeIn}
            >
              Our Mission & Values
            </motion.h2>
          </motion.div>

          {/* Interactive Mission Timeline */}
          <div className="relative">
            {/* Central line */}
            <motion.div
              className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-blue-800 to-blue-500"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 1 }}
            />

            {/* Mission Points */}
            {[
              {
                title: "Revolutionize Travel Planning",
                description: "Harness the power of AI to transform how people plan and experience their journeys.",
                details: ["Smart itinerary generation", "Real-time adaptability", "Personalized recommendations"],
                icon: "✨",
              },
              {
                title: "Empower Travelers",
                description: "Give travelers the tools and confidence to explore the world on their terms.",
                details: ["Intuitive user experience", "Comprehensive travel guides", "Local insights and tips"],
                icon: "🌟",
              },
              {
                title: "Promote Sustainable Tourism",
                description: "Champion responsible travel practices that benefit both travelers and destinations.",
                details: ["Eco-friendly options", "Local community support", "Cultural preservation"],
                icon: "🌍",
              },
              {
                title: "Drive Innovation",
                description: "Continuously push the boundaries of what's possible in travel technology.",
                details: ["Cutting-edge AI/ML", "Predictive analytics", "Smart automation"],
                icon: "💡",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                className={`relative flex items-center gap-8 mb-16 ${i % 2 === 0 ? "flex-row" : "flex-row-reverse"}`}
                initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.2 }}
              >
                {/* Content Card */}
                <motion.div className="w-1/2 group" whileHover={{ scale: 1.02 }}>
                  <div className="bg-white dark:bg-zinc-800/50 p-6 rounded-xl shadow-xl hover:shadow-2xl transition-shadow duration-300">
                    <span className="text-4xl mb-4 block">{item.icon}</span>
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">{item.title}</h3>
                    <p className="text-zinc-600 dark:text-zinc-300 mb-4">{item.description}</p>
                    <ul className="space-y-2">
                      {item.details.map((detail, j) => (
                        <motion.li
                          key={j}
                          className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300"
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: j * 0.1 }}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                          {detail}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </motion.div>

                {/* Timeline Node */}
                <div className="absolute left-1/2 -translate-x-1/2 w-12 h-12 flex items-center justify-center">
                <motion.div
                    className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-800 flex items-center justify-center shadow-lg"
                    whileHover={{ scale: 1.2 }}
                    style={{ transformOrigin: 'center' }}
                >
                    <span className="text-white font-bold">{i + 1}</span>
                </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>
    </div>
  )
}
