'use client';

import { ManageShell } from '@/components/manage/Shell';
import { EntityForm } from '@/components/manage/EntityForm';
import { siteSettingsFields } from '@/lib/manage-schemas';

export default function SiteSettingsPage() {
  return (
    <ManageShell>
      <div className="p-6 lg:p-8">
        <EntityForm
          resource="site-settings"
          singleton
          listHref="/manage/settings"
          title="Site Settings"
          fields={siteSettingsFields}
        />
      </div>
    </ManageShell>
  );
}
