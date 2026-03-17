import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Phone, Mail, MapPin, Menu, X, HardHat, Hammer, PaintRoller, Wrench, 
  Upload, ChevronRight, Globe, Trash2, LogIn, LogOut
} from "lucide-react";
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User } from "firebase/auth";
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase";

type Language = 'en' | 'ka' | 'ru';

const translations = {
  en: {
    nav: { home: "Home", about: "About", services: "Needs", projects: "Gallery", contact: "Apply" },
    hero: { title1: "Join Our", title2: "Team", subtitle: "We are a new company looking for skilled workers to renovate our newly built apartment in Batumi.", btn: "Apply Now" },
    about: { badge: "About Us", title: "Building The Future", p1: "IMGE Construction is a new, ambitious company. We have successfully built the structure of our new apartment and are now moving into the crucial renovation phase.", p2: "We are actively looking for dedicated and skilled workers—painters, electricians, plumbers, and general contractors—to help us bring this apartment to life.", list: ["New Apartment Project", "Looking for Workers", "Competitive Pay"], exp: "New Company" },
    services: { badge: "What We Need", title: "Required Skills", s1: "Renovation", d1: "General interior and exterior renovation.", s2: "Painting", d2: "Professional painting and finishing.", s3: "Electrical", d3: "Wiring and lighting installation.", s4: "Plumbing", d4: "Water systems and bathroom fitting." },
    projects: { badge: "Progress", title: "Our Work", upload: "Upload Photo", view: "View" },
    stats: { s1: "Active Project", s2: "Workers Needed", s3: "Great Team", s4: "Support" },
    contact: { badge: "Join Us", title: "Contact Us", desc: "Are you a skilled worker looking for a great project? Contact us today to join our renovation team.", phone: "Phone", email: "Email", loc: "Location", locVal: "Batumi, Georgia", formName: "Your Name", formPhone: "Phone Number", formMsg: "Your Skills / Message", formBtn: "Send Application" },
    footer: { rights: "IMGE Construction. All rights reserved." }
  },
  ka: {
    nav: { home: "მთავარი", about: "ჩვენ შესახებ", services: "საჭიროებები", projects: "გალერეა", contact: "აპლიკაცია" },
    hero: { title1: "შემოუერთდი", title2: "გუნდს", subtitle: "ჩვენ ვართ ახალი კომპანია და ვეძებთ გამოცდილ მუშებს ბათუმში ჩვენი ახალაშენებული აპარტამენტის სარემონტოდ.", btn: "შემოგვიერთდით" },
    about: { badge: "ჩვენ შესახებ", title: "ვაშენებთ მომავალს", p1: "IMGE Construction არის ახალი, ამბიციური კომპანია. ჩვენ წარმატებით ავაშენეთ ჩვენი ახალი აპარტამენტის სტრუქტურა და ახლა გადავდივართ მნიშვნელოვან სარემონტო ფაზაზე.", p2: "ჩვენ აქტიურად ვეძებთ გამოცდილ მუშებს — მღებავებს, ელექტრიკოსებს, სანტექნიკოსებს, რათა დაგვეხმარონ ამ აპარტამენტის დასრულებაში.", list: ["ახალი აპარტამენტის პროექტი", "ვეძებთ მუშებს", "კონკურენტული ანაზღაურება"], exp: "ახალი კომპანია" },
    services: { badge: "რა გვჭირდება", title: "საჭირო უნარები", s1: "რემონტი", d1: "ზოგადი შიდა და გარე რემონტი.", s2: "სამღებრო", d2: "პროფესიონალური სამღებრო სამუშაოები.", s3: "ელექტროობა", d3: "გაყვანილობა და განათების მონტაჟი.", s4: "სანტექნიკა", d4: "წყლის სისტემები და აბაზანის მოწყობა." },
    projects: { badge: "პროგრესი", title: "ჩვენი ნამუშევრები", upload: "ფოტოს ატვირთვა", view: "ნახვა" },
    stats: { s1: "აქტიური პროექტი", s2: "გვჭირდება მუშები", s3: "კარგი გუნდი", s4: "მხარდაჭერა" },
    contact: { badge: "შემოგვიერთდით", title: "კონტაქტი", desc: "ხართ გამოცდილი მუშა და ეძებთ კარგ პროექტს? დაგვიკავშირდით დღესვე.", phone: "ტელეფონი", email: "ელ. ფოსტა", loc: "ადგილმდებარეობა", locVal: "ბათუმი, საქართველო", formName: "თქვენი სახელი", formPhone: "ტელეფონის ნომერი", formMsg: "თქვენი უნარები / შეტყობინება", formBtn: "აპლიკაციის გაგზავნა" },
    footer: { rights: "IMGE Construction. ყველა უფლება დაცულია." }
  },
  ru: {
    nav: { home: "Главная", about: "О нас", services: "Требования", projects: "Галерея", contact: "Заявка" },
    hero: { title1: "Присоединяйтесь к", title2: "Команде", subtitle: "Мы новая компания, ищем квалифицированных рабочих для ремонта нашего недавно построенного апартамента в Батуми.", btn: "Подать заявку" },
    about: { badge: "О нас", title: "Строим Будущее", p1: "IMGE Construction - новая, амбициозная компания. Мы успешно построили каркас нашего нового апартамента и сейчас переходим к важнейшему этапу ремонта.", p2: "Мы активно ищем преданных своему делу и квалифицированных рабочих — маляров, электриков, сантехников — чтобы помочь нам воплотить этот апартамент в жизнь.", list: ["Новый проект апартамента", "Ищем рабочих", "Конкурентная оплата"], exp: "Новая компания" },
    services: { badge: "Что нам нужно", title: "Требуемые навыки", s1: "Ремонт", d1: "Общий внутренний и внешний ремонт.", s2: "Малярные работы", d2: "Профессиональная покраска и отделка.", s3: "Электрика", d3: "Монтаж проводки и освещения.", s4: "Сантехника", d4: "Системы водоснабжения и установка сантехники." },
    projects: { badge: "Прогресс", title: "Наша Работа", upload: "Загрузить фото", view: "Смотреть" },
    stats: { s1: "Активный проект", s2: "Нужны рабочие", s3: "Отличная команда", s4: "Поддержка" },
    contact: { badge: "Присоединяйтесь", title: "Контакты", desc: "Вы квалифицированный рабочий, ищущий отличный проект? Свяжитесь с нами сегодня.", phone: "Телефон", email: "Email", loc: "Местоположение", locVal: "Батуми, Грузия", formName: "Ваше имя", formPhone: "Номер телефона", formMsg: "Ваши навыки / Сообщение", formBtn: "Отправить заявку" },
    footer: { rights: "IMGE Construction. Все права защищены." }
  }
};

