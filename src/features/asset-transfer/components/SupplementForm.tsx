import React, { useState } from 'react';
import { TransferRequest } from '../types/transfer';
import { useTransfer } from '../context/TransferContext';
export function SupplementForm({ request }: { request: TransferRequest }) {
  const { resubmitRequest } = useTransfer();
  const [reason, setReason] = useState(request.reason);
  return <form className="mb-6 rounded-xl bg-white border border-amber-200 p-5 space-y-3" onSubmit={event => { event.preventDefault(); resubmitRequest(request.id, reason, request.attachments); }}>
    <h3 className="font-semibold">Bổ sung yêu cầu điều chuyển</h3>
    <p className="text-sm text-amber-800">{request.reviewNotes}</p>
    <label htmlFor="transfer-supplement" className="block text-sm">Lý do và thông tin bổ sung</label>
    <textarea id="transfer-supplement" required value={reason} onChange={event => setReason(event.target.value)} rows={4} className="w-full border border-slate-200 rounded-lg p-3 text-sm" />
    <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white">Gửi lại yêu cầu</button>
  </form>;
}
