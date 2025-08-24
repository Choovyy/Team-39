import { notFound } from 'next/navigation';

export default function LobbyPage() {
  notFound(); // Force 404 when accessing /lobby without an ID
}
