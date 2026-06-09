'use client';

import { ManageShell } from '@/components/manage/Shell';
import { EntityForm } from '@/components/manage/EntityForm';
import { emailSettingsFields } from '@/lib/manage-schemas';

export default function EmailSettingsPage() {
  return (
    <ManageShell>
      <div className="p-6 lg:p-8">
        <EntityForm
          resource="email-settings"
          singleton
          listHref="/manage/settings"
          title="Email Settings"
          fields={emailSettingsFields}
        />
      </div>
    </ManageShell>
  );
}
