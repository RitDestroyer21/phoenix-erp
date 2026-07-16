'use client';

import { useState } from 'react';
import { onboardSingleManagement } from '@/lib/db/resourcelist/management';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function SingleManagementForm() {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setProcessing(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);
    
    const payload = {
      firstName: formData.get('firstName') as string,
      middleName: (formData.get('middleName') as string) || null,
      lastName: formData.get('lastName') as string,
      dob: formData.get('dob') as string,
      gender: formData.get('gender') as string,
      phone1: Number(formData.get('phone1')),
      phone2: formData.get('phone2') ? Number(formData.get('phone2')) : null,
      mail1: formData.get('mail1') as string,
      mail2: (formData.get('mail2') as string) || null,
    };

    try {
      await onboardSingleManagement(payload);
      setSuccess(`Management profile for ${payload.firstName} ${payload.lastName} has been securely configured!`);
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      setError(err.message || 'An explicit validation fault stopped execution.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl mx-auto bg-white dark:bg-zinc-950 p-6 border rounded-xl shadow-sm">
      {error && <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded">{error}</div>}
      {success && <div className="p-3 text-sm text-green-500 bg-green-50 border border-green-200 rounded">{success}</div>}

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="firstName">First Name</Label>
          <Input id="firstName" name="firstName" required className="mt-1" />
        </div>
        <div>
          <Label htmlFor="middleName">Middle Name</Label>
          <Input id="middleName" name="middleName" className="mt-1" />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name</Label>
          <Input id="lastName" name="lastName" required className="mt-1" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="dob">Date of Birth</Label>
          <Input id="dob" name="dob" type="date" required className="mt-1" />
        </div>
        <div>
          <Label htmlFor="gender">Gender</Label>
          <select id="gender" name="gender" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1">
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHERS">Others</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="mail1">Primary Official Email</Label>
          <Input id="mail1" name="mail1" type="email" required className="mt-1" />
        </div>
        <div>
          <Label htmlFor="mail2">Secondary Personal Email</Label>
          <Input id="mail2" name="mail2" type="email" className="mt-1" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone1">Primary Contact Number</Label>
          <Input id="phone1" name="phone1" required className="mt-1" />
        </div>
        <div>
          <Label htmlFor="phone2">Secondary Contact Number</Label>
          <Input id="phone2" name="phone2" className="mt-1" />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={processing}>
        {processing ? 'Registering Credentials...' : 'Onboard Management Member'}
      </Button>
    </form>
  );
}