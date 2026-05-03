import { Profile, NavItem, Project, JourneyItem, TechItem, Achievement } from '../types';

export const PROFILE: Profile = {
  name: "Zakky Ahmad El-Kholily",
  role: "Front-End Web Developer | Public Speaker",
  tagline: "IT Enthusiast dari jurusan Teknik Jaringan Komputer dan Telekomunikasi yang senang memecahkan masalah, membangun sistem yang berjalan dengan baik, terus belajar teknologi baru, serta senang berbagi pengetahuan dan pengalaman.",
  socials: {
    github: "https://github.com/codenamezaxx",
    linkedin: "https://linkedin.com/in/zakky-el",
    instagram: "https://instagram.com/codenamezaxx",
    telegram: "https://t.me/codenamezaxx",
    email: "mailto:zakky.ahmad@protonmail.com"
  }
};

export const NAV_ITEMS: NavItem[] = [
  { label: "Beranda", href: "#hero" },
  { label: "Perjalanan", href: "#journey" },
  { label: "Tech Stack", href: "#tech" },
  { label: "Proyek", href: "#projects" },
  { label: "Sertifikat", href: "#achievements" },
  { label: "Kontak", href: "#contacts" },
];

export const JOURNEY: JourneyItem[] = [
  {
    id: 1,
    year: "2020",
    title: "Mulai belajar programming",
    description: "Dasar-dasar programming dan problem solving."
  },
  {
    id: 2,
    year: "2021",
    title: "Fokus pada Web Development",
    description: "HTML, CSS, JavaScript dan aplikasi web kecil."
  },
  {
    id: 3,
    year: "2022",
    title: "Langkah awal Public Speaking",
    description: "Melatih kemampuan untuk berani berbicara di depan umum."
  },
  {
    id: 4,
    year: "2023",
    title: "Game Development",
    description: "Fokus mempelajari game engine dan interactive systems."
  },
  {    
    id: 5,
    year: "2024",
    title: "Mengikuti Organisasi",
    description: "Melatih teamwork dan leadership melalui kegiatan organisasi."
  },
  {
    id: 6,
    year: "2025",
    title: "Membangun Portofolio",
    description: "Membangun proyek portofolio serta terjun ke dunia kerja melalui program internship."
  }
];

// Using Devicon URLs for authentic logos
export const TECH_STACK: TechItem[] = [
  { name: "HTML5", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg" },
  { name: "CSS3", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg" },
  { name: "JavaScript", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" },
  { name: "TypeScript", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" },
  { name: "React", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" },
  { name: "Tailwind", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg" },
  { name: "Node.js", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" },
  { name: "Python", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" },
  { name: "Godot Engine", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/godot/godot-original.svg" },
  { name: "Unity Engine", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/unity/unity-original.svg" },
  { name: "C#", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/csharp/csharp-original.svg" },
  { name: "Git", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg" },
];

export const PROJECTS: Project[] = [
  {
    id: 1,
    title: "Online Quran",
    description: "Aplikasi pembacaan Al-Quran online dengan fitur pencarian, tafsir, dan terjemahan.",
    category: "Web App",
    image: "/images/quranjs.jpg",
    tech: ["React",  "W3.CSS", "Al-Quran API"],
    links: {
      github: "https://github.com/codenamezaxx/ReactJs-Online-Quran",
      demo: "https://reactjs-quran.vercel.app"
    }
  },
  {
    id: 2,
    title: "SI-PORSI GERMAS",
    description: "Platform terpadu untuk mengelola pelaporan, evaluasi, dan arsip program GERMAS di tatanan tempat kerja di Provinsi Jawa Timur. Dibangun saat mengikuti program internship di Dinas Kesehatan Provinsi Jawa Timur.",
    category: "Web App",
    image: "/images/germas.png",
    tech: ["React", "Laravel", "MySQL", "PHP", "TypeScript", "Tailwind"],
    links: {
      github: "https://github.com/codenamezaxx/siporsi-germas",
      demo: "https://demo.com"
    }
  },
  {
    id: 3,
    title: "Cyberurnner",
    description: "Game platformer 2D dengan tema cyberpunk. Pemain mengendalikan karakter yang harus berlari dan melompat melewati rintangan serta serangan musuh sambil mengumpulkan koin dan gems.",
    category: "Game Dev",
    image: "https://img.itch.zone/aW1nLzkwNzYzNTEuanBn/315x250%23c/uI6egT.jpg",
    tech: ["Godot Engine", "GDScript", "Photoshop", "Aseprite"],
    links: {
      itchio: "https://codenamezaxx.itch.io/cyberunner-demo"
    }
  },
  {
    id: 4,
    title: "Diamond Hunter: The Rivals",
    description: "Kumpulkan berlian sebanyak mungkin dan hindari serangan musuh pada game 2D yang sederhana namun seru dan menantang.",
    category: "Game Dev",
    image: "https://img.itch.zone/aW1nLzkxMDI0MDgucG5n/315x250%23c/HWbGq1.png",
    tech: ["Construct 2", "Photoshop"],
    links: {
      itchio: "https://codenamezaxx.itch.io/diamond-hunter-the-rivals",
      demo: "https://diamond-hunter.netlify.app"
    }
  }
];

export const ACHIEVEMENTS: Achievement[] = [
  { id: 1, title: "Memulai Pemrograman dengan Python", category: "Kursus Online", year: "2025", pdfPath: "/certificates/cert-1.pdf" },
  { id: 2, title: "Belajar Dasar AI", category: "Kursus Online", year: "2025", pdfPath: "/certificates/cert-2.pdf" },
  { id: 3, title: "Public Speaking Training Course", category: "Seminar Pelatihan", year: "2024", pdfPath: "/certificates/cert-3.pdf" },
  { id: 4, title: "Public Speaking With Trainer", category: "Webinar Online", year: "2024", pdfPath: "/certificates/cert-4.pdf" },
  { id: 5, title: "Building Persona and Image", category: "Webinar Online", year: "2024", pdfPath: "/certificates/cert-5.pdf" },
  { id: 6, title: "Youth Leadership Camps", category: "Webinar Online", year: "2024", pdfPath: "/certificates/cert-6.pdf" },
];