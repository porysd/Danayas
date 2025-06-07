export const contactFormHtml = ({
  name,
  email,
  message,
}: {
  name: string;
  email: string;
  message: string;
}) => `
    <div style="font-family: Arial, sans-serif; background: #fdfaf6; padding: 20px; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
        <div style="background: #1e3d25; padding: 20px 30px; border-top-left-radius: 8px; border-top-right-radius: 8px;">
          <h2 style="margin: 0; color: #fdfaf6;">Danayas Resort & Events Venue</h2>
          <p style="margin: 5px 0 0; color: #fdfaf6;">New Contact Inquiry</p>
        </div>
        <div style="padding: 30px;">
          <p style="font-size: 16px;">Hello Admin,</p>
          <p style="font-size: 15px;">You've received a new message from the <strong>Contact Us</strong> form.</p>
          <table style="width: 100%; margin-top: 20px; font-size: 15px;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Name:</td>
              <td style="padding: 8px 0;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Email:</td>
              <td style="padding: 8px 0;">${email}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Message:</td>
              <td style="padding: 8px 0;">${message}</td>
            </tr>
          </table>
          <p style="margin-top: 30px; font-size: 13px; color: #999;">
            Sent automatically by the website on ${new Date().toLocaleString()}.
          </p>
        </div>
        <div style="background: #1e3d25; padding: 15px 30px; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px; text-align: center;">
          <p style="margin: 0; font-size: 13px; color: #fdfaf6;">Danayas Resort & Events Venue</p>
          <p style="margin: 0; font-size: 12px; color: #ccc;">© ${new Date().getFullYear()} All rights reserved.</p>
        </div>
      </div>
    </div>
  `;

export const refundPendingHtml = ({
  bookingId,
  firstName,
  refundAmount,
  refundMethod,
  receiveName,
}: {
  bookingId: number;
  firstName: string;
  refundAmount: number;
  refundMethod: "gcash" | "cash";
  receiveName?: string | null;
}) => `
    <div style="font-family: Arial, sans-serif; background: #fdfaf6; padding: 20px; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
        <div style="background: #1e3d25; padding: 20px 30px; border-top-left-radius: 8px; border-top-right-radius: 8px;">
          <h2 style="margin: 0; color: #fdfaf6;">Danayas Resort & Events Venue</h2>
          <p style="margin: 5px 0 0; color: #fdfaf6;">Refund Processing Notification</p>
        </div>
        <div style="padding: 30px;">
          <p style="font-size: 16px;">Dear ${firstName},</p>
          <p style="font-size: 15px;">
            We have received your cancellation request for booking <strong>#${bookingId}</strong>. A refund is currently being processed and reviewed.
          </p>
          <table style="width: 100%; margin-top: 20px; font-size: 14px;">
            <tr>
              <td style="padding: 6px 0; font-weight: bold;">Refund Amount:</td>
              <td style="padding: 6px 0;">₱${refundAmount.toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold;">Refund Method:</td>
              <td style="padding: 6px 0;">${refundMethod.toUpperCase()}</td>
            </tr>
            ${
              refundMethod === "cash" && receiveName
                ? `<tr>
                    <td style="padding: 6px 0; font-weight: bold;">Receiver Name:</td>
                    <td style="padding: 6px 0;">${receiveName}</td>
                  </tr>`
                : ""
            }
          </table>
          <p style="margin-top: 20px; font-size: 14px;">
            Please allow a few business days for the refund to be reviewed. If you have any concerns, feel free to contact our support team.
          </p>
          <p style="margin-top: 30px; font-size: 13px; color: #999;">
            Sent automatically by the website on ${new Date().toLocaleString()}.
          </p>
        </div>
        <div style="background: #1e3d25; padding: 15px 30px; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px; text-align: center;">
          <p style="margin: 0; font-size: 13px; color: #fdfaf6;">Danayas Resort & Events Venue</p>
          <p style="margin: 0; font-size: 12px; color: #ccc;">© ${new Date().getFullYear()} All rights reserved.</p>
        </div>
      </div>
    </div>
  `;

export const bookingConfirmationHtml = ({
  firstName,
  packageName,
  mode,
  checkInDate,
  checkOutDate,
  totalAmount,
}: {
  firstName: string;
  packageName: string;
  mode: string;
  checkInDate: string;
  checkOutDate: string;
  totalAmount: number;
}) => `
    <div style="font-family: Arial, sans-serif; background: #fdfaf6; padding: 20px; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
        <div style="background: #1e3d25; padding: 20px 30px; border-top-left-radius: 8px; border-top-right-radius: 8px;">
          <h2 style="margin: 0; color: #fdfaf6;">Danayas Resort & Events Venue</h2>
          <p style="margin: 5px 0 0; color: #fdfaf6;">Booking Confirmation</p>
        </div>
        <div style="padding: 30px;">
          <p style="font-size: 16px;">Hello ${firstName},</p>
          <p style="font-size: 15px;">Thank you for your booking! Here are your reservation details:</p>
          <table style="width: 100%; margin-top: 20px; font-size: 15px;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Package:</td>
              <td style="padding: 8px 0;">${packageName} (${mode})</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Check-In:</td>
              <td style="padding: 8px 0;">${checkInDate}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Check-Out:</td>
              <td style="padding: 8px 0;">${checkOutDate}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Total Amount:</td>
              <td style="padding: 8px 0;">₱${totalAmount.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Payment Status:</td>
              <td style="padding: 8px 0;">Unpaid</td>
            </tr>
          </table>
          <p style="margin-top: 30px; font-size: 14px;">
            We will contact you soon with further instructions. If you have any questions, feel free to reply to this email.
          </p>
          <p style="margin-top: 10px; font-size: 13px; color: #999;">
            Booking created on ${new Date().toLocaleString()}.
          </p>
        </div>
        <div style="background: #1e3d25; padding: 15px 30px; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px; text-align: center;">
          <p style="margin: 0; font-size: 13px; color: #fdfaf6;">Danayas Resort & Events Venue</p>
          <p style="margin: 0; font-size: 12px; color: #ccc;">© ${new Date().getFullYear()} All rights reserved.</p>
        </div>
      </div>
    </div>
  `;

export const paymentNotificationHtml = ({
  customerName,
  paymentMethod,
  netPaidAmount,
  changeAmount,
}: {
  customerName: string;
  paymentMethod: string;
  netPaidAmount: number;
  changeAmount: number;
}) => `
    <div style="font-family: Arial, sans-serif; background: #fdfaf6; padding: 20px; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
        <div style="background: #1e3d25; padding: 20px 30px; border-top-left-radius: 8px; border-top-right-radius: 8px;">
          <h2 style="margin: 0; color: #fdfaf6;">Danayas Resort & Events Venue</h2>
          <p style="margin: 5px 0 0; color: #fdfaf6;">Payment Notification</p>
        </div>
        <div style="padding: 30px;">
          <p style="font-size: 16px;">Hello ${customerName},</p>
          <p style="font-size: 15px;">
            This is to inform you that a payment has been added to your reservation by our staff.
          </p>
          <table style="width: 100%; margin-top: 20px; font-size: 14px;">
            <tr>
              <td style="padding: 6px 0; font-weight: bold;">Payment Method:</td>
              <td style="padding: 6px 0;">${paymentMethod}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold;">Amount Paid:</td>
              <td style="padding: 6px 0;">₱${netPaidAmount.toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold;">Change Returned:</td>
              <td style="padding: 6px 0;">₱${changeAmount.toFixed(2)}</td>
            </tr>
          </table>
          <p style="margin-top: 20px; font-size: 14px;">Thank you for choosing Danayas Resort. Please keep this record for reference.</p>
          <p style="margin-top: 30px; font-size: 13px; color: #999;">
            Sent automatically by the website on ${new Date().toLocaleString()}.
          </p>
        </div>
        <div style="background: #1e3d25; padding: 15px 30px; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px; text-align: center;">
          <p style="margin: 0; font-size: 13px; color: #fdfaf6;">Danayas Resort & Events Venue</p>
          <p style="margin: 0; font-size: 12px; color: #ccc;">© ${new Date().getFullYear()} All rights reserved.</p>
        </div>
      </div>
    </div>
  `;

export const paymentInvalidHtml = ({
  customerName,
  reason,
}: {
  customerName: string;
  reason: string;
}) => `
    <div style="font-family: Arial, sans-serif; background: #fdfaf6; padding: 20px; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
        <div style="background: #b30000; padding: 20px 30px; border-top-left-radius: 8px; border-top-right-radius: 8px;">
          <h2 style="margin: 0; color: #fff;">Danayas Resort & Events Venue</h2>
          <p style="margin: 5px 0 0; color: #fff;">Payment Rejected</p>
        </div>
        <div style="padding: 30px;">
          <p style="font-size: 16px;">Dear ${customerName},</p>
          <p style="font-size: 15px;">
            Your recent payment has been <strong>marked invalid</strong> by our team.
          </p>
          <p><strong>Reason:</strong> ${reason}</p>
          <p style="margin-top: 20px; font-size: 14px;">Please contact us to resolve this issue or submit a new payment.</p>
          <p style="margin-top: 30px; font-size: 13px; color: #999;">
            Sent automatically by the website on ${new Date().toLocaleString()}.
          </p>
        </div>
        <div style="background: #b30000; padding: 15px 30px; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px; text-align: center;">
          <p style="margin: 0; font-size: 13px; color: #fff;">Danayas Resort & Events Venue</p>
          <p style="margin: 0; font-size: 12px; color: #eee;">© ${new Date().getFullYear()} All rights reserved.</p>
        </div>
      </div>
    </div>
  `;

export const paymentVoidedHtml = ({
  customerName,
  remarks,
}: {
  customerName: string;
  remarks: string;
}) => `
    <div style="font-family: Arial, sans-serif; background: #fdfaf6; padding: 20px; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
        <div style="background: #9e7300; padding: 20px 30px; border-top-left-radius: 8px; border-top-right-radius: 8px;">
          <h2 style="margin: 0; color: #fff;">Danayas Resort & Events Venue</h2>
          <p style="margin: 5px 0 0; color: #fff;">Payment Voided</p>
        </div>
        <div style="padding: 30px;">
          <p style="font-size: 16px;">Hello ${customerName},</p>
          <p style="font-size: 15px;">
            One of your previous payments has been <strong>voided</strong> by our team.
          </p>
          <p><strong>Remarks:</strong> ${remarks}</p>
          <p style="margin-top: 20px; font-size: 14px;">You may resubmit a new payment or contact support for clarification.</p>
          <p style="margin-top: 30px; font-size: 13px; color: #999;">
            Sent automatically by the website on ${new Date().toLocaleString()}.
          </p>
        </div>
        <div style="background: #9e7300; padding: 15px 30px; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px; text-align: center;">
          <p style="margin: 0; font-size: 13px; color: #fff;">Danayas Resort & Events Venue</p>
          <p style="margin: 0; font-size: 12px; color: #eee;">© ${new Date().getFullYear()} All rights reserved.</p>
        </div>
      </div>
    </div>
  `;

export const refundLowAmountHtml = ({
  customerName,
  bookingId,
  refundAmount,
}: {
  customerName: string;
  bookingId: string | number;
  refundAmount: number;
}) => `
    <div style="font-family: Arial, sans-serif; background: #fdfaf6; padding: 20px; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
        <div style="background: #1e3d25; padding: 20px 30px; border-top-left-radius: 8px; border-top-right-radius: 8px;">
          <h2 style="margin: 0; color: #fdfaf6;">Danayas Resort & Events Venue</h2>
          <p style="margin: 5px 0 0; color: #fdfaf6;">Refund Initiated</p>
        </div>
        <div style="padding: 30px;">
          <p style="font-size: 16px;">Hello ${customerName},</p>
          <p style="font-size: 15px;">Your recent payment for booking <strong>#${bookingId}</strong> did not meet our minimum required down payment.</p>
          <p style="font-size: 14px; margin-top: 20px;"><strong>Refund Amount:</strong> ₱${refundAmount.toFixed(2)}</p>
          <p style="margin-top: 20px; font-size: 14px;">We have processed a full refund of your payment. You may retry with the correct amount. Contact us for assistance if needed.</p>
          <p style="margin-top: 30px; font-size: 13px; color: #999;">Sent automatically by the website on ${new Date().toLocaleString()}.</p>
        </div>
        <div style="background: #1e3d25; padding: 15px 30px; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px; text-align: center;">
          <p style="margin: 0; font-size: 13px; color: #fdfaf6;">Danayas Resort & Events Venue</p>
          <p style="margin: 0; font-size: 12px; color: #ccc;">© ${new Date().getFullYear()} All rights reserved.</p>
        </div>
      </div>
    </div>`;

export const refundOverpaymentHtml = ({
  customerName,
  bookingId,
  refundAmount,
}: {
  customerName: string;
  bookingId: string | number;
  refundAmount: number;
}) => `
    <div style="font-family: Arial, sans-serif; background: #fdfaf6; padding: 20px; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
        <div style="background: #1e3d25; padding: 20px 30px; border-top-left-radius: 8px; border-top-right-radius: 8px;">
          <h2 style="margin: 0; color: #fdfaf6;">Danayas Resort & Events Venue</h2>
          <p style="margin: 5px 0 0; color: #fdfaf6;">Refund Initiated</p>
        </div>
        <div style="padding: 30px;">
          <p style="font-size: 16px;">Hello ${customerName},</p>
          <p style="font-size: 15px;">We have processed a refund due to an overpayment for your booking <strong>#${bookingId}</strong>.</p>
          <p style="font-size: 14px; margin-top: 20px;"><strong>Refund Amount:</strong> ₱${refundAmount.toFixed(2)}</p>
          <p style="margin-top: 20px; font-size: 14px;">You will receive the refund via GCash shortly. If you have any questions, please contact our team.</p>
          <p style="margin-top: 30px; font-size: 13px; color: #999;">Sent automatically by the website on ${new Date().toLocaleString()}.</p>
        </div>
        <div style="background: #1e3d25; padding: 15px 30px; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px; text-align: center;">
          <p style="margin: 0; font-size: 13px; color: #fdfaf6;">Danayas Resort & Events Venue</p>
          <p style="margin: 0; font-size: 12px; color: #ccc;">© ${new Date().getFullYear()} All rights reserved.</p>
        </div>
      </div>
    </div>`;

export const refundFailedHtml = ({
  customerName,
  refundAmount,
  reason,
}: {
  customerName: string;
  refundAmount: number;
  reason: string;
}) => `
    <div style="font-family: Arial, sans-serif; background: #fdfaf6; padding: 20px; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
        <div style="background: #1e3d25; padding: 20px 30px; border-top-left-radius: 8px; border-top-right-radius: 8px;">
          <h2 style="margin: 0; color: #fdfaf6;">Danayas Resort & Events Venue</h2>
          <p style="margin: 5px 0 0; color: #fdfaf6;">Refund Failed Notification</p>
        </div>
        <div style="padding: 30px;">
          <p style="font-size: 16px;">Hello ${customerName},</p>
          <p style="font-size: 15px;">We regret to inform you that your refund request for the amount of <strong>₱${refundAmount.toFixed(2)}</strong> could not be processed at this time.</p>
          <p style="font-size: 15px;"><strong>Reason:</strong> ${reason}</p>
          <p style="margin-top: 20px; font-size: 14px;">Please contact our support team for assistance or further clarification.</p>
          <p style="margin-top: 30px; font-size: 13px; color: #999;">Sent automatically by the website on ${new Date().toLocaleString()}.</p>
        </div>
        <div style="background: #1e3d25; padding: 15px 30px; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px; text-align: center;">
          <p style="margin: 0; font-size: 13px; color: #fdfaf6;">Danayas Resort & Events Venue</p>
          <p style="margin: 0; font-size: 12px; color: #ccc;">© ${new Date().getFullYear()} All rights reserved.</p>
        </div>
      </div>
    </div>`;
