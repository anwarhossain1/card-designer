import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const LINKS = [
  { href: "#templates", label: "Templates" },
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-hairline/70 bg-panel/80 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between">
        <Logo />

        <nav className="hidden items-center gap-8 md:flex">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-ink-600 transition-colors hover:text-ink-900"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle size="sm" />
          <Link href="/editor">
            <Button size="sm">Start Designing</Button>
          </Link>
        </div>
      </Container>
    </header>
  );
}