// Helper to compress image before uploading to stay under 1MB Firestore limit
const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1024;
        const MAX_HEIGHT = 1024;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
    };
    reader.onerror = error => reject(error);
  });
};

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [lang, setLang] = useState<Language>('en');
  const [photos, setPhotos] = useState<{id: string, url: string}[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [photoToDelete, setPhotoToDelete] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const t = translations[lang];
  const isAdmin = user?.email === 'imgeconstruction@gmail.com' || user?.email === 'giorgimamuladze21@gmail.com';

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    const q = query(collection(db, "photos"), orderBy("createdAt", "desc"));
    const unsubscribePhotos = onSnapshot(q, (snapshot) => {
      const photoData = snapshot.docs.map(doc => ({
        id: doc.id,
        url: doc.data().url
      }));
      setPhotos(photoData);
    }, (error) => {
      console.error("Error fetching photos:", error);
    });

    return () => {
      unsubscribeAuth();
      unsubscribePhotos();
    };
  }, []);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAdmin || !e.target.files || !user) return;
    
    setIsUploading(true);
    try {
      for (const file of Array.from(e.target.files)) {
        const compressedBase64 = await compressImage(file);
        await addDoc(collection(db, "photos"), {
          url: compressedBase64,
          createdAt: serverTimestamp(),
          uploadedBy: user.uid
        });
      }
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = ''; // Reset input
    }
  };

  const confirmDelete = async () => {
    if (!isAdmin || !photoToDelete) return;
    setDeleteError(null);
    try {
      await deleteDoc(doc(db, "photos", photoToDelete));
      setPhotoToDelete(null);
    } catch (error: any) {
      console.error("Delete error:", error);
      setDeleteError(error.message || "Failed to delete photo. Check permissions.");
    }
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name');
    const phone = formData.get('phone');
    const message = formData.get('message');
    
    const mailtoLink = `mailto:imgeconstruction@gmail.com?subject=New Application from Website&body=Name: ${name}%0D%0APhone: ${phone}%0D%0A%0D%0ASkills / Message:%0D%0A${message}`;
    window.location.href = mailtoLink;
  };

  const navLinks = [
    { name: t.nav.home, href: "#home" },
    { name: t.nav.about, href: "#about" },
    { name: t.nav.services, href: "#services" },
    { name: t.nav.projects, href: "#projects" },
    { name: t.nav.contact, href: "#contact" },
  ];

  const LanguageSelector = () => (
    <div className="flex items-center gap-2 text-sm font-bold tracking-wider">
      <Globe className="w-4 h-4 text-zinc-400" />
      <button onClick={() => setLang('en')} className={`hover:text-amber-400 transition-colors ${lang === 'en' ? 'text-amber-400' : 'text-zinc-400'}`}>ENG</button>
      <span className="text-zinc-700">|</span>
      <button onClick={() => setLang('ka')} className={`hover:text-amber-400 transition-colors ${lang === 'ka' ? 'text-amber-400' : 'text-zinc-400'}`}>KA</button>
      <span className="text-zinc-700">|</span>
      <button onClick={() => setLang('ru')} className={`hover:text-amber-400 transition-colors ${lang === 'ru' ? 'text-amber-400' : 'text-zinc-400'}`}>RU</button>
    </div>
  );

  return (
    <div className="min-h-screen font-sans selection:bg-amber-400 selection:text-zinc-950">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex-shrink-0 flex items-center gap-2">
              <HardHat className="h-8 w-8 text-amber-400" />
              <span className="font-bold text-2xl tracking-tight text-white">
                IMGE
              </span>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <div className="flex items-baseline space-x-8">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    className="text-zinc-300 hover:text-amber-400 transition-colors px-3 py-2 rounded-md text-sm font-medium uppercase tracking-wider"
                  >
                    {link.name}
                  </a>
                ))}
              </div>
              <div className="pl-6 border-l border-zinc-800 flex items-center gap-4">
                <LanguageSelector />
                {user ? (
                  <button onClick={handleLogout} className="text-zinc-400 hover:text-white" title="Logout">
                    <LogOut className="w-5 h-5" />
                  </button>
                ) : (
                  <button onClick={handleLogin} className="text-zinc-400 hover:text-white" title="Admin Login">
                    <LogIn className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-4">
              <LanguageSelector />
              {user ? (
                <button onClick={handleLogout} className="text-zinc-400 hover:text-white">
                  <LogOut className="w-5 h-5" />
                </button>
              ) : (
                <button onClick={handleLogin} className="text-zinc-400 hover:text-white">
                  <LogIn className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-zinc-300 hover:text-white p-2"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-zinc-900 border-b border-zinc-800">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-zinc-300 hover:text-amber-400 block px-3 py-2 rounded-md text-base font-medium uppercase tracking-wider"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1541888086425-d81bb19240f5?auto=format&fit=crop&q=80&w=2000"
            alt="Construction Site"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-zinc-950/70" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto mt-20">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black text-white uppercase tracking-tighter mb-6"
          >
            {t.hero.title1} <span className="text-amber-400">{t.hero.title2}</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-zinc-300 mb-10 max-w-2xl mx-auto font-light"
          >
            {t.hero.subtitle}
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <a
              href="#contact"
              className="inline-flex items-center gap-2 bg-amber-400 text-zinc-950 px-8 py-4 rounded-sm font-bold text-lg uppercase tracking-wider hover:bg-amber-300 transition-colors"
            >
              {t.hero.btn} <ChevronRight className="w-5 h-5" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative h-[500px]"
            >
              <img
                src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=1000"
                alt="Our Team"
                className="w-full h-full object-cover rounded-sm"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-6 -right-6 bg-amber-400 p-8 rounded-sm hidden md:block">
                <p className="text-4xl font-black text-zinc-950">1</p>
                <p className="text-zinc-900 font-bold uppercase tracking-wider">{t.about.exp}</p>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-amber-400 font-bold tracking-widest uppercase mb-2">{t.about.badge}</h2>
              <h3 className="text-4xl md:text-5xl font-black text-white mb-6 uppercase tracking-tight">
                {t.about.title}
              </h3>
              <p className="text-zinc-400 text-lg mb-6 leading-relaxed">
                {t.about.p1}
              </p>
              <p className="text-zinc-400 text-lg mb-8 leading-relaxed">
                {t.about.p2}
              </p>
              <ul className="space-y-4">
                {t.about.list.map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-white font-medium">
                    <div className="w-6 h-6 rounded-full bg-amber-400/20 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-amber-400" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-amber-400 font-bold tracking-widest uppercase mb-2">{t.services.badge}</h2>
            <h3 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight">{t.services.title}</h3>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: HardHat, title: t.services.s1, desc: t.services.d1 },
              { icon: PaintRoller, title: t.services.s2, desc: t.services.d2 },
              { icon: Wrench, title: t.services.s3, desc: t.services.d3 },
              { icon: Hammer, title: t.services.s4, desc: t.services.d4 }
            ].map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="bg-zinc-950 p-8 rounded-sm border border-zinc-800 hover:border-amber-400/50 transition-all group"
              >
                <service.icon className="w-12 h-12 text-amber-400 mb-6 group-hover:scale-110 transition-transform" />
                <h4 className="text-xl font-bold text-white mb-3 uppercase">{service.title}</h4>
                <p className="text-zinc-400">{service.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects / Gallery Section */}
      <section id="projects" className="py-24 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <h2 className="text-amber-400 font-bold tracking-widest uppercase mb-2">{t.projects.badge}</h2>
              <h3 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight">{t.projects.title}</h3>
            </div>
            
            {/* Upload Button - ONLY VISIBLE TO ADMIN */}
            {isAdmin && (
              <div>
                <label className={`cursor-pointer inline-flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-3 rounded-sm font-bold uppercase tracking-wider transition-colors ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                  <Upload className="w-5 h-5" />
                  {isUploading ? 'Uploading...' : t.projects.upload}
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                </label>
              </div>
            )}
          </div>

          {photos.length === 0 ? (
            <div className="text-center py-20 bg-zinc-900 rounded-sm border border-zinc-800">
              <p className="text-zinc-500">No photos uploaded yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {photos.map((photo, index) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: (index % 3) * 0.1 }}
                  className="relative group aspect-[4/3] overflow-hidden rounded-sm bg-zinc-900 cursor-pointer"
                  onClick={() => setSelectedPhoto(photo.url)}
                >
                  <img
                    src={photo.url}
                    alt={`Project ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-zinc-950/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="text-white font-bold uppercase tracking-widest border border-white/30 px-6 py-2">{t.projects.view}</span>
                  </div>
                  
                  {/* Delete Button - ONLY VISIBLE TO ADMIN */}
                  {isAdmin && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setPhotoToDelete(photo.id);
                      }}
                      className="absolute top-4 right-4 bg-red-500/80 hover:bg-red-500 text-white p-2 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      title="Delete Photo"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-amber-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: "1", label: t.stats.s1 },
              { number: "10+", label: t.stats.s2 },
              { number: "100%", label: t.stats.s3 },
              { number: "24/7", label: t.stats.s4 }
            ].map((stat, index) => (
              <div key={index}>
                <div className="text-4xl md:text-5xl font-black text-zinc-950 mb-2">{stat.number}</div>
                <div className="text-zinc-800 font-bold uppercase tracking-wider text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16">
            <div>
              <h2 className="text-amber-400 font-bold tracking-widest uppercase mb-2">{t.contact.badge}</h2>
              <h3 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight mb-8">{t.contact.title}</h3>
              <p className="text-zinc-400 mb-10 text-lg">
                {t.contact.desc}
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-zinc-800 rounded-sm flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold uppercase mb-1">{t.contact.phone}</h4>
                    <p className="text-zinc-400">+995 557 61 07 30</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-zinc-800 rounded-sm flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold uppercase mb-1">{t.contact.email}</h4>
                    <p className="text-zinc-400">imgeconstruction@gmail.com</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-zinc-800 rounded-sm flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold uppercase mb-1">{t.contact.loc}</h4>
                    <p className="text-zinc-400">{t.contact.locVal}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-zinc-950 p-8 rounded-sm border border-zinc-800">
              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-bold text-zinc-400 uppercase mb-2">{t.contact.formName}</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-sm px-4 py-3 text-white focus:outline-none focus:border-amber-400 transition-colors"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-bold text-zinc-400 uppercase mb-2">{t.contact.formPhone}</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-sm px-4 py-3 text-white focus:outline-none focus:border-amber-400 transition-colors"
                    placeholder="+995 ..."
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-bold text-zinc-400 uppercase mb-2">{t.contact.formMsg}</label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={4}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-sm px-4 py-3 text-white focus:outline-none focus:border-amber-400 transition-colors resize-none"
                    placeholder="..."
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full bg-amber-400 text-zinc-950 font-bold uppercase tracking-wider py-4 rounded-sm hover:bg-amber-300 transition-colors"
                >
                  {t.contact.formBtn}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-950 py-8 border-t border-zinc-900 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <HardHat className="h-6 w-6 text-amber-400" />
            <span className="font-bold text-xl tracking-tight text-white">
              IMGE
            </span>
          </div>
          <p className="text-zinc-500 text-sm">
            &copy; {new Date().getFullYear()} {t.footer.rights}
          </p>
        </div>
      </footer>

      {/* Image Viewer Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-zinc-950/90 p-4 backdrop-blur-sm"
            onClick={() => setSelectedPhoto(null)}
          >
            <button 
              className="absolute top-6 right-6 text-zinc-400 hover:text-white transition-colors"
              onClick={() => setSelectedPhoto(null)}
            >
              <X className="w-8 h-8" />
            </button>
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={selectedPhoto}
              alt="Full size project"
              className="max-w-full max-h-full object-contain rounded-sm shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              referrerPolicy="no-referrer"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {photoToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-zinc-950/80 p-4 backdrop-blur-sm"
            onClick={() => setPhotoToDelete(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-zinc-900 border border-zinc-800 p-8 rounded-sm max-w-md w-full text-center shadow-2xl"
            >
              <Trash2 className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2 uppercase tracking-tight">Delete Photo?</h3>
              <p className="text-zinc-400 mb-6">Are you sure you want to remove this photo from the gallery? This action cannot be undone.</p>
              
              {deleteError && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-sm mb-6 text-sm">
                  {deleteError}
                </div>
              )}

              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => {
                    setPhotoToDelete(null);
                    setDeleteError(null);
                  }}
                  className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold uppercase tracking-wider rounded-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold uppercase tracking-wider rounded-sm transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}