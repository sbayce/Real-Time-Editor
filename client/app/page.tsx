'use client'
import Link from "next/link"
import { motion } from "framer-motion"
import Typewriter from "typewriter-effect"

export default function Home() {
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.5, ease: "easeInOut" }
    },
  }

  return (
    <main className="grid-background">
      <div className="flex flex-col gap-10 lm:gap-32 pt-24 px-4 md:px-20">
        <div className="flex lg:flex-row flex-col items-center justify-between z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ delay: 0.3 }}
            className="flex flex-col gap-2"
          >
            <h1 className="text-5xl">
                <Typewriter
                onInit={(typewriter) => {
                  typewriter.typeString('Collaborate on Documents in Real-Time')
                    .start()
                }}
                options={{
                  delay: 50,
                }}
              />
            </h1>
            <motion.p className="text-start w-[600px] text-lg mt-4">
              Create, edit, and collaborate on documents with your team, no matter
              where they are. Invite collaborators and see everyone's changes
              instantly, without the chaos.
            </motion.p>
            <Link
              href="/home"
              className="p-4 rounded-lg bg-black text-white mt-2 mb-10 lg:mb-0 lg:mr-auto lg:ml-0 xs:ml-auto xs:mr-auto mr-auto ml-auto"
            >
              Get started
            </Link>
          </motion.div>

          <motion.div
            className="w-[500px] min-w-[500px] xs:w-[600px] sm:w-[700px] ms:w-[800px] lg:w-[700px] lg:min-w-[700px] xl:w-[800px] xl:min-w-[800px]"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "circInOut", delay: 0.1 }}
          >
            <motion.img
              className=" border rounded-lg shadow-lg"
              src="/preview.PNG"
              alt="preview"
            />
          </motion.div>
        </div>
        <motion.section className="flex flex-col lm:flex-row items-center gap-10 mb-14 lm:mb-0 justify-between z-10">
        <motion.div className="tracking-wider">
          <motion.h2
              className="text-xl font-semibold"
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              transition={{ delay: 0.6 }}
            >
              - Collaboration
            </motion.h2>
            <motion.p
              className="w-[400px] my-4"
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              transition={{ delay: 0.5 }}
            >
              Work together seamlessly with live updates. Multiple people can
              edit the same document at once, with real-time updates to text,
              formatting, and layout.
          </motion.p>
        </motion.div>
        <motion.div className="tracking-wider">
            <motion.h2
              className="text-xl font-semibold"
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              transition={{ delay: 0.6 }}
            >
              - Live Cursors
            </motion.h2>

            <motion.p
              className="w-[400px] my-4"
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              transition={{ delay: 0.7 }}
            >
              See exactly what your collaborators are doing with live cursor
              updates. Easily track their position, and know who’s working where
              in the document at any time.
            </motion.p>
            </motion.div>
            <motion.div className="tracking-wider">
              <motion.h2
                className="text-xl font-semibold"
                initial="hidden"
                animate="visible"
                variants={fadeIn}
                transition={{ delay: 0.8 }}
              >
                - Conflict-Free Editing
              </motion.h2>

              <motion.p
                className="w-[400px] my-4"
                initial="hidden"
                animate="visible"
                variants={fadeIn}
                transition={{ delay: 0.9 }}
              >
                Never worry about overwriting each other’s work. Conflicts are resolved whenever users type simultaneously.
              </motion.p>
            </motion.div>
          </motion.section>
      </div>
    </main>
  )
}
