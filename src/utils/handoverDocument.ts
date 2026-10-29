import { CFB } from 'xlsx';
import { HandoverProtocol } from '../types';

const PARAGRAPH = /<w:p(?:\s[^>]*)?>[\s\S]*?<\/w:p>/g;
const TABLE = /<w:tbl(?:\s[^>]*)?>[\s\S]*?<\/w:tbl>/g;
const ROW = /<w:tr(?:\s[^>]*)?>[\s\S]*?<\/w:tr>/g;
const CELL = /<w:tc(?:\s[^>]*)?>[\s\S]*?<\/w:tc>/g;
const TEXT = /<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g;
const MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

function escapeXml(value: string) {
  return value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function plainText(xml: string) {
  return Array.from(xml.matchAll(TEXT), match => match[1]).join('')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');
}

// Keep the template's paragraphs, run formatting, borders and cell widths.
function fillParagraph(paragraph: string, value: string) {
  const text = `<w:t xml:space="preserve">${escapeXml(value).replace(/\r?\n/g, '</w:t><w:br/><w:t xml:space="preserve">')}</w:t>`;
  let filled = false;
  const result = paragraph.replace(TEXT, () => {
    if (filled) return '<w:t></w:t>';
    filled = true;
    return text;
  });
  if (filled) return result;
  const properties = paragraph.match(/<w:pPr>[\s\S]*?<\/w:pPr>/)?.[0].match(/<w:rPr>[\s\S]*?<\/w:rPr>/)?.[0] || '';
  return paragraph.replace('</w:p>', `<w:r>${properties}${text}</w:r></w:p>`);
}

function fillRow(row: string, values: string[]) {
  let index = 0;
  return row.replace(/\s+w14:(?:paraId|textId)="[^"]*"/g, '').replace(CELL, cell => {
    const value = values[index++];
    if (value === undefined) throw new Error('Số cột của mẫu biên bản không đúng.');
    let first = true;
    return cell.replace(PARAGRAPH, paragraph => {
      const result = fillParagraph(paragraph, first ? value : '');
      first = false;
      return result;
    });
  });
}

const formatNumber = (value: number) => new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 }).format(value);

export function handoverAmountInWords(value: number) {
  if (!Number.isSafeInteger(value) || value < 0) return `${formatNumber(value)} đồng`;
  if (value === 0) return 'Không đồng chẵn.';
  const digits = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
  const units = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ', 'triệu tỷ'];
  const groups: number[] = [];
  for (let remaining = value; remaining > 0; remaining = Math.floor(remaining / 1000)) groups.push(remaining % 1000);
  const words: string[] = [];
  for (let index = groups.length - 1; index >= 0; index--) {
    const group = groups[index];
    if (!group) continue;
    const hundreds = Math.floor(group / 100);
    const tens = Math.floor(group / 10) % 10;
    const ones = group % 10;
    if (hundreds || index < groups.length - 1) words.push(digits[hundreds], 'trăm');
    if (tens > 1) words.push(digits[tens], 'mươi');
    else if (tens === 1) words.push('mười');
    else if (ones && (hundreds || index < groups.length - 1)) words.push('lẻ');
    if (ones) words.push(ones === 1 && tens > 1 ? 'mốt' : ones === 5 && tens > 0 ? 'lăm' : digits[ones]);
    if (units[index]) words.push(units[index]);
  }
  const result = words.join(' ');
  return `${result[0].toUpperCase()}${result.slice(1)} đồng chẵn.`;
}

export function handoverFileName(code: string) {
  return `Bien-ban-ban-giao-${code.replace(/[<>:"/\\|?*\u0000-\u001f]/g, '-').replace(/[. ]+$/g, '') || 'tai-san'}.docx`;
}

