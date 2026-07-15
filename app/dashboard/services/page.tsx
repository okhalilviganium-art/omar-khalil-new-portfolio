import { Suspense } from "react";
import { getServices } from "@/lib/actions/services";
import ServicesList from "@/components/dashboard/services/ServicesList";
import ServicesLoading from "./loading";

export const dynamic = "force-dynamic";

export const metadata = { title: "Services — Dashboard" };

export default async function ServicesPage() {
  const services = await getServices();
  return (
    <Suspense fallback={<ServicesLoading />}>
      <ServicesList services={services} />
    </Suspense>
  );
}
