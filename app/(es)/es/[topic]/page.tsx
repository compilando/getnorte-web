import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { metadataFor } from "@/components/root";
import { TopicPage } from "@/components/topic-page";
import { SLUGS, TOPIC_COPY, TOPICS, topicFromSlug, topicPath } from "@/lib/topics";

export const dynamicParams = false;

export function generateStaticParams() {
  return TOPICS.map((t) => ({ topic: SLUGS[t].es }));
}

export function generateMetadata({ params }: { params: { topic: string } }): Metadata {
  const topic = topicFromSlug(params.topic, "es");
  if (!topic) return {};
  const c = TOPIC_COPY[topic].es;
  return metadataFor("es", {
    title: c.title,
    description: c.description,
    path: topicPath(topic, "es"),
    paths: { en: topicPath(topic, "en"), es: topicPath(topic, "es") },
  });
}

export default function Page({ params }: { params: { topic: string } }) {
  const topic = topicFromSlug(params.topic, "es");
  if (!topic) notFound();
  return <TopicPage topic={topic} lang="es" />;
}
