import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, TrendingUp, TrendingDown, DollarSign, Calendar, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

interface DashboardStats {
  totalFees: number;
  paidFees: number;
  pendingFees: number;
  totalExpenses: number;
  monthlyBudget: number;
  budgetUsed: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalFees: 0,
    paidFees: 0,
    pendingFees: 0,
    totalExpenses: 0,
    monthlyBudget: 0,
    budgetUsed: 0,
  });
  const [recentFees, setRecentFees] = useState<any[]>([]);
  const [recentExpenses, setRecentExpenses] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get student record
      const { data: student } = await supabase
        .from("students")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (student) {
        // Load fee stats
        const { data: fees } = await supabase
          .from("fees")
          .select("*, fee_categories(*)")
          .eq("student_id", student.id);

        if (fees) {
          const totalFees = fees.reduce((sum, fee) => sum + Number(fee.amount), 0);
          const paidFees = fees.filter(fee => fee.status === "paid").reduce((sum, fee) => sum + Number(fee.paid_amount), 0);
          const pendingFees = fees.filter(fee => fee.status === "pending").reduce((sum, fee) => sum + Number(fee.amount), 0);
          
          setStats(prev => ({
            ...prev,
            totalFees,
            paidFees,
            pendingFees,
          }));

          setRecentFees(fees.slice(0, 5));
        }
      }

      // Load expense stats
      const { data: expenses } = await supabase
        .from("expenses")
        .select("*, expense_categories(*)")
        .eq("created_by", user.id);

      let totalExpenses = 0;
      if (expenses) {
        totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
        setStats(prev => ({
          ...prev,
          totalExpenses,
        }));

        setRecentExpenses(expenses.slice(0, 5));
      }

      // Load budget stats
      const { data: budgets } = await supabase
        .from("budgets")
        .select("*")
        .eq("created_by", user.id);

      if (budgets) {
        const monthlyBudget = budgets.reduce((sum, budget) => sum + Number(budget.amount), 0);
        setStats(prev => ({
          ...prev,
          monthlyBudget,
          budgetUsed: totalExpenses,
        }));
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data.",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-success text-success-foreground";
      case "pending":
        return "bg-warning text-warning-foreground";
      case "overdue":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your financial overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Fees</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalFees)}</div>
            <p className="text-xs text-muted-foreground">
              Academic year fees
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Fees</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{formatCurrency(stats.paidFees)}</div>
            <p className="text-xs text-muted-foreground">
              Completed payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Fees</CardTitle>
            <AlertCircle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{formatCurrency(stats.pendingFees)}</div>
            <p className="text-xs text-muted-foreground">
              Outstanding payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{formatCurrency(stats.totalExpenses)}</div>
            <p className="text-xs text-muted-foreground">
              Monthly expenses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Recent Fees
              <Button asChild variant="outline" size="sm">
                <Link to="/fee-management">View All</Link>
              </Button>
            </CardTitle>
            <CardDescription>Your latest fee records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentFees.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No fee records found</p>
              ) : (
                recentFees.map((fee) => (
                  <div key={fee.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="font-medium">{fee.fee_categories?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Due: {new Date(fee.due_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(fee.amount)}</p>
                      <Badge className={getStatusColor(fee.status)}>{fee.status}</Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Recent Expenses
              <Button asChild variant="outline" size="sm">
                <Link to="/expense-tracking">View All</Link>
              </Button>
            </CardTitle>
            <CardDescription>Your latest expense records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentExpenses.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No expense records found</p>
              ) : (
                recentExpenses.map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="font-medium">{expense.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {expense.expense_categories?.name} • {new Date(expense.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(expense.amount)}</p>
                      <p className="text-sm text-muted-foreground">{expense.payment_method}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}