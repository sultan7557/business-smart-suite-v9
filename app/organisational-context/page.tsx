import { Suspense } from "react"
import { Loader } from '@/components/ui/loader'
import { hasPermission } from "@/lib/auth";
import { getOrganizationalContextEntries } from "@/app/actions/organizational-context-actions";
import OrganizationalContextClient from "./organizational-context-client";

export default function OrganizationalContextPageWrapper(props: any) {
  return (
    <Suspense fallback={<Loader overlay message="Loading organizational context..." />}>
      <OrganizationalContextPage {...props} />
    </Suspense>
  )
}

async function OrganizationalContextPage({ searchParams }: { searchParams: Promise<{ showArchived?: string }> }) {
  const canEdit = await hasPermission("write", "organizational-context");
  const canDelete = await hasPermission("delete", "organizational-context");

  // Await searchParams and ensure showArchived is a boolean
  const sp = await searchParams;
  const showArchived = sp.showArchived === "true";

  // Fetch organizational context entries
  const result = await getOrganizationalContextEntries(showArchived);
  const entries = result.success ? result.data : [];

  return (
    <div className="p-4">
      <OrganizationalContextClient
        entries={entries}
        canEdit={canEdit}
        canDelete={canDelete}
        showArchived={showArchived}
      />
    </div>
  );
}