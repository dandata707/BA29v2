import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { CFB } from 'xlsx';
import { buildHandoverDocument, downloadHandoverDocument, handoverFileName, handoverAmountInWords } from '../src/utils/handoverDocument';
import { INITIAL_HANDOVERS } from '../src/data/mockHandovers';

const template = new Uint8Array(readFileSync('public/templates/bien-ban-ban-giao-tai-san.docx'));
function parts(bytes: Uint8Array): Map<string, Uint8Array> {
  const zip = CFB.read(bytes, { type: 'array' });
  return new Map(zip.FullPaths.map((path: string, index: number) => [path.replace(/^Root Entry\//, ''), new Uint8Array(zip.FileIndex[index].content || [])] as const).filter(([path]: [string, Uint8Array]) => path && !path.endsWith('/') && !path.startsWith('\u0001')));
}
const documentXml = (bytes: Uint8Array) => new TextDecoder().decode(parts(bytes).get('word/document.xml'));

test('export fills the supplied Word template and preserves all other package parts', () => {
  const protocol = INITIAL_HANDOVERS[0];
  const snapshot = JSON.stringify(protocol);
  const output = buildHandoverDocument(template, protocol);
  assert.equal(output[0], 0x50);
  assert.equal(output[1], 0x4b);
  const originalParts = parts(template);
  const exportedParts = parts(output);
  assert.deepEqual([...exportedParts.keys()].sort(), [...originalParts.keys()].sort());
  for (const [path, content] of originalParts) {
    if (path !== 'word/document.xml') assert.deepEqual(exportedParts.get(path), content, path);
  }
  const xml = documentXml(output);
  for (const text of [protocol.code, protocol.senderName, protocol.senderCode, protocol.senderDept, protocol.senderRole, protocol.receiverName, protocol.receiverCode, protocol.receiverDept, protocol.receiverRole, protocol.ticketCode, protocol.totalValueWords, ...protocol.items.map(item => item.name)]) assert.ok(xml.includes(text!), text);
  assert.ok(xml.includes('37.000.000'));
  assert.ok(xml.includes('ngày 25 tháng 03 năm 2024'));
  assert.ok(xml.includes('<w:tblHeader/>'));
  assert.equal(xml.match(/<w:tbl(?:\s[^>]*)?>/g)?.length, 3);
  assert.equal(xml.match(/<w:tr(?:\s[^>]*)?>/g)?.length, protocol.items.length + 6);
  assert.equal(xml.match(/<w:sectPr[\s\S]*?<\/w:sectPr>/)?.[0], documentXml(template).match(/<w:sectPr[\s\S]*?<\/w:sectPr>/)?.[0]);
  assert.equal(JSON.stringify(protocol), snapshot);
  mkdirSync('.tmp/handover-export', { recursive: true });
  writeFileSync('.tmp/handover-export/sample.docx', output);
});

test('export supports all statuses, many assets and XML-sensitive or multiline text', () => {
  for (const status of ['Nháp', 'Chờ ký', 'Hoàn tất'] as const) {
    const protocol = { ...INITIAL_HANDOVERS[0], status, senderName: 'An & Bình <Kỹ thuật>', items: Array.from({ length: 30 }, (_, index) => ({ ...INITIAL_HANDOVERS[0].items[0], id: String(index), name: `Tài sản ${index + 1}`, notes: 'Kể từ ngày <bàn giao> & "kiểm tra"\nDòng 2' })) };
    const xml = documentXml(buildHandoverDocument(template, protocol));
    assert.ok(xml.includes('An &amp; Bình &lt;Kỹ thuật&gt;'));
    assert.ok(xml.includes('Kể từ ngày &lt;bàn giao&gt; &amp; &quot;kiểm tra&quot;'));
    assert.ok(xml.includes('Dòng 2'));
    assert.ok(xml.includes('Tài sản 30'));
    assert.ok(xml.includes('750.000.000'));
    assert.equal(xml.match(/<w:tr(?:\s[^>]*)?>/g)?.length, 36);
    assert.ok(xml.includes('Chủ tọa: Ông'));
    assert.ok(xml.includes('Thư ký: Ông'));
  }
});

test('export rejects invalid templates and asset values and sanitizes download filenames', () => {
  const invalid = CFB.utils.cfb_new();
  CFB.utils.cfb_add(invalid, '/word/document.xml', new TextEncoder().encode('<w:document/>'));
  assert.throws(() => buildHandoverDocument(new Uint8Array(CFB.write(invalid, { type: 'array', fileType: 'zip' })), INITIAL_HANDOVERS[0]), /không đúng cấu trúc/);
  const badProtocol = { ...INITIAL_HANDOVERS[0], items: [{ ...INITIAL_HANDOVERS[0].items[0], quantity: -1 }] };
  assert.throws(() => buildHandoverDocument(template, badProtocol), /không hợp lệ/);
  assert.equal(handoverFileName('BB/2026:01'), 'Bien-ban-ban-giao-BB-2026-01.docx');
  assert.equal(handoverAmountInWords(0), 'Không đồng chẵn.');
  assert.equal(handoverAmountInWords(37000000), 'Ba mươi bảy triệu đồng chẵn.');
  assert.equal(handoverAmountInWords(1001001), 'Một triệu không trăm lẻ một nghìn không trăm lẻ một đồng chẵn.');
  assert.equal(handoverAmountInWords(215), 'Hai trăm mười lăm đồng chẵn.');
});

test('download creates a real DOCX blob and handles template fetch failures', async () => {
  const saved = { fetch: globalThis.fetch, document: (globalThis as any).document, create: URL.createObjectURL, revoke: URL.revokeObjectURL, timeout: globalThis.setTimeout };
  let downloaded: Blob | undefined;
  let filename = '';
  let clicked = false;
  let revoked = false;
  try {
    globalThis.fetch = async () => new Response(template);
    URL.createObjectURL = blob => { downloaded = blob as Blob; return 'blob:handover-test'; };
    URL.revokeObjectURL = () => { revoked = true; };
    (globalThis as any).document = { body: { appendChild: () => {} }, createElement: () => ({ href: '', set download(value: string) { filename = value; }, click: () => { clicked = true; }, remove: () => {} }) };
    (globalThis as any).setTimeout = (callback: () => void) => { callback(); return 0; };
    await downloadHandoverDocument(INITIAL_HANDOVERS[0], '/templates/test.docx');
    assert.ok(clicked && revoked);
    assert.equal(filename, handoverFileName(INITIAL_HANDOVERS[0].code));
    assert.equal(downloaded!.type, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    assert.ok(documentXml(new Uint8Array(await downloaded!.arrayBuffer())).includes(INITIAL_HANDOVERS[0].code));
    globalThis.fetch = async () => new Response('not found', { status: 404 });
    await assert.rejects(downloadHandoverDocument(INITIAL_HANDOVERS[0], '/missing.docx'), /Không tải được mẫu Word/);
  } finally {
    globalThis.fetch = saved.fetch;
    if (saved.document === undefined) delete (globalThis as any).document;
    else (globalThis as any).document = saved.document;
    URL.createObjectURL = saved.create;
    URL.revokeObjectURL = saved.revoke;
    globalThis.setTimeout = saved.timeout;
  }
});
