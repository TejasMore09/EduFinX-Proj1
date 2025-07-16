import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, CreditCard, AlertCircle, CheckCircle, Clock, Trash2 } from "lucide-react";

interface Fee {
  id: string;
  amount: number;
  due_date: string;
  status: string;
  paid_amount: number;
  paid_date?: string;
  payment_method?: string;
  notes?: string;
  fee_categories: {
    name: string;
    description: string;
  };
}

interface FeeCategory {
  id: string;
  name: string;
  description: string;
  is_recurring: boolean;
}

export default function FeeManagement() {
  const [fees, setFees] = useState<Fee[]>([]);
  const [feeCategories, setFeeCategories] = useState<FeeCategory[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState<Fee | null>(null);
  const [studentId, setStudentId] = useState<string | null>(null);
  const { toast } = useToast();

  const [newFee, setNewFee] = useState({
    category_id: "",
    amount: "",
    due_date: "",
    notes: "",
  });

  const [payment, setPayment] = useState({
    amount: "",
    payment_method: "",
    notes: "",
  });

  useEffect(() => {
    loadFees();
    loadFeeCategories();
    checkStudentRecord();
  }, []);

  const checkStudentRecord = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: student } = await supabase
        .from("students")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (student) {
        setStudentId(student.id);
      } else {
        toast({
          title: "Student Record Required",
          description: "Please complete your student profile to manage fees.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error checking student record:", error);
    }
  };

  const loadFees = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: student } = await supabase
        .from("students")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (student) {
        const { data, error } = await supabase
          .from("fees")
          .select(`
            *,
            fee_categories (
              name,
              description
            )
          `)
          .eq("student_id", student.id)
          .order("due_date", { ascending: false });

        if (error) throw error;
        setFees(data || []);
      }
    } catch (error) {
      console.error("Error loading fees:", error);
      toast({
        title: "Error",
        description: "Failed to load fees.",
        variant: "destructive",
      });
    }
  };

  const loadFeeCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("fee_categories")
        .select("*")
        .order("name");

      if (error) throw error;
      setFeeCategories(data || []);
    } catch (error) {
      console.error("Error loading fee categories:", error);
    }
  };

  const handleCreateFee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId) return;

    try {
      const { error } = await supabase
        .from("fees")
        .insert([
          {
            student_id: studentId,
            category_id: newFee.category_id,
            amount: parseFloat(newFee.amount),
            due_date: newFee.due_date,
            notes: newFee.notes,
            status: "pending",
          },
        ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Fee record created successfully.",
      });

      setIsCreateDialogOpen(false);
      setNewFee({
        category_id: "",
        amount: "",
        due_date: "",
        notes: "",
      });
      loadFees();
    } catch (error) {
      console.error("Error creating fee:", error);
      toast({
        title: "Error",
        description: "Failed to create fee record.",
        variant: "destructive",
      });
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFee) return;

    try {
      const paidAmount = parseFloat(payment.amount);
      const totalPaid = selectedFee.paid_amount + paidAmount;
      const newStatus = totalPaid >= selectedFee.amount ? "paid" : "partial";

      const { error } = await supabase
        .from("fees")
        .update({
          paid_amount: totalPaid,
          status: newStatus,
          paid_date: new Date().toISOString().split("T")[0],
          payment_method: payment.payment_method,
          notes: payment.notes,
        })
        .eq("id", selectedFee.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Payment recorded successfully.",
      });

      setIsPaymentDialogOpen(false);
      setSelectedFee(null);
      setPayment({
        amount: "",
        payment_method: "",
        notes: "",
      });
      loadFees();
    } catch (error) {
      console.error("Error recording payment:", error);
      toast({
        title: "Error",
        description: "Failed to record payment.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteFee = async (feeId: string) => {
    try {
      const { error } = await supabase
        .from("fees")
        .delete()
        .eq("id", feeId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Fee record deleted successfully.",
      });

      loadFees();
    } catch (error) {
      console.error("Error deleting fee:", error);
      toast({
        title: "Error",
        description: "Failed to delete fee record.",
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "partial":
        return <Clock className="h-4 w-4 text-warning" />;
      default:
        return <AlertCircle className="h-4 w-4 text-destructive" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-success text-success-foreground";
      case "partial":
        return "bg-warning text-warning-foreground";
      default:
        return "bg-destructive text-destructive-foreground";
    }
  };

  const totalFees = fees.reduce((sum, fee) => sum + fee.amount, 0);
  const totalPaid = fees.reduce((sum, fee) => sum + fee.paid_amount, 0);
  const totalPending = totalFees - totalPaid;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Fee Management</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Fee
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Fee</DialogTitle>
              <DialogDescription>
                Add a new fee record for your student account.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateFee} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={newFee.category_id} onValueChange={(value) => setNewFee(prev => ({ ...prev, category_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select fee category" />
                  </SelectTrigger>
                  <SelectContent>
                    {feeCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={newFee.amount}
                  onChange={(e) => setNewFee(prev => ({ ...prev, amount: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="due_date">Due Date</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={newFee.due_date}
                  onChange={(e) => setNewFee(prev => ({ ...prev, due_date: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any additional notes..."
                  value={newFee.notes}
                  onChange={(e) => setNewFee(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Fee</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Fees</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalFees)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{formatCurrency(totalPaid)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{formatCurrency(totalPending)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Fees Table */}
      <Card>
        <CardHeader>
          <CardTitle>Fee Records</CardTitle>
          <CardDescription>
            Manage your fee payments and track outstanding balances.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fees.map((fee) => (
                <TableRow key={fee.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{fee.fee_categories.name}</div>
                      <div className="text-sm text-muted-foreground">{fee.fee_categories.description}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{formatCurrency(fee.amount)}</TableCell>
                  <TableCell className="text-success">{formatCurrency(fee.paid_amount)}</TableCell>
                  <TableCell>{new Date(fee.due_date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(fee.status)}>
                      {getStatusIcon(fee.status)}
                      <span className="ml-1 capitalize">{fee.status}</span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {fee.status !== "paid" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedFee(fee);
                            setPayment({
                              amount: (fee.amount - fee.paid_amount).toString(),
                              payment_method: "",
                              notes: "",
                            });
                            setIsPaymentDialogOpen(true);
                          }}
                        >
                          Pay
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteFee(fee.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Record a payment for {selectedFee?.fee_categories.name}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePayment} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="payment_amount">Amount</Label>
              <Input
                id="payment_amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={payment.amount}
                onChange={(e) => setPayment(prev => ({ ...prev, amount: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment_method">Payment Method</Label>
              <Select value={payment.payment_method} onValueChange={(value) => setPayment(prev => ({ ...prev, payment_method: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Credit/Debit Card</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                  <SelectItem value="online">Online Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment_notes">Notes</Label>
              <Textarea
                id="payment_notes"
                placeholder="Add any payment notes..."
                value={payment.notes}
                onChange={(e) => setPayment(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Record Payment</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}