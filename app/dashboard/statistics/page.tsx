import { Suspense } from "react";
import { getStatistics } from "../../../lib/actions/statistics";
import StatisticsList from "../../../components/dashboard/statistics/StatisticsList";
import StatisticsLoading from "./loading";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Statistics — Dashboard",
};

export default async function StatisticsPage() {
  const statistics = await getStatistics();

  return (
    <Suspense fallback={<StatisticsLoading />}>
      <StatisticsList statistics={statistics} />
    </Suspense>
  );
}