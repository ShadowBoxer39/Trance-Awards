// pages/api/merch/submit-order.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { resend, EMAIL_SENDER } from '@/lib/resend';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const NOTIFY_EMAIL = 'tracktripil@gmail.com';

interface OrderItem {
  product: string;
  size: string;
  quantity: number;
  price: number;
}

const createOrderNotificationHTML = (
  name: string,
  phone: string,
  email: string,
  items: OrderItem[],
  deliveryNotes: string,
  totalPrice: number
) => `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a12; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a12; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%;">
          
          <tr>
            <td style="background: linear-gradient(135deg, rgba(234, 179, 8, 0.15) 0%, rgba(249, 115, 22, 0.15) 100%); border-radius: 24px 24px 0 0; padding: 40px 40px 30px; text-align: center; border: 1px solid rgba(234, 179, 8, 0.2); border-bottom: none;">
              <div style="font-size: 48px; margin-bottom: 16px;">🛍️</div>
              <h1 style="color: #ffffff; font-size: 28px; margin: 0 0 8px; font-weight: 700;">
                הזמנת מרצ׳ חדשה!
              </h1>
              <p style="color: rgba(255,255,255,0.6); font-size: 14px; margin: 0;">
                מישהו רוצה מרצ׳ של יוצאים לטראק 🔥
              </p>
            </td>
          </tr>
          
          <tr>
            <td style="background: rgba(255,255,255,0.03); padding: 40px; border: 1px solid rgba(255,255,255,0.1); border-top: none; border-bottom: none;">
              
              <!-- Customer Info -->
              <div style="background: rgba(234, 179, 8, 0.1); border-radius: 16px; padding: 24px; margin-bottom: 24px; border: 1px solid rgba(234, 179, 8, 0.2);">
                <h3 style="color: #eab308; font-size: 16px; margin: 0 0 16px; font-weight: 600;">
                  👤 פרטי הלקוח
                </h3>
                <p style="color: #ffffff; font-size: 16px; margin: 0 0 8px;">
                  <strong>שם:</strong> ${name}
                </p>
                <p style="color: #ffffff; font-size: 16px; margin: 0 0 8px;">
                  <strong>טלפון:</strong> <a href="tel:${phone}" style="color: #eab308;">${phone}</a>
                </p>
                <p style="color: #ffffff; font-size: 16px; margin: 0;">
                  <strong>אימייל:</strong> <a href="mailto:${email}" style="color: #eab308;">${email || 'לא צוין'}</a>
                </p>
              </div>

              <!-- Order Items -->
              <div style="background: rgba(255,255,255,0.05); border-radius: 16px; padding: 24px; margin-bottom: 24px; border: 1px solid rgba(255,255,255,0.1);">
                <h3 style="color: #f97316; font-size: 16px; margin: 0 0 16px; font-weight: 600;">
                  📦 פריטים בהזמנה
                </h3>
                ${items.map(item => `
                  <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <span style="color: #ffffff;">
                      ${item.product === 'tshirt' ? '👕 חולצה' : '🧥 קפוצ׳ון'} - מידה ${item.size} × ${item.quantity}
                    </span>
                    <span style="color: #eab308; font-weight: 600;">₪${item.price * item.quantity}</span>
                  </div>
                `).join('')}
                <div style="display: flex; justify-content: space-between; padding: 16px 0 0;">
                  <span style="color: #ffffff; font-size: 18px; font-weight: 700;">סה״כ</span>
                  <span style="color: #22c55e; font-size: 18px; font-weight: 700;">₪${totalPrice}</span>
                </div>
              </div>

              <!-- Delivery Notes -->
              <div style="background: rgba(139, 92, 246, 0.1); border-radius: 16px; padding: 24px; margin-bottom: 24px; border: 1px solid rgba(139, 92, 246, 0.2);">
                <h3 style="color: #c084fc; font-size: 16px; margin: 0 0 12px; font-weight: 600;">
                  🚚 הערות משלוח
                </h3>
                <p style="color: #cbd5e1; font-size: 14px; line-height: 1.7; margin: 0;">
                  ${deliveryNotes || 'לא צוינו הערות'}
                </p>
              </div>

              <p style="color: #94a3b8; font-size: 14px; line-height: 1.7; margin: 0; text-align: center;">
                צרו קשר עם הלקוח בוואטסאפ לתיאום תשלום ומשלוח 📱
              </p>
            </td>
          </tr>
          
          <tr>
            <td style="background: rgba(0,0,0,0.3); border-radius: 0 0 24px 24px; padding: 30px 40px; text-align: center; border: 1px solid rgba(255,255,255,0.1); border-top: none;">
              <a href="https://wa.me/972${phone.replace(/^0/, '').replace(/[^0-9]/g, '')}" 
                 style="display: inline-block; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: #ffffff; font-size: 16px; font-weight: 700; text-decoration: none; padding: 16px 40px; border-radius: 50px;">
                💬 פתח וואטסאפ עם הלקוח
              </a>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const createCustomerConfirmationHTML = (
  name: string,
  items: OrderItem[],
  totalPrice: number
) => `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a12; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a12; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%;">
          
          <tr>
            <td style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(236, 72, 153, 0.15) 100%); border-radius: 24px 24px 0 0; padding: 40px 40px 30px; text-align: center; border: 1px solid rgba(255,255,255,0.1); border-bottom: none;">
              <div style="font-size: 48px; margin-bottom: 16px;">🛍️</div>
              <h1 style="color: #ffffff; font-size: 28px; margin: 0 0 8px; font-weight: 700;">
                ${name}, ההזמנה התקבלה!
              </h1>
              <p style="color: rgba(255,255,255,0.6); font-size: 14px; margin: 0;">
                תודה שקניתם מרצ׳ של יוצאים לטראק 💜
              </p>
            </td>
          </tr>
          
          <tr>
            <td style="background: rgba(255,255,255,0.03); padding: 40px; border: 1px solid rgba(255,255,255,0.1); border-top: none; border-bottom: none;">
              
              <!-- Order Items -->
              <div style="background: rgba(139, 92, 246, 0.1); border-radius: 16px; padding: 24px; margin-bottom: 24px; border: 1px solid rgba(139, 92, 246, 0.2);">
                <h3 style="color: #c084fc; font-size: 16px; margin: 0 0 16px; font-weight: 600;">
                  📦 הפריטים שלך
                </h3>
                ${items.map(item => `
                  <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <span style="color: #ffffff;">
                      ${item.product === 'tshirt' ? '👕 חולצה' : '🧥 קפוצ׳ון'} - מידה ${item.size} × ${item.quantity}
                    </span>
                    <span style="color: #22c55e; font-weight: 600;">₪${item.price * item.quantity}</span>
                  </div>
                `).join('')}
                <div style="display: flex; justify-content: space-between; padding: 16px 0 0;">
                  <span style="color: #ffffff; font-size: 18px; font-weight: 700;">סה״כ</span>
                  <span style="color: #22c55e; font-size: 18px; font-weight: 700;">₪${totalPrice}</span>
                </div>
              </div>

              <!-- What's Next -->
              <div style="background: rgba(255,255,255,0.05); border-radius: 16px; padding: 24px; margin-bottom: 24px; border: 1px solid rgba(255,255,255,0.1);">
                <h3 style="color: #eab308; font-size: 16px; margin: 0 0 16px; font-weight: 600;">
                  ⏱️ מה עכשיו?
                </h3>
                <ul style="color: #cbd5e1; font-size: 14px; line-height: 2; margin: 0; padding: 0 20px 0 0; list-style: none;">
                  <li style="margin-bottom: 8px;">📱 ניצור איתך קשר בוואטסאפ</li>
                  <li style="margin-bottom: 8px;">💳 נתאם תשלום בביט</li>
                  <li>🚚 נתאם משלוח או איסוף</li>
                </ul>
              </div>
              
              <p style="color: #94a3b8; font-size: 14px; line-height: 1.7; margin: 0; text-align: center;">
                שאלות? פשוט תגיבו למייל הזה או שלחו לנו הודעה באינסטגרם 💜
              </p>
            </td>
          </tr>
          
          <tr>
            <td style="background: rgba(0,0,0,0.3); border-radius: 0 0 24px 24px; padding: 30px 40px; text-align: center; border: 1px solid rgba(255,255,255,0.1); border-top: none;">
              <p style="color: rgba(255,255,255,0.4); font-size: 12px; margin: 0 0 12px;">
                יוצאים לטראק 🎧 הבית של הטראנס הישראלי
              </p>
              <div>
                <a href="https://www.instagram.com/track_trip.trance/" style="color: #c084fc; text-decoration: none; font-size: 12px; margin: 0 8px;">Instagram</a>
                <span style="color: rgba(255,255,255,0.2);">•</span>
                <a href="https://tracktrip.co.il" style="color: #c084fc; text-decoration: none; font-size: 12px; margin: 0 8px;">Website</a>
              </div>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, phone, email, items, deliveryNotes } = req.body;

  // Validate required fields
  if (!name || !phone || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // 1. Verify stock is still available for all items
    for (const item of items) {
      const { data: inventoryItem, error: checkError } = await supabase
        .from('merch_inventory')
        .select('quantity')
        .eq('product', item.product)
        .eq('size', item.size)
        .single();

      if (checkError || !inventoryItem) {
        return res.status(400).json({ error: `מוצר לא נמצא: ${item.product} ${item.size}` });
      }

      if (inventoryItem.quantity < item.quantity) {
        return res.status(400).json({ 
          error: `אין מספיק מלאי: ${item.product === 'tshirt' ? 'חולצה' : 'קפוצ׳ון'} מידה ${item.size} (נשארו ${inventoryItem.quantity})` 
        });
      }
    }

    // 2. Decrement inventory for each item
    for (const item of items) {
      const { error: updateError } = await supabase.rpc('decrement_merch_inventory', {
        p_product: item.product,
        p_size: item.size,
        p_quantity: item.quantity
      });

      // Fallback if RPC doesn't exist - use direct update
      if (updateError && updateError.message.includes('function')) {
        const { data: current } = await supabase
          .from('merch_inventory')
          .select('quantity')
          .eq('product', item.product)
          .eq('size', item.size)
          .single();

        if (current) {
          await supabase
            .from('merch_inventory')
            .update({ quantity: current.quantity - item.quantity })
            .eq('product', item.product)
            .eq('size', item.size);
        }
      }
    }

    // 3. Calculate total price
    const totalPrice = items.reduce((sum: number, item: OrderItem) => sum + (item.price * item.quantity), 0);

    // 4. Save order to database
    const { data: order, error: orderError } = await supabase
      .from('merch_orders')
      .insert({
        name,
        phone,
        email: email || null,
        items,
        delivery_notes: deliveryNotes || null,
        status: 'pending'
      })
      .select()
      .single();

    if (orderError) {
      console.error('❌ Order save error:', orderError);
      // Don't fail the whole request if order save fails
    }

   // 5. Send email notification to admin
try {
  await resend.emails.send({
    from: EMAIL_SENDER,
    to: [NOTIFY_EMAIL],
    subject: `🛍️ הזמנת מרצ׳ חדשה מ-${name}!`,
    html: createOrderNotificationHTML(name, phone, email, items, deliveryNotes, totalPrice),
  });
  console.log('✅ Order notification email sent');
} catch (emailError: any) {
  console.error('❌ Admin email send error:', emailError);
}

// 6. Send confirmation email to customer (if email provided)
if (email) {
  try {
    await resend.emails.send({
      from: EMAIL_SENDER,
      to: [email],
      subject: `🛍️ ההזמנה שלך התקבלה!`,
      html: createCustomerConfirmationHTML(name, items, totalPrice),
    });
    console.log('✅ Customer confirmation email sent');
  } catch (emailError: any) {
    console.error('❌ Customer email send error:', emailError);
  }
}

return res.status(200).json({ 
      success: true, 
      orderId: order?.id,
      message: 'ההזמנה התקבלה בהצלחה!' 
    });

  } catch (error: any) {
    console.error('❌ Order submission error:', error);
    return res.status(500).json({ error: 'שגיאה בשליחת ההזמנה' });
  }
}