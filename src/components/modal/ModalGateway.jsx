// src/components/modal/ModalGateway.jsx
'use client';

import dynamic from 'next/dynamic';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { parseModalParams, closeEntityModal } from '@/utils/url';

const Registry = {
  task:    dynamic(() => import('@/components/modal/ModalTask'),    { ssr: false }),
  project: dynamic(() => import('@/components/modal/ModalProject'), { ssr: false }),
  pitching:dynamic(() => import('@/components/modal/ModalPitching'),{ ssr: false }),
};

export default function ModalGateway() {
  const sp = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const { open, module, id, commentId } = parseModalParams(sp);
  if (!open || !module) return null;

  const Component = Registry[module];
  if (!Component) return null;

  const handleClose = () => closeEntityModal(router, pathname, sp);

  // Prop id spesifik (kompat)
  const specificIdProp =
    module === 'task'     ? { taskId: id } :
    module === 'project'  ? (id ? { projectId: id } : {}) :
    module === 'pitching' ? { pitchingId: id } : {};

  // ✅ Prop "open" & penutup yang sesuai dgn modal lama
  const openProps =
    module === 'task'     ? { modalTask: true,     onCancel: handleClose } :
    module === 'project'  ? { modalProject: true,  onCancel: handleClose } :
    module === 'pitching' ? { modalPitching: true, onCancel: handleClose } :
                            { onCancel: handleClose };

  return (
    <Component
      id={id}
      commentId={commentId || null}
      {...specificIdProp}
      {...openProps}
    />
  );
}
