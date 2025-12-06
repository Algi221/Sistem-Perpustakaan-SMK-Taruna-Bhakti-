'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import UserManagement from '@/components/admin/UserManagement';

export default function UserManagementClient({ users: initialUsers }) {
  const [users, setUsers] = useState(initialUsers);
  const router = useRouter();

  const handleUserDelete = (userId) => {
    setUsers(users.filter(u => u.id !== userId));
    // Refresh to get latest data
    router.refresh();
  };

  const handlePasswordReset = () => {
    // Refresh to get latest data
    router.refresh();
  };

  return (
    <UserManagement
      users={users}
      onUserDelete={handleUserDelete}
      onPasswordReset={handlePasswordReset}
    />
  );
}

