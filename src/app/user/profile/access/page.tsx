'use client';

import { useSearchParams } from 'next/navigation';
import React, { useState, ChangeEvent, FormEvent, useEffect, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Loading from '@/app/user/loading';

const AccessPage: React.FC = () => {
  const params = useSearchParams();
  const userId = params.get('user_id');
  const [phone, setPhone] = useState<string>('');
  const [role, setRole] = useState<'driver' | 'accountant'>('driver'); // default role
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [accessList, setAccessList] = useState<{ id: string; phone: string; role: string }[]>([]);

  const handleRoleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setRole(e.target.value as 'driver' | 'accountant');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const response = await fetch('/api/users/grant-access', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        phone,
        role,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to Grant Access');
    }

    const data = await response.json();
    if (data.status === 400) {
      setError(data.error);
      return;
    }

    if (response.ok) {
      setSuccess('Access granted successfully');
      setPhone('');
      setRole('driver'); // Reset to default role
      fetchAccess(); // Refresh access list
    } else {
      setError('Failed to grant access');
    }
  };

  const fetchAccess = async () => {
    try {
      const res = await fetch(`/api/users/grant-access`);
      if (res.ok) {
        const resData = await res.json();
        setAccessList(resData.users);
      } else {
        alert('Failed to Fetch Access List');
      }
    } catch (error: any) {
      console.log(error);
      alert(error.message);
    }
  };

  const handleRevokeAccess = async (accessId: string) => {
    try {
      const response = await fetch(`/api/users/revoke-access/${accessId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setAccessList((prevList) => prevList.filter((item : any) => item.user_id !== accessId));
        alert('Access Revoked')
      } else {
        setError('Failed to revoke access');
      }
    } catch (error: any) {
      console.log(error);
      alert('Failed to revoke access');
    }
  };

  useEffect(() => {
    fetchAccess();
  }, []);

  return (
    <Suspense fallback={<Loading />}>
      <div className="max-w-4xl container border border-gray-300 shadow-md rounded-lg p-8">
        <h2 className="text-2xl font-bold text-bottomNavBarColor mb-6 ">
          Grant Access 
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700"
            >
              Phone Number
            </label>
            <input
              id="phone"
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm transition-all duration-200"
              placeholder="19876543210"
              required
            />
          </div>
          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-700"
            >
              Role
            </label>
            <select
              id="role"
              value={role}
              onChange={handleRoleChange}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm transition-all duration-200"
            >
              <option value="driver">Driver</option>
              <option value="accountant">Accountant</option>
            </select>
          </div>
          <Button
            type="submit"
            className="w-full bg-bottomNavBarColor text-white py-2 px-4 rounded-md hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bottomNavBarColor transition-all duration-200"
          >
            Grant Access
          </Button>
        </form>
        <div className="mt-6 text-center">
          {error && (
            <p className="text-red-600 text-sm font-medium">{error}</p>
          )}
          {success && (
            <p className="text-green-600 text-sm font-medium">{success}</p>
          )}
        </div>

        {/* Access List Section */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-bottomNavBarColor mb-4">
            Access List
          </h3>
          <ul className="space-y-4">
            {accessList?.map((access : any) => (
              <li
                key={access.user_id}
                className="flex justify-between items-center p-4 border border-gray-200 rounded-lg shadow-sm"
              >
                <div>
                  <p className="text-gray-800 font-medium">Phone: {access.phone}</p>
                  <p className="text-gray-600">Role: {access.role.name}</p>
                </div>
                <Button
                  onClick={() => handleRevokeAccess(access.user_id)}
                  className="bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700 transition-all duration-200"
                >
                  Revoke Access
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Suspense>
  );
};

export default AccessPage;
