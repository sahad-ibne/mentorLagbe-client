"use client"

import { useEffect, useState } from "react"
import { Loader2, ReceiptText } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getAdminPayments, type AdminPayment } from "@/lib/api/admin"

function getPaymentDate(payment: AdminPayment) {
  const value = payment.paymentDate || payment.createdAt || payment.date
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

function getPaymentAmount(payment: AdminPayment) {
  const amount = Number(payment.amount ?? payment.amountTotal ?? 0)
  const value = payment.amountTotal !== undefined ? amount / 100 : amount
  const currency = (payment.currency || "USD").toUpperCase()
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(value)
  } catch {
    return `${currency} ${value.toLocaleString()}`
  }
}

export default function AdminTransactionsPage() {
  const [payments, setPayments] = useState<AdminPayment[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    let active = true

    getAdminPayments()
      .then((result) => {
        if (!active) return
        setPayments(result)
        setErrorMessage("")
      })
      .catch((error: unknown) => {
        if (active) {
          setErrorMessage(
            error instanceof Error ? error.message : "Could not load payments."
          )
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-5 sm:p-7">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Transactions
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Stripe subscription payment records from the payments collection.
        </p>
      </header>

      {errorMessage && (
        <p
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          {errorMessage}
        </p>
      )}

      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white py-14 text-sm text-slate-500">
          <Loader2 className="mr-2 size-4 animate-spin text-indigo-600" />
          Loading transactions...
        </div>
      ) : payments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <ReceiptText className="mx-auto size-6 text-slate-400" />
          <p className="mt-2 text-sm font-semibold text-slate-900">
            No transactions found
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Subscription payments will be listed here.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Payment Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment, index) => (
                <TableRow key={payment._id || payment.id || index}>
                  <TableCell className="min-w-48">
                    <p className="font-semibold text-slate-900">
                      {payment.userName || payment.name || "Unknown user"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {payment.email || "No email"}
                    </p>
                  </TableCell>
                  <TableCell className="capitalize text-slate-700">
                    {payment.role || "—"}
                  </TableCell>
                  <TableCell className="text-slate-700">
                    {payment.planName || payment.plan || "—"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap font-semibold text-slate-900">
                    {getPaymentAmount(payment)}
                  </TableCell>
                  <TableCell className="min-w-48 font-mono text-xs text-slate-600">
                    {payment.transactionId ||
                      payment.paymentIntentId ||
                      payment.sessionId ||
                      payment._id ||
                      payment.id ||
                      "—"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-slate-600">
                    {getPaymentDate(payment)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </main>
  )
}
