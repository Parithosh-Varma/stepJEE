import { notFound } from "next/navigation";
import { CHEMISTRY_TOPICS, topicSlug, slugToTopic } from "@/lib/topics";
import { getRecentSolutions } from "@/lib/steps-repository";
import { TopicPage } from "@/components/topic-page";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return CHEMISTRY_TOPICS.map((topic) => ({ slug: topicSlug(topic) }));
}

export default async function ChemistryTopicPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const topic = slugToTopic(slug, CHEMISTRY_TOPICS);
  if (!topic) notFound();

  let initialSolutions: Awaited<ReturnType<typeof getRecentSolutions>> = [];
  try {
    initialSolutions = await getRecentSolutions(undefined, topic);
  } catch {
    // proceed with empty list
  }

  return (
    <TopicPage
      topic={topic}
      subject="Chemistry"
      backHref="/chemistry"
      initialSolutions={initialSolutions}
    />
  );
}
