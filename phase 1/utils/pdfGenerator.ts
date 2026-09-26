import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

export interface WorkerPdfData {
  id: string;
  name: string;
  phone: string;
  email?: string;
  fatherOrGuardianName?: string;
  dob?: string;
  aadhaarLast4?: string;
  address?: string;
  city?: string;
  villageOrTown?: string;
  district?: string;
  state?: string;
  pincode?: string;
  primarySkill: string;
  additionalSkills?: string[];
  experience: string;
  serviceArea: string;
  societyName?: string;
  applicationDate?: string;
}

export async function generateWorkerVerificationPDF(data: WorkerPdfData): Promise<string> {
  const dateStr = data.applicationDate || new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const workerIdStr = data.id.startsWith('w') ? data.id.toUpperCase() : `W-${data.id}`;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>OnePlace Worker Verification & Attestation Form</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 6mm 10mm 5mm 10mm;
    }
    * {
      box-sizing: border-box;
    }
    html, body {
      margin: 0;
      padding: 0;
      font-family: 'Helvetica Neue', Arial, sans-serif;
      color: #1f2937;
      line-height: 1.25;
      font-size: 8.5pt;
      background: #ffffff;
    }
    @media print {
      html, body {
        height: 100%;
        overflow: hidden;
      }
      .header, .meta-table, .section-title, .grid-table, .declaration-box, .footer-note {
        page-break-inside: avoid;
        break-inside: avoid;
      }
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #2563eb;
      padding-bottom: 4px;
      margin-bottom: 6px;
    }
    .header h1 {
      margin: 0;
      color: #1e3a8a;
      font-size: 15pt;
      letter-spacing: 1px;
      line-height: 1.1;
    }
    .header h2 {
      margin: 2px 0 0 0;
      color: #2563eb;
      font-size: 10.5pt;
      font-weight: 700;
    }
    .header p {
      margin: 1px 0 0 0;
      font-size: 8pt;
      color: #4b5563;
      font-style: italic;
    }
    .meta-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 6px;
      background-color: #f8fafc;
      border: 1px solid #cbd5e1;
    }
    .meta-table td {
      padding: 3px 8px;
      font-size: 8pt;
      border: 1px solid #cbd5e1;
    }
    .section-title {
      background-color: #1e293b;
      color: #ffffff;
      padding: 3px 8px;
      font-size: 9pt;
      font-weight: bold;
      margin-top: 6px;
      margin-bottom: 4px;
      border-radius: 2px;
      letter-spacing: 0.5px;
    }
    .grid-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 6px;
    }
    .grid-table td {
      padding: 3.5px 6px;
      border: 1px solid #94a3b8;
      font-size: 8.5pt;
      vertical-align: middle;
    }
    .label {
      font-weight: bold;
      color: #334155;
      background-color: #f1f5f9;
      white-space: nowrap;
    }
    .value {
      color: #0f172a;
    }
    .declaration-box {
      border: 1px solid #94a3b8;
      padding: 6px 8px;
      font-size: 8pt;
      background-color: #fafafa;
      margin-bottom: 6px;
      line-height: 1.35;
    }
    .stamp-box {
      border: 1.5px dashed #94a3b8;
      height: 48px;
      width: 130px;
      text-align: center;
      line-height: 48px;
      color: #94a3b8;
      font-size: 7.5pt;
      margin: 0 auto;
    }
    .footer-note {
      margin-top: 6px;
      border-top: 1px solid #cbd5e1;
      padding-top: 4px;
      text-align: center;
      font-size: 7pt;
      color: #64748b;
    }
    .footer-tagline {
      font-weight: bold;
      color: #2563eb;
      font-size: 8.5pt;
    }
  </style>
</head>
<body>

  <!-- HEADER -->
  <div class="header">
    <h1>ONEPLACE</h1>
    <h2>COOPERATIVE WORKER VERIFICATION & ATTESTATION FORM</h2>
    <p>Application for Registration & Local Verification of Skilled Worker</p>
  </div>

  <!-- META INFO -->
  <table class="meta-table">
    <tr>
      <td><strong>Form No.:</strong> OP-VRF-${Date.now().toString().slice(-6)}</td>
      <td><strong>Application/Worker ID:</strong> ${workerIdStr}</td>
      <td><strong>Date of Application:</strong> ${dateStr}</td>
    </tr>
  </table>

  <!-- SECTION 1: PERSONAL DETAILS -->
  <div class="section-title">1. PERSONAL DETAILS</div>
  <table class="grid-table">
    <tr>
      <td class="label" style="width: 18%;">Full Name</td>
      <td class="value" style="width: 32%;">${data.name || '___________________________'}</td>
      <td class="label" style="width: 22%;">Father's / Guardian's Name</td>
      <td class="value" style="width: 28%;">${data.fatherOrGuardianName || '___________________________'}</td>
    </tr>
    <tr>
      <td class="label">Date of Birth</td>
      <td class="value">${data.dob || '____ / ____ / ______'}</td>
      <td class="label">Mobile Number</td>
      <td class="value">${data.phone || '___________________________'}</td>
    </tr>
    <tr>
      <td class="label">Govt ID (Last 4 Digits)</td>
      <td class="value">XXXX-XXXX-${data.aadhaarLast4 || '____'}</td>
      <td class="label">Village / Town</td>
      <td class="value">${data.villageOrTown || data.city || '___________________________'}</td>
    </tr>
    <tr>
      <td class="label">Residential Address</td>
      <td class="value" colspan="3">${data.address || '_____________________________________________________'}</td>
    </tr>
    <tr>
      <td class="label">District & State</td>
      <td class="value" colspan="3">${data.district || 'Bengaluru Urban'}, ${data.state || 'Karnataka'} (PIN: ${data.pincode || '560001'})</td>
    </tr>
  </table>

  <!-- SECTION 2: PROFESSIONAL DETAILS -->
  <div class="section-title">2. PROFESSIONAL DETAILS</div>
  <table class="grid-table">
    <tr>
      <td class="label" style="width: 20%;">Primary Profession / Skill</td>
      <td class="value" style="width: 30%;"><strong>${data.primarySkill || 'Plumber'}</strong></td>
      <td class="label" style="width: 20%;">Total Work Experience</td>
      <td class="value" style="width: 30%;">${data.experience || '3-5 years'}</td>
    </tr>
    <tr>
      <td class="label">Other Skills (if any)</td>
      <td class="value">${data.additionalSkills?.join(', ') || 'None specified'}</td>
      <td class="label">Current Work Area</td>
      <td class="value">${data.serviceArea || 'Koramangala, Indiranagar'}</td>
    </tr>
    <tr>
      <td class="label">Name of Cooperative / Society</td>
      <td class="value" colspan="3"><strong>${data.societyName || 'Koramangala Workers Cooperative Society'}</strong></td>
    </tr>
  </table>

  <!-- SECTION 3: WORKER DECLARATION -->
  <div class="section-title">3. WORKER DECLARATION</div>
  <div class="declaration-box">
    I hereby declare that the information provided above is true and correct to the best of my knowledge. I understand that the information and documents submitted by me may be verified by the authorized representatives of the concerned cooperative/society for registration on the OnePlace platform.
    <div style="display: flex; justify-content: space-between; margin-top: 8px; font-weight: 500;">
      <div>Worker's Signature: _______________________</div>
      <div>Date: ____ / ____ / ______</div>
    </div>
  </div>

  <!-- SECTION 4: LOCAL AUTHORITY ATTESTATION -->
  <div class="section-title">4. LOCAL AUTHORITY ATTESTATION</div>
  <div class="declaration-box" style="background-color: #ffffff;">
    The particulars furnished above have been presented for local verification/attestation.
    <table style="width: 100%; border: none; border-collapse: collapse; margin-top: 4px;">
      <tr>
        <td style="width: 50%; padding: 2px 0;">Name of Authority: _______________________</td>
        <td style="width: 50%; padding: 2px 0;">Designation: _______________________</td>
      </tr>
      <tr>
        <td style="width: 50%; padding: 2px 0;">Office / Tehsil: _______________________</td>
        <td style="width: 50%; padding: 2px 0;">Date: ____ / ____ / ______</td>
      </tr>
      <tr>
        <td colspan="2" style="padding: 2px 0;">Remarks (if any): __________________________________________________________________</td>
      </tr>
    </table>
    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 6px;">
      <div style="padding-bottom: 4px;">
        Signature of Authority: ___________________________
      </div>
      <div style="text-align: center;">
        <div class="stamp-box">Official Seal / Stamp</div>
      </div>
    </div>
  </div>

  <!-- SECTION 5: FOR ONEPLACE / SOCIETY USE ONLY -->
  <div class="section-title">5. FOR ONEPLACE / SOCIETY USE ONLY</div>
  <table class="grid-table">
    <tr>
      <td class="label" style="width: 20%;">Document Received On</td>
      <td class="value" style="width: 30%;">____ / ____ / ______</td>
      <td class="label" style="width: 20%;">Verified By</td>
      <td class="value" style="width: 30%;">______________________</td>
    </tr>
    <tr>
      <td class="label">Verification Status</td>
      <td class="value" colspan="3">
        [ &nbsp; ] Pending &nbsp;&nbsp;&nbsp;&nbsp; [ &nbsp; ] Approved &nbsp;&nbsp;&nbsp;&nbsp; [ &nbsp; ] Rejected &nbsp;&nbsp;&nbsp;&nbsp; [ &nbsp; ] Re-upload Required
      </td>
    </tr>
    <tr>
      <td class="label">Remarks / Notes</td>
      <td class="value" colspan="3">___________________________________________________________________________</td>
    </tr>
  </table>

  <!-- FOOTER -->
  <div class="footer-note">
    <div class="footer-tagline">ONEPLACE — Where Local Skills Meet Everyday Needs</div>
    <strong>Important Notice:</strong> This document is a OnePlace worker verification and attestation form. It is not a government-issued identity document or government Labour Card.
  </div>

</body>
</html>
  `;

  if (Platform.OS === 'web') {
    // Web: Direct Download via Blob
    const fileName = `OnePlace_Worker_Verification_Form_${workerIdStr}.pdf`;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return url;
  } else {
    // Native (Android / iOS): Use Print.printAsync to trigger native Print / Save as PDF modal directly
    try {
      await Print.printAsync({ html: htmlContent });
      return 'printed';
    } catch (printError) {
      // Fallback: If printAsync throws, try printToFileAsync + safe share
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      if (await Sharing.isAvailableAsync()) {
        try {
          await Sharing.shareAsync(uri, {
            mimeType: 'application/pdf',
            dialogTitle: `OnePlace_Worker_Verification_Form_${workerIdStr}.pdf`,
            UTI: 'com.adobe.pdf',
          });
        } catch (shareErr) {
          console.warn('[PDF] Share failed, fallback to printAsync:', shareErr);
        }
      }
      return uri;
    }
  }
}
