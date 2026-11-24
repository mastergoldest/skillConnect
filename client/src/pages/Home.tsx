import {
    Search,
    ArrowRight,
    ArrowUpRight,
    Palette,
    Code2,
    Wrench,
    Camera,
    GraduationCap,
    Scissors,
    PenTool,
    Laptop,
    ShieldCheck,
    Users,
    MessageCircle,
    CheckCircle2,
    Sparkles,
  } from "lucide-react";
  
  import Navbar from "../components/layout/Navbar";
  import Footer from "../components/layout/Footer";
  import CategoryCard from "../components/home/CategoryCard";
  
  const categories = [
    {
      title: "Graphics & Design",
      description: "Creative designs, branding, flyers and visual identities.",
      icon: Palette,
      count: "Creative services",
    },
    {
      title: "Web Development",
      description: "Websites, software solutions and digital experiences.",
      icon: Code2,
      count: "Technology services",
    },
    {
      title: "Phone & Laptop Repair",
      description: "Reliable technical support and device repairs.",
      icon: Wrench,
      count: "Technical services",
    },
    {
      title: "Photography",
      description: "Photography, videography and creative media services.",
      icon: Camera,
      count: "Media services",
    },
    {
      title: "Tutoring",
      description: "Academic support, lessons and knowledge sharing.",
      icon: GraduationCap,
      count: "Educational services",
    },
    {
      title: "Fashion & Beauty",
      description: "Fashion design, styling and beauty services.",
      icon: Scissors,
      count: "Lifestyle services",
    },
    {
      title: "Writing & Content",
      description: "Content writing, editing and professional documentation.",
      icon: PenTool,
      count: "Writing services",
    },
    {
      title: "Digital Services",
      description: "Computer assistance and other digital solutions.",
      icon: Laptop,
      count: "Digital services",
    },
  ];
  
  const steps = [
    {
      number: "01",
      icon: Users,
      title: "Create your account",
      description:
        "Register with your student details and complete the verification process.",
    },
    {
      number: "02",
      icon: Search,
      title: "Discover or offer skills",
      description:
        "Explore available services or create your own professional service profile.",
    },
    {
      number: "03",
      icon: MessageCircle,
      title: "Connect and collaborate",
      description:
        "Send service requests, receive offers and communicate with other students.",
    },
  ];
  
  export default function Home() {
    return (
      <div className="min-h-screen bg-background text-foreground">
  
        <Navbar />
  
        {/* HERO SECTION */}
        <section id="home" className="relative overflow-hidden">
  
          {/* Decorative backgrounds */}
          <div className="pointer-events-none absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[110px]" />
  
          <div className="pointer-events-none absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-accent/10 blur-[100px]" />
  
          <div className="page-container relative grid items-center gap-16 py-20 lg:grid-cols-2 lg:py-28">
  
            {/* LEFT CONTENT */}
            <div className="max-w-2xl">
  
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2">
                <Sparkles size={15} className="text-primary" />
  
                <span className="text-xs font-bold tracking-wide text-primary sm:text-sm">
                  A COMMUNITY OF STUDENT TALENT
                </span>
              </div>
  
              <h1 className="font-heading text-4xl font-extrabold leading-[1.12] tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl">
                Your skills deserve to be{" "}
                <span className="text-primary">
                  discovered.
                </span>
              </h1>
  
              <p className="mt-7 max-w-xl text-base leading-8 text-muted-foreground sm:text-lg">
                Discover talented students, find services you need,
                and connect with people who can turn ideas into reality.
                Your campus is full of possibilities.
              </p>
  
              {/* SEARCH */}
              <div className="mt-9 flex flex-col gap-3 rounded-2xl border border-border bg-card p-2 shadow-xl shadow-black/[0.03] sm:flex-row sm:items-center">
  
                <div className="flex flex-1 items-center gap-3 px-3">
                  <Search size={21} className="shrink-0 text-muted-foreground" />
  
                  <input
                    type="text"
                    placeholder="What service are you looking for?"
                    className="w-full bg-transparent py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
                  />
                </div>
  
                <a
                  href="#categories"
                  className="flex items-center justify-center gap-2 rounded-xl bg-primary px-7 py-4 text-sm font-bold text-primary-foreground transition-all hover:opacity-90"
                >
                  Explore Services
                  <ArrowRight size={18} />
                </a>
  
              </div>
  
              <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
  
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={17} className="text-accent" />
                  Verified students
                </span>
  
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={17} className="text-accent" />
                  Campus-focused
                </span>
  
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={17} className="text-accent" />
                  Easy connections
                </span>
  
              </div>
            </div>
  
            {/* RIGHT VISUAL */}
            <div className="relative mx-auto w-full max-w-lg">
  
              <div className="absolute inset-8 rounded-[40px] bg-primary/10 blur-3xl" />
  
              <div className="relative rounded-[30px] border border-border bg-card p-5 shadow-2xl shadow-black/10 sm:p-7">
  
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Discover talent
                    </p>
  
                    <h3 className="mt-2 font-heading text-xl font-bold">
                      Explore student skills
                    </h3>
                  </div>
  
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Sparkles size={22} />
                  </div>
                </div>
  
                {/* FEATURED SERVICE */}
                <div className="mt-7 rounded-2xl bg-muted p-5">
  
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-accent/10 px-3 py-1.5 text-xs font-bold text-accent">
                      FEATURED SKILL
                    </span>
  
                    <ShieldCheck size={21} className="text-accent" />
                  </div>
  
                  <div className="mt-6 flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                      <Palette size={27} />
                    </div>
  
                    <div>
                      <h4 className="font-heading font-bold">
                        Graphics Design
                      </h4>
  
                      <p className="mt-1 text-sm text-muted-foreground">
                        Creative student services
                      </p>
                    </div>
                  </div>
  
                  <div className="mt-6 flex flex-wrap gap-2">
                    {["Flyer Design", "Branding", "Social Media"].map((skill) => (
                      <span
                        key={skill}
                        className="rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
  
                </div>
  
                {/* BOTTOM INFORMATION */}
                <div className="mt-5 grid grid-cols-2 gap-4">
  
                  <div className="rounded-2xl border border-border p-4">
                    <Users size={21} className="text-primary" />
  
                    <p className="mt-3 text-sm font-bold">
                      Student community
                    </p>
  
                    <p className="mt-1 text-xs text-muted-foreground">
                      Discover campus talent
                    </p>
                  </div>
  
                  <div className="rounded-2xl border border-border p-4">
                    <MessageCircle size={21} className="text-accent" />
  
                    <p className="mt-3 text-sm font-bold">
                      Direct connection
                    </p>
  
                    <p className="mt-1 text-xs text-muted-foreground">
                      Connect and collaborate
                    </p>
                  </div>
  
                </div>
  
              </div>
  
              {/* FLOATING BADGE */}
              <div className="absolute -bottom-6 -left-4 hidden items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-xl sm:flex">
  
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <ShieldCheck size={22} />
                </div>
  
                <div>
                  <p className="text-sm font-bold">
                    Student verification
                  </p>
  
                  <p className="text-xs text-muted-foreground">
                    Built around campus trust
                  </p>
                </div>
  
              </div>
  
            </div>
  
          </div>
        </section>
  
        {/* CATEGORIES */}
        <section id="categories" className="border-y border-border bg-card/40 py-24">
  
          <div className="page-container">
  
            <div className="mx-auto max-w-2xl text-center">
  
              <span className="text-sm font-bold uppercase tracking-widest text-primary">
                Explore opportunities
              </span>
  
              <h2 className="mt-4 font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">
                Find the right skill for your needs
              </h2>
  
              <p className="mt-5 leading-8 text-muted-foreground">
                From creative work to technical solutions, discover
                the diverse skills available within the student community.
              </p>
  
            </div>
  
            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
  
              {categories.map((category) => (
                <CategoryCard
                  key={category.title}
                  {...category}
                />
              ))}
  
            </div>
  
          </div>
        </section>
  
        {/* HOW IT WORKS */}
        <section id="how-it-works" className="py-24">
  
          <div className="page-container">
  
            <div className="mx-auto max-w-2xl text-center">
  
              <span className="text-sm font-bold uppercase tracking-widest text-primary">
                Simple process
              </span>
  
              <h2 className="mt-4 font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">
                How SkillConnect works
              </h2>
  
              <p className="mt-5 leading-8 text-muted-foreground">
                Whether you need a service or want to showcase your
                abilities, getting started is straightforward.
              </p>
  
            </div>
  
            <div className="mt-16 grid gap-8 md:grid-cols-3">
  
              {steps.map((step) => {
                const Icon = step.icon;
  
                return (
                  <div
                    key={step.number}
                    className="relative rounded-3xl border border-border bg-card p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5"
                  >
  
                    <div className="flex items-center justify-between">
  
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Icon size={26} />
                      </div>
  
                      <span className="font-heading text-4xl font-extrabold text-muted/80">
                        {step.number}
                      </span>
  
                    </div>
  
                    <h3 className="mt-8 font-heading text-xl font-bold">
                      {step.title}
                    </h3>
  
                    <p className="mt-4 text-sm leading-7 text-muted-foreground">
                      {step.description}
                    </p>
  
                  </div>
                );
              })}
  
            </div>
  
          </div>
        </section>
  
        {/* CTA */}
        <section className="pb-24">
  
          <div className="page-container">
  
            <div className="relative overflow-hidden rounded-[32px] bg-primary px-7 py-16 text-center text-white sm:px-14 sm:py-20">
  
              <div className="pointer-events-none absolute -right-20 -top-32 h-80 w-80 rounded-full border-[50px] border-white/10" />
  
              <div className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full border-[50px] border-white/10" />
  
              <div className="relative mx-auto max-w-2xl">
  
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold">
                  <Sparkles size={15} />
                  YOUR SKILLS MATTER
                </span>
  
                <h2 className="mt-7 font-heading text-3xl font-extrabold sm:text-5xl">
                  Your next opportunity starts here.
                </h2>
  
                <p className="mt-6 leading-8 text-white/80">
                  Join a community where students discover skills,
                  share their abilities and connect with one another.
                </p>
  
                <a
                  href="#home"
                  className="mt-9 inline-flex items-center gap-3 rounded-xl bg-secondary px-7 py-4 text-sm font-bold text-primary transition-all hover:-translate-y-1 hover:shadow-xl"
                >
                  Discover SkillConnect
                  <ArrowUpRight size={18} />
                </a>
  
              </div>
  
            </div>
  
          </div>
        </section>
  
        <Footer />
  
      </div>
    );
  }