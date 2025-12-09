// app/editor/[slug]/page.tsx
import { prisma } from "../../../lib/prisma";
import { notFound } from "next/navigation";
import Editor from "../../../components/Editor";

interface Props {
  params: { slug: string };
}

export default async function EditPostPage({ params }: Props) {
  const post = await prisma.post.findUnique({
    where: { slug: params.slug },
  });

  if (!post) return notFound();

  // Pass existing data to your Editor component (you'll need to add props there)
  return (
    <Editor
      initialTitle={post.title}
      initialExcerpt={post.excerpt ?? ""}
      initialContent={post.content}
      postId={post.id}
    />
  );
}
