import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Users } from "lucide-react";

type CustomerAgg = {
  name: string;
  totalBilled: number;
  totalOutstanding: number;
  invoiceCount: number;
  lastInvoiceDate: string | null;
};

const CustomersPage = () => {
  const navigate = useNavigate();
  const [businessId, setBusinessId] = useState<string | null>(null);

  useEffect(() => {
    const fetchBusiness = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("business_id")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data?.business_id) setBusinessId(data.business_id);
    };
    fetchBusiness();
  }, []);

  const { data: receivables, isLoading } = useQuery({
    queryKey: ["receivables-customers", businessId],
    queryFn: async () => {
      if (!businessId) return [];
      const { data } = await supabase
        .from("receivables")
        .select("*")
        .eq("business_id", businessId);
      return data || [];
    },
    enabled: !!businessId,
  });

  const customersMap = receivables?.reduce((acc, r) => {
    const customerName = r.customer_name || "Unknown Customer";
    if (!acc[customerName]) {
      acc[customerName] = {
        name: customerName,
        totalBilled: 0,
        totalOutstanding: 0,
        invoiceCount: 0,
        lastInvoiceDate: r.invoice_date ?? null,
      };
    }
    acc[customerName].totalBilled += Number(r.amount) || 0;
    acc[customerName].totalOutstanding += Number(r.outstanding) || 0;
    acc[customerName].invoiceCount += 1;

    if (r.invoice_date) {
      const currentDate = new Date(r.invoice_date);
      const lastDate = acc[customerName].lastInvoiceDate
        ? new Date(acc[customerName].lastInvoiceDate as string)
        : null;
      if (!lastDate || currentDate > lastDate) {
        acc[customerName].lastInvoiceDate = r.invoice_date;
      }
    }

    return acc;
  }, {} as Record<string, CustomerAgg>);

  const customers = Object.values(customersMap || {}).sort(
    (a, b) => b.totalOutstanding - a.totalOutstanding,
  );

  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const activeCustomers = customers.filter(
    (c) => c.lastInvoiceDate && new Date(c.lastInvoiceDate) >= ninetyDaysAgo,
  );
  const totalOutstanding = customers.reduce(
    (sum, c) => sum + c.totalOutstanding,
    0,
  );

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-lg" />
      </DashboardLayout>
    );
  }

  if (!customers || customers.length === 0) {
    return (
      <DashboardLayout>
        <Card className="p-12 text-center bg-fyn-beige-dark border-fyn-ink-10">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-full bg-fyn-beige flex items-center justify-center">
              <Users className="w-7 h-7 text-fyn-ink/50" />
            </div>
          </div>
          <h3 className="font-serif text-xl text-fyn-ink mb-2">
            No Customer Data
          </h3>
          <p className="text-sm text-fyn-ink/60 mb-6 max-w-md mx-auto">
            Upload invoices to see customer analytics
          </p>
          <button
            onClick={() => navigate("/dashboard/data-import")}
            className="inline-flex items-center gap-2 transition-colors hover:opacity-90"
            style={{
              background: "#C41E1E",
              color: "#FFFFFF",
              padding: "10px 20px",
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            Upload Data →
          </button>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="p-5 bg-fyn-beige-card border-fyn-ink-10">
          <p className="text-[13px] fyn-label text-secondary-foreground">
            Total Customers
          </p>
          <p className="text-fyn-ink text-[28px] font-bold mt-1 font-sans">
            {customers.length}
          </p>
        </Card>

        <Card className="p-5 bg-fyn-beige-card border-fyn-ink-10">
          <p className="text-[13px] fyn-label text-secondary-foreground">
            Active Customers
          </p>
          <p className="text-fyn-ink text-[28px] font-bold mt-1 font-sans">
            {activeCustomers.length}
          </p>
          <p className="text-xs text-fyn-ink/60 mt-1">
            Billed in last 90 days
          </p>
        </Card>

        <Card className="p-5 bg-fyn-beige-card border-fyn-ink-10">
          <p className="text-[13px] fyn-label text-secondary-foreground">
            Total Outstanding
          </p>
          <p className="text-fyn-ink text-[28px] font-bold mt-1 font-sans">
            ₹{totalOutstanding.toLocaleString("en-IN")}
          </p>
        </Card>
      </div>

      <Card className="bg-fyn-beige-dark border-fyn-ink-10">
        <div className="p-5 border-b border-fyn-ink-10">
          <h3 className="font-serif text-lg text-fyn-ink">Customer List</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer Name</TableHead>
              <TableHead className="text-right">Total Billed</TableHead>
              <TableHead className="text-right">Outstanding</TableHead>
              <TableHead className="text-right">Invoices</TableHead>
              <TableHead>Last Invoice</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.name}>
                <TableCell className="font-semibold">{customer.name}</TableCell>
                <TableCell className="text-right fyn-metric">
                  ₹{customer.totalBilled.toLocaleString("en-IN")}
                </TableCell>
                <TableCell className="text-right fyn-metric font-semibold">
                  ₹{customer.totalOutstanding.toLocaleString("en-IN")}
                </TableCell>
                <TableCell className="text-right">
                  {customer.invoiceCount}
                </TableCell>
                <TableCell className="text-xs">
                  {customer.lastInvoiceDate
                    ? new Date(customer.lastInvoiceDate).toLocaleDateString(
                        "en-IN",
                        { day: "2-digit", month: "short", year: "numeric" },
                      )
                    : "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </DashboardLayout>
  );
};

export default CustomersPage;
