import type { Metadata } from "next";
import HomePage from "../src/pages/Home";

export const metadata: Metadata = {
  title: "CafeX — Crafted coffee, made personal",
  description: "Order handcrafted coffee, fresh bakery favorites, and local café classics from CafeX.",
};

export default function Home() {
  return <HomePage />;
}
