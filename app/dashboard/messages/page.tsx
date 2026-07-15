import { Suspense } from "react";
import { getMessages } from "@/lib/actions/messages";
import MessagesList from "@/components/dashboard/messages/MessagesList";
import MessagesLoading from "./loading";

export const dynamic = "force-dynamic";

export const metadata = { title: "Messages — Dashboard" };

export default async function MessagesPage() {
  const messages = await getMessages();
  return (
    <Suspense fallback={<MessagesLoading />}>
      <MessagesList messages={messages} />
    </Suspense>
  );
}
