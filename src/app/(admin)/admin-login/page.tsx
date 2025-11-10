'use client';

import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { Suspense, useEffect, useState } from 'react';


const AdminLogin = () => {
  const router = useRouter();
  const params = useSearchParams();
  const phone = params ? params.get('phone') : ''; // Handle fallback for `useSearchParams`
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (!phone || !(JSON.parse(process.env.NEXT_PUBLIC_ADMIN_LOGIN_PHONE as string) as [string]).includes(phone)) {
      router.push('/user/home');
    }
    if (localStorage.getItem('adminToken')) {
      router.push('/admin-page');
    }
  }, [phone, router]);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, password }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data) {
          localStorage.setItem('adminToken', JSON.stringify(data.token));
          router.push('/admin-page');
        } else {
          console.error('Token missing in response');
        }
      } else {
        const errorText = await response.text();
        console.error('Login failed:', errorText);
      }
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white p-6 rounded-lg shadow-md"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Admin Login</h2>

        <div className="mb-4">
          <label htmlFor="phone">Phone</label>
          <input type="text" id="phone" name="phone" value={phone || ''} disabled />
        </div>

        <div className="mb-4">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={handlePasswordChange}
            required
          />
        </div>

        <Button type="submit" className="w-full">
          Submit
        </Button>
      </form>
    </div>
  );
};


export default function Page() {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <AdminLogin />
      </Suspense>
    );
  }

