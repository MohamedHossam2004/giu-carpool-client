"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import Cookies from 'js-cookie';

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const accessToken = Cookies.get('accessToken');

    const fetchPayments = async () => {
      try {
        const response = await fetch('http://100.27.16.234:4002/admin/payments', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch payments');
        }

        const data = await response.json();
        setPayments(data);
      } catch (err) {
        setError((err as Error).message);
        toast.error('Failed to fetch payments');
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold mb-4">Payments</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {payments.map((payment: any) => (
          <Card key={payment.id}>
            <CardHeader>
              <CardTitle>Payment ID: {payment.id}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p><strong>Price:</strong> {payment.price}</p>
              <p><strong>Status:</strong> <span className={`font-medium ${payment.status === 'succeeded' ? 'text-green-600' : payment.status === 'pending' ? 'text-yellow-600' : ''}`}>{payment.status}</span></p>
              <p><strong>User Email:</strong> {payment.user_email}</p>
              <p><strong>Created At:</strong> {payment.created_at ? new Date(payment.created_at).toLocaleDateString() : 'N/A'}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 