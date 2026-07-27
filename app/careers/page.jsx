"use client";

import { useState } from "react";
import { BottomNav, ContactOverlay, CursorRing, Header } from "../project-wall";

export default function CareersPage() {
  const [contact, setContact] = useState(false);

  return (
    <main className="phantom-page careers-page">
      <Header onContact={() => setContact(true)} />
      <section className="careers-copy">
        <p className="micro">● CAREERS</p>
        <h1>Phantom spirit represents the energy our team is built on. It's a mindset, a way of working and a set of values that inspire us to challenge the boundaries of what's possible. From the studio up, we created Phantom to be the company we always wanted to work at but could never find, bringing together the world's most unique and talented forward thinkers.</h1>
        <button type="button">View open roles</button>
      </section>
      <BottomNav active="careers" />
      <ContactOverlay open={contact} onClose={() => setContact(false)} />
      <CursorRing />
    </main>
  );
}
