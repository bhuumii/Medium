import { prisma } from "../../../lib/prisma";
import { notFound } from "next/navigation";
import Editor from "../../../components/Editor";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function EditPostPage({ params }: Props) {
 
  const resolved = await params;
  const slug = resolved.slug;

  const post = await prisma.post.findUnique({
    where: { slug },
  });

  if (!post) return notFound();


  return (
    <Editor
      initialTitle={post.title}
      initialExcerpt={post.excerpt ?? ""}
      initialContent={post.content}
      postId={post.id}
    />
  );
}
