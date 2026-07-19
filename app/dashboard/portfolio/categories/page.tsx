import { Suspense } from "react";
import { getCategories } from "@/lib/actions/categories";
import CategoriesList from "@/components/dashboard/portfolio/CategoriesList";
import CategoriesLoading from "./loading";

export const dynamic = "force-dynamic";

export const metadata = { title: "Categories — Dashboard" };

export default async function CategoriesPage() {
  const categories = await getCategories();
  return (
    <Suspense fallback={<CategoriesLoading />}>
      <CategoriesList items={categories} />
    </Suspense>
  );
}
