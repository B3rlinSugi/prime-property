import { jsPDF } from 'jspdf';
import { formatRupiah, getSiapLabel, getTipeLabel, parseJsonArray } from './utils';

// Helper function to deterministically assign image indexes
function getPropertyImageIndex(id: string): number {
  if (!id) return 1;
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return (Math.abs(hash) % 6) + 1;
}

// Convert image from local URL to base64
async function getBase64ImageFromUrl(imageUrl: string): Promise<string | null> {
  try {
    const res = await fetch(imageUrl);
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener('load', () => resolve(reader.result as string));
      reader.addEventListener('error', () => reject(null));
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.error('Failed to convert image to base64:', e);
    return null;
  }
}

export async function generatePropertyBrochure(property: any): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const imageIndex = getPropertyImageIndex(property.id);
  const mainImageUrl = `/property-villa-${imageIndex}.png`;

  // 1. Warm luxury ivory/off-white background (#FAF9F6)
  doc.setFillColor(250, 249, 246);
  doc.rect(0, 0, 210, 297, 'F');

  // 2. Thick Outer Border / Aksen Bingkai Emas (#C9A961)
  doc.setDrawColor(201, 169, 97);
  doc.setLineWidth(1.5);
  doc.rect(8, 8, 194, 281, 'S');

  // Thin inside border
  doc.setLineWidth(0.3);
  doc.rect(10, 10, 190, 277, 'S');

  // 3. Header: Logo & Title
  doc.setFont('Times', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(26, 26, 26);
  doc.text('PRIME PROPERTY', 105, 22, { align: 'center' });

  doc.setFont('Times', 'italic');
  doc.setFontSize(10);
  doc.setTextColor(201, 169, 97);
  doc.text('LUXURY REAL ESTATE PORTFOLIO', 105, 27, { align: 'center' });

  // Thin separating gold line
  doc.setDrawColor(201, 169, 97);
  doc.setLineWidth(0.4);
  doc.line(20, 32, 190, 32);

  // 4. Main Photo - Attempt to fetch & render
  const base64Img = await getBase64ImageFromUrl(mainImageUrl);
  if (base64Img) {
    // Render beautiful main cover image
    doc.addImage(base64Img, 'PNG', 20, 38, 170, 105);
  } else {
    // Golden Luxury Outline Fallback box if image fails
    doc.setFillColor(26, 26, 26);
    doc.rect(20, 38, 170, 105, 'F');
    doc.setDrawColor(201, 169, 97);
    doc.setLineWidth(0.8);
    doc.rect(25, 43, 160, 95, 'S');
    doc.setFont('Times', 'italic');
    doc.setFontSize(14);
    doc.setTextColor(201, 169, 97);
    doc.text('[ PRIME PROPERTY LUXURY PRESENTATION ]', 105, 93, { align: 'center' });
  }

  // Double thin gold lines below photo
  doc.line(20, 149, 190, 149);
  doc.setLineWidth(0.15);
  doc.line(20, 151, 190, 151);

  // 5. Property Title & Price Section
  const kawasanArr = parseJsonArray(property.kawasan);
  doc.setFont('Times', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(kawasanArr.join(', ').toUpperCase(), 20, 160);

  doc.setFont('Times', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(26, 26, 26);
  doc.text(property.namaProperty.toUpperCase(), 20, 170);

  const tipeLabel = property.tipe === 'VILLA' ? 'LUXURY RESIDENTIAL PROPERTY' : 'LUXURY COMMERCIAL PROPERTY';
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(201, 169, 97);
  doc.text(tipeLabel, 20, 176);

  // Big Price in Gold
  doc.setFont('Times', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(201, 169, 97);
  const priceDisplay = formatRupiah(Number(property.price));
  doc.text(priceDisplay, 190, 170, { align: 'right' });

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text('INVESTMENT VALUE', 190, 175, { align: 'right' });

  // Thin dividing line
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.2);
  doc.line(20, 182, 190, 182);

  // 6. 2-Column Specifications Table / List
  doc.setFont('Times', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(26, 26, 26);
  doc.text('SPECIFICATIONS', 20, 192);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);

  // Column 1 Specs
  doc.text(`Tipe Unit :   ${getTipeLabel(property.tipe)}`, 20, 200);
  doc.text(`Dimensi   :   ${property.lebar} x ${property.panjang} m`, 20, 206);
  doc.text(`Tingkat    :   ${property.tingkat} Lantai`, 20, 212);
  doc.text(`Carport   :   ${property.carport ? 'Tersedia' : 'Tidak Ada'}`, 20, 218);

  // Column 2 Specs
  doc.text(`Hadap Bangunan :   ${parseJsonArray(property.hadap).join(', ')}`, 105, 200);
  doc.text(`Kondisi Kesiapan :   ${getSiapLabel(property.siap)}`, 105, 206);
  doc.text(`Nama Group         :   ${property.group || '-'}`, 105, 212);
  doc.text(`Lokasi Geografis   :   ${kawasanArr.join(', ')}`, 105, 218);

  // Thin dividing line
  doc.line(20, 224, 190, 224);

  // 7. Editorial Description Text
  const descriptionText = property.tipe === 'VILLA'
    ? 'Villa mewah dengan desain arsitektur modern kontemporer yang menyajikan kenyamanan eksklusif bagi keluarga Anda. Berlokasi di kawasan premium bebas banjir dengan sistem keamanan terpadu 24 jam, pencahayaan alami yang sangat baik, dan material bangunan berkualitas premium yang dirancang khusus untuk kenyamanan dan keindahan maksimal.'
    : 'Ruko komersial strategis yang sangat cocok untuk kantor bisnis premium, cabang retail korporasi, maupun outlet premium. Berlokasi di pusat bisnis dengan tingkat lalu lintas (traffic) harian yang tinggi, tempat parkir luas, bebas banjir, serta memiliki potensi return on investment (ROI) sewa tahunan yang sangat tinggi.';

  doc.setFont('Times', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(40, 40, 40);
  const splitDesc = doc.splitTextToSize(descriptionText, 170);
  doc.text(splitDesc, 20, 232);

  // 8. Footer Section (Agent Berlin Sugiyanto Card + Dynamic QR Code API)
  doc.setFillColor(26, 26, 26);
  doc.rect(20, 248, 170, 32, 'F'); // Dark luxury background box

  // Small gold bar inside box
  doc.setFillColor(201, 169, 97);
  doc.rect(20, 248, 4, 32, 'F');

  // Agent Meta text
  doc.setFont('Times', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text('BERLIN SUGIYANTO', 28, 256);

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(201, 169, 97);
  doc.text('SENIOR PROPERTY CONSULTANT', 28, 260);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(200, 200, 200);
  doc.text('WhatsApp:   +62 812-3456-7890', 28, 267);
  doc.text('E-mail     :   berlin.sugiyanto@primeproperty.id', 28, 272);

  // Dynamic QR Code API
  const websiteUrl = `https://prime-property-sigma.vercel.app/properti?search=${encodeURIComponent(property.namaProperty)}`;
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(websiteUrl)}`;
  const base64Qr = await getBase64ImageFromUrl(qrApiUrl);
  if (base64Qr) {
    // Draw white background for QR code
    doc.setFillColor(255, 255, 255);
    doc.rect(156, 251, 26, 26, 'F');
    doc.addImage(base64Qr, 'PNG', 157, 252, 24, 24);
  }

  // Save the PDF
  const filename = `${property.namaProperty.replace(/[^a-z0-9]/gi, '_')}_E_Brochure.pdf`;
  doc.save(filename);
}
