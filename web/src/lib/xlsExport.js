// Builds an Excel-compatible .xls (HTML table) file and triggers a browser
// download. Same format the extension produces, but with the full column
// set (Agendamento/Cardápio/Email included) since the dashboard has room.

const HEADERS = ['Nome', 'Website', 'Agendamento', 'Cardápio', 'Redes Sociais', 'Telefone', 'Email', 'Endereço'];
const FIELDS = ['nome', 'website', 'agendamento', 'cardapio', 'redes', 'telefone', 'email', 'endereco'];
const COL_WIDTHS = [170, 140, 140, 140, 140, 110, 140, 210];

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function makeCell(val, field) {
  const isSem = !val || val === 'Sem info';
  const isLink = ['website', 'agendamento', 'cardapio', 'redes'].includes(field);
  const cls = isSem ? 'sem' : field === 'website' ? 'web' : field === 'telefone' ? 'tel' : isLink ? 'web' : '';
  const safe = esc(val || 'Sem info');
  const inner = !isSem && isLink ? `<a href="${safe}" style="color:#1D4ED8">${safe}</a>` : safe;
  return `<td class="${cls}">${inner}</td>`;
}

function pad(n) {
  return String(n).padStart(2, '0');
}

function dateStamp() {
  const d = new Date();
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}`;
}

export function downloadXLS(data, filenameHint = 'google_maps') {
  const colgroup = COL_WIDTHS.map((w) => `<col style="width:${w}pt"/>`).join('');
  const thead = '<tr>' + HEADERS.map((h) => `<th>${h}</th>`).join('') + '</tr>';
  const tbody = data.map((row) => '<tr>' + FIELDS.map((f) => makeCell(row[f], f)).join('') + '</tr>').join('');

  const style = `<style>
    body{font-family:Arial,sans-serif;font-size:11pt}
    table{border-collapse:collapse;width:100%}
    th{background:#1F3864;color:#fff;font-weight:bold;font-size:11pt;padding:6px 8px;border:1px solid #16294a;text-align:left;white-space:nowrap}
    tr:nth-child(even) td{background:#EEF2FF} tr:nth-child(odd) td{background:#fff}
    td{padding:5px 8px;border:1px solid #D0D7E8;font-size:10pt;vertical-align:top}
    .sem{color:#9CA3AF;font-style:italic}.web{color:#1D4ED8}.tel{color:#065F46;font-weight:500}
  </style>`;

  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="UTF-8"/><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Empresas</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
${style}</head><body><table><colgroup>${colgroup}</colgroup><thead>${thead}</thead><tbody>${tbody}</tbody></table></body></html>`;

  const blob = new Blob(['﻿' + html], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filenameHint}_${dateStamp()}.xls`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 15000);
}
