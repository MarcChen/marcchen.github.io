import NotFound from "@/components/layout/NotFound";
import { getAuthor } from "@/lib/data";

export default function NotFoundPage() {
  const author = getAuthor("en");
  return <NotFound siteName={author.name} />;
}
