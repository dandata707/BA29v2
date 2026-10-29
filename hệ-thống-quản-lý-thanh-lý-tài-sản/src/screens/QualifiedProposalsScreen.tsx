import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Search, 
  RotateCcw, 
  CheckSquare, 
  Square, 
  Info, 
  ChevronRight,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useAssetContext } from '../context/AssetContext';

export const QualifiedProposalsScreen: React.FC = () => {
  const { 
    proposals, 
    assets, 
    qualifiedSelectedProposalIds, 
    setQualifiedSelectedProposalIds, 
    setActiveScreen 
  } = useAssetContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');

  // Filter proposals that have been inspected & qualified
  const qualifiedProposals = useMemo(() => {
    return proposals.filter((p) => {
      const matchStatus = p.status === 'DU_DIEU_KIEN' || p.status === 'CHUA_DU_DIEU_KIEN';
      const matchSearch =
        p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.creatorName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchDept = deptFilter === 'ALL' || p.department === deptFilter;
      return matchStatus && matchSearch && matchDept;
    });
  }, [proposals, searchTerm, deptFilter]);

  // Calculate qualified assets for each proposal
  const getQualifiedAssetCount = (propId: string) => {
    const prop = proposals.find((p) => p.id === propId);
    if (!prop) return 0;
    const propAssets = assets.filter((a) => prop.assetIds.includes(a.id));
    return propAssets.filter((a) => a.inspectionResult === 'Đủ điều kiện thanh lý' || a.status === 'CHO_LAP_TO_TRINH').length;
  };

  // Selected totals
  const totalSelectedAssets = qualifiedSelectedProposalIds.reduce((sum, id) => {
    return sum + getQualifiedAssetCount(id);
  }, 0);

  const toggleSelect = (id: string, isEligible: boolean) => {
    if (!isEligible) return;
    if (qualifiedSelectedProposalIds.includes(id)) {
      setQualifiedSelectedProposalIds(qualifiedSelectedProposalIds.filter((pId) => pId !== id));
    } else {
      setQualifiedSelectedProposalIds([...qualifiedSelectedProposalIds, id]);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const eligibleIds = qualifiedProposals
        .filter((p) => p.status === 'DU_DIEU_KIEN')
        .map((p) => p.id);
      setQualifiedSelectedProposalIds(eligibleIds);
    } else {
      setQualifiedSelectedProposalIds([]);
    }
  };

  // Step 8: Click "Tạo tờ trình" -> navigates to SUBMISSION_CREATE
  const handleProceedToSubmission = () => {
    if (qualifiedSelectedProposalIds.length === 0) {
      alert('Vui lòng chọn ít nhất 01 đề nghị đủ điều kiện để tạo tờ trình!');
      return;
    }
    setActiveScreen('SUBMISSION_CREATE');
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header Matching Image 11 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            Danh sách đề nghị đủ điều kiện lập tờ trình thanh lý
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Chọn các đề nghị thanh lý đã được kiểm tra, thẩm định và có tài sản đủ điều kiện để tổng hợp vào tờ trình (NVQLTS).
          </p>
        </div>

        {/* Step 8: Nút "+ Tạo tờ trình" */}
        <button
          onClick={handleProceedToSubmission}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs md:text-sm rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <FileText className="w-4 h-4" />
          <span>Tạo tờ trình</span>
        </button>
      </div>

      {/* Filter Bar Matching Image 11 */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Nhập mã đề nghị, tên bộ phận..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs md:text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500"
          />
        </div>

        <div className="w-full sm:w-44">
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="w-full py-2 px-3 text-xs md:text-sm border border-slate-200 rounded-xl focus:outline-hidden bg-white"
          >
            <option value="ALL">Tất cả bộ phận</option>
            <option value="Phòng Kế toán">Phòng Kế toán</option>
            <option value="Phòng Hành chính">Phòng Hành chính</option>
            <option value="Phòng IT">Phòng IT</option>
            <option value="Phòng Kinh doanh">Phòng Kinh doanh</option>
          </select>
        </div>

        <div className="w-full sm:w-40">
          <select className="w-full py-2 px-3 text-xs md:text-sm border border-slate-200 rounded-xl focus:outline-hidden bg-white">
            <option>Đã thẩm định</option>
          </select>
        </div>

        <button
          onClick={() => {
            setSearchTerm('');
            setDeptFilter('ALL');
          }}
          className="p-2 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          title="Làm mới bộ lọc"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Selection Banner Matching Image 11 */}
      <div className="bg-blue-600 text-white rounded-xl px-4 py-3 flex items-center justify-between text-xs font-semibold shadow-xs">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center font-bold">✓</span>
          <span>
            Đã chọn {qualifiedSelectedProposalIds.length} đề nghị ({totalSelectedAssets} tài sản đủ điều kiện)
          </span>
        </div>
        <button
          onClick={handleProceedToSubmission}
          className="bg-white text-blue-700 hover:bg-blue-50 px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
        >
          <span>Tiến hành lập tờ trình</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Table Matching Image 11 */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs md:text-sm text-left">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-3 text-center w-10">
                  <input
                    type="checkbox"
                    checked={
                      qualifiedProposals.length > 0 &&
                      qualifiedProposals
                        .filter((p) => p.status === 'DU_DIEU_KIEN')
                        .every((p) => qualifiedSelectedProposalIds.includes(p.id))
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                </th>
                <th className="py-3 px-4 w-32">MÃ ĐỀ NGHỊ</th>
                <th className="py-3 px-4">BỘ PHẬN</th>
                <th className="py-3 px-4 text-center w-36">SỐ TS ĐỦ ĐIỀU KIỆN</th>
                <th className="py-3 px-4 w-28">NGÀY ĐỀ NGHỊ</th>
                <th className="py-3 px-4 w-28">NGÀY THẨM ĐỊNH</th>
                <th className="py-3 px-4">NGƯỜI LẬP</th>
                <th className="py-3 px-4 w-32">TRẠNG THÁI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {qualifiedProposals.length > 0 ? (
                qualifiedProposals.map((item) => {
                  const count = getQualifiedAssetCount(item.id);
                  const isEligible = item.status === 'DU_DIEU_KIEN';
                  const isChecked = qualifiedSelectedProposalIds.includes(item.id);

                  return (
                    <tr
                      key={item.id}
                      onClick={() => toggleSelect(item.id, isEligible)}
                      className={`transition-colors ${
                        !isEligible
                          ? 'bg-slate-50/50 opacity-60 cursor-not-allowed'
                          : isChecked
                          ? 'bg-blue-50/40 cursor-pointer'
                          : 'hover:bg-slate-50/80 cursor-pointer'
                      }`}
                    >
                      <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          disabled={!isEligible}
                          checked={isChecked}
                          onChange={() => toggleSelect(item.id, isEligible)}
                          className="rounded text-blue-600"
                        />
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-blue-700">
                        {item.code}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900">{item.department}</td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-slate-800">
                        {count > 0 ? count : '--'}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{item.createdDate}</td>
                      <td className="py-3 px-4 text-slate-600 font-mono">
                        {item.sentDate || '21/10/2026'}
                      </td>
                      <td className="py-3 px-4 text-slate-700">{item.creatorName}</td>
                      <td className="py-3 px-4">
                        {isEligible ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Đủ điều kiện
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            Chưa đủ điều kiện
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                    Không có đề nghị nào trong danh mục.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary Matching Image 11 */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800">Đã chọn:</span>
              <span className="font-bold text-blue-700 font-mono">{qualifiedSelectedProposalIds.length} đề nghị</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800">Tổng số tài sản:</span>
              <span className="font-bold text-blue-700 font-mono">{totalSelectedAssets} tài sản</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-slate-500">
            <Info className="w-4 h-4 text-blue-600" />
            <span>Chỉ hiển thị các đề nghị đã được kiểm tra, thẩm định và có tài sản đủ điều kiện thanh lý.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