export function buildHandoverDocument(template: Uint8Array, protocol: HandoverProtocol): Uint8Array {
  const archive = CFB.read(template, { type: 'array' });
  const entry = CFB.find(archive, '/word/document.xml');
  if (!entry?.content) throw new Error('Không đọc được mẫu Word của biên bản bàn giao.');
  let xml = new TextDecoder().decode(new Uint8Array(entry.content));
  const sourceTables = Array.from(xml.matchAll(TABLE), match => match[0]);
  const assetTable = sourceTables.find(table => plainText(table).includes('Tên tài sản') && plainText(table).includes('Thành tiền'));
  const signatureTable = sourceTables.find(table => plainText(table).includes('CHỮ KÝ BÊN GIAO'));
  if (!assetTable || !signatureTable || !plainText(xml).includes('BIÊN BẢN BÀN GIAO TÀI SẢN')) throw new Error('Mẫu Word không đúng cấu trúc biên bản bàn giao.');
  const rows = Array.from(assetTable.matchAll(ROW), match => match[0]);
  if (rows.length !== 3 || Array.from(rows[1].matchAll(CELL)).length !== 7) throw new Error('Bảng tài sản trong mẫu Word không đúng cấu trúc.');

  const amounts = protocol.items.map(item => {
    const total = Number.isFinite(item.totalPrice) ? item.totalPrice : item.quantity * item.unitPrice;
    if (![item.quantity, item.unitPrice, total].every(value => Number.isFinite(value) && value >= 0)) throw new Error('Số lượng hoặc giá trị tài sản không hợp lệ.');
    return total;
  });
  const totalQuantity = protocol.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = amounts.reduce((sum, value) => sum + value, 0);
  const totalWords = protocol.totalValueNumber === totalValue && protocol.totalValueWords?.trim() && !/\d/.test(protocol.totalValueWords)
    ? protocol.totalValueWords : handoverAmountInWords(totalValue);
  const itemRows = protocol.items.map((item, index) => fillRow(rows[1], [
    String(index + 1), item.name, item.unit, formatNumber(item.quantity), formatNumber(item.unitPrice), formatNumber(amounts[index]), item.notes || '',
  ])).join('');
  const header = rows[0].replace(/(<w:tr\b[^>]*>)/, '$1<w:trPr><w:tblHeader/></w:trPr>');
  const updatedTable = assetTable.replace(rows.join(''), header + itemRows + fillRow(rows[2], ['', 'Cộng', '', formatNumber(totalQuantity), '', formatNumber(totalValue), '']));

  const date = protocol.createdDate.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  const iso = protocol.createdDate.match(/^(\d{4})-(\d{2})-(\d{2})(?:T.*)?$/);
  const day = date?.[1] || iso?.[3] || '....';
  const month = date?.[2] || iso?.[2] || '....';
  const year = date?.[3] || iso?.[1] || '....';
  const party = (name: string, department: string) => department ? `${name} (${department})` : name;
  let attendee: 'sender' | 'receiver' | null = null;
  let senderFilled = false;
  let receiverFilled = false;
  xml = xml.replace(PARAGRAPH, paragraph => {
    const text = plainText(paragraph).trim();
    let value: string | undefined;
    if (/^Số:\s*\.+\/BB/.test(text)) value = `Số: ${protocol.code}`;
    else if (/^\.+, ngày/.test(text)) value = `..............., ngày ${day} tháng ${month} năm ${year}`;
    else if (/^Giữa\s/.test(text)) value = `Giữa ${party(protocol.senderName, protocol.senderDept)} (bên giao) và ${party(protocol.receiverName, protocol.receiverDept)} (bên nhận)`;
    else if (/^Hôm nay ngày/.test(text)) value = `Hôm nay, ngày ${day} tháng ${month} năm ${year}, tại .........................., đã tiến hành bàn giao tài sản giữa ${protocol.senderName} (bên giao) và ${protocol.receiverName} (bên nhận)${protocol.ticketCode ? ` theo phiếu yêu cầu ${protocol.ticketCode}` : ''}.`;
    else if (text === '1/ Bên giao:') { attendee = 'sender'; value = `1/ Bên giao: ${protocol.senderDept}`; }
    else if (text === '2/ Bên nhận:') { attendee = 'receiver'; value = `2/ Bên nhận: ${protocol.receiverDept}`; }
    else if (/^Ông:/.test(text) && attendee === 'sender' && !senderFilled) {
      value = `Ông/Bà: ${protocol.senderName}${protocol.senderCode ? ` (${protocol.senderCode})` : ''}    Chức vụ: ${protocol.senderRole}`;
      senderFilled = true;
    } else if (/^Ông:/.test(text) && attendee === 'receiver' && !receiverFilled) {
      value = `Ông/Bà: ${protocol.receiverName}${protocol.receiverCode ? ` (${protocol.receiverCode})` : ''}    Chức vụ: ${protocol.receiverRole}`;
      receiverFilled = true;
    } else if (/^Bên\.+/.test(text)) value = `Bên ${party(protocol.senderName, protocol.senderDept)} đã tiến hành bàn giao tài sản cho bên ${party(protocol.receiverName, protocol.receiverDept)} theo biểu thống kê sau:`;
    else if (text.startsWith('Tổng giá trị: Bằng số')) value = `Tổng giá trị: Bằng số ${formatNumber(totalValue)} đồng`;
    else if (/^Bằng chữ\s/.test(text)) value = `Bằng chữ: ${totalWords}`;
    else if (text.startsWith('Kể từ ngày')) value = `Kể từ ngày ${protocol.createdDate}, số tài sản trên do bên ${party(protocol.receiverName, protocol.receiverDept)} chịu trách nhiệm quản lý.`;
    return value === undefined ? paragraph : fillParagraph(paragraph, value);
  });

  xml = xml.replace(assetTable, updatedTable);
  let signatureIndex = 0;
  const updatedSignatures = signatureTable.replace(CELL, cell => {
    const name = [protocol.senderName, protocol.receiverName][signatureIndex++];
    return cell.replace('</w:tc>', `<w:p><w:pPr><w:spacing w:before="720" w:after="0"/><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:sz w:val="24"/></w:rPr><w:t>${escapeXml(name || '')}</w:t></w:r></w:p></w:tc>`);
  });
  xml = xml.replace(signatureTable, updatedSignatures);
  entry.content = new TextEncoder().encode(xml);
  entry.size = entry.content.length;
  return new Uint8Array(CFB.write(archive, { type: 'array', fileType: 'zip', compression: true }));
}

export async function downloadHandoverDocument(protocol: HandoverProtocol, templateUrl: string) {
  const response = await fetch(templateUrl);
  if (!response.ok) throw new Error('Không tải được mẫu Word. Vui lòng thử lại.');
  const documentBytes = buildHandoverDocument(new Uint8Array(await response.arrayBuffer()), protocol);
  const url = URL.createObjectURL(new Blob([documentBytes.slice().buffer as ArrayBuffer], { type: MIME }));
  const link = document.createElement('a');
  link.href = url;
  link.download = handoverFileName(protocol.code);
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
