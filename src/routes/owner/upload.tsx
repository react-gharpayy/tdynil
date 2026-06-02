import { createFileRoute } from '@tanstack/react-router';
import { AppShell } from '@/components/AppShell';
import { OwnerUpload } from '@/owner/pages/OwnerUpload';

export const Route = createFileRoute('/owner/upload')({
  head: () => ({ meta: [{ title: 'Add Property - Owner Portal' }] }),
  component: () => <AppShell><OwnerUpload /></AppShell>,
});
