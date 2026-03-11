import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../ui/Button/Button";
import { Icons } from "../../ui/Icons/Icons";
import { cn } from "../../../utils/cn";
import "./Navbar.css";

const NAV_LINKS = [
  { label: "Trading", href: "#trading" },
  { label: "Accounts", href: "#accounts" },
  { label: "Platform", href: "#platform" },
  { label: "About", href: "#about" },
  { label: "FAQ", href: "#faq" },
];

export function Navbar() {
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={cn("navbar", scrolled ? "navbar--scrolled" : "navbar--top")}>
      <div className="container navbar__inner">

        {/* Logo */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            navigate("/");
          }}
          className="navbar__logo"
        >
          <Icons.TrendingUp size={28} style={{ color: "var(--primary)" }} />
          <span className="navbar__logo-text">TradeX</span>
        </a>

        {/* Desktop links */}
        <div className="navbar__links">
          {NAV_LINKS.map((link) => (
            <a key={link.label} href={link.href} className="navbar__link">
              {link.label}
            </a>
          ))}
        </div>

        {/* Buttons */}
        <div className="navbar__actions">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/login")}
          >
            Sign In
          </Button>

          <Button
            size="sm"
            onClick={() => navigate("/register")}
          >
            Register
          </Button>

          <button
            className="navbar__hamburger"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {open ? <Icons.X size={24} /> : <Icons.Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={cn("navbar__mobile-menu", open ? "open" : "")}>
        {NAV_LINKS.map((link) => (
          <a key={link.label} href={link.href} onClick={() => setOpen(false)}>
            {link.label}
          </a>
        ))}

        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <Button
            variant="outline"
            size="sm"
            style={{ flex: 1 }}
            onClick={() => {
              setOpen(false);
              navigate("/login");
            }}
          >
            Sign In
          </Button>

          <Button
            size="sm"
            style={{ flex: 1 }}
            onClick={() => {
              setOpen(false);
              navigate("/register");
            }}
          >
            Register
          </Button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;