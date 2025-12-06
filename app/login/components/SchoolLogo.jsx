'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function SchoolLogo() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2, duration: 0.6 }}
      className="flex flex-col items-center justify-center"
    >
      {/* Logo Container with Multiple Animations */}
      <motion.div
        className="relative w-80 h-80 md:w-[400px] md:h-[400px] mb-8"
        animate={{
          y: [0, -15, 0],
          rotate: [0, 2, -2, 0],
          scale: [1, 1.05, 1],
        }}
        transition={{
          y: {
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          },
          rotate: {
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          },
          scale: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          },
        }}
      >
        {/* Glow Effect */}
        <motion.div
          className="absolute inset-0 rounded-full blur-3xl opacity-30"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.5) 0%, transparent 70%)',
          }}
        />
        
        {/* Logo Image */}
        <motion.div
          className="relative w-full h-full"
          whileHover={{
            scale: 1.1,
            rotate: 5,
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
          }}
        >
          <Image
            src="/img/logo.png"
            alt="SMK TARUNA BHAKTI Logo"
            fill
            className="object-contain drop-shadow-2xl filter brightness-110"
            unoptimized
          />
        </motion.div>
        
        {/* Pulsing Ring Effect */}
        <motion.div
          className="absolute inset-0 border-4 border-white/30 rounded-full"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
        <motion.div
          className="absolute inset-0 border-4 border-blue-300/30 rounded-full"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0, 0.3],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeOut",
            delay: 0.5,
          }}
        />
      </motion.div>
      
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg text-center"
      >
        SMK TARUNA BHAKTI
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="text-base md:text-lg text-blue-200 mt-2 text-center"
      >
        Perpustakaan Digital
      </motion.p>
    </motion.div>
  );
}

