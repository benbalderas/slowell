import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

interface Props {
  children: React.ReactNode;
  params: Promise<{ handle: string }>;
}

export default async function AddLayout({ children, params }: Props) {
  const { handle } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const viewer = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { handle: true },
  });
  if (!viewer || viewer.handle !== handle) notFound();

  return <>{children}</>;
}
