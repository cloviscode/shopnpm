import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { orderData, userEmail, userName, paymentMethod } = await req.json()

    // Email content for admin notification
    const adminEmailContent = `
      <h2>New Order Received - #${orderData.id}</h2>
      
      <h3>Customer Information:</h3>
      <p><strong>Name:</strong> ${userName}</p>
      <p><strong>Email:</strong> ${userEmail}</p>
      
      <h3>Order Details:</h3>
      <p><strong>Order ID:</strong> ${orderData.id}</p>
      <p><strong>Payment Method:</strong> ${paymentMethod}</p>
      <p><strong>Total Amount:</strong> $${orderData.total}</p>
      <p><strong>Status:</strong> ${orderData.status}</p>
      
      <h3>Shipping Address:</h3>
      <p>${orderData.shipping_address.street}</p>
      <p>${orderData.shipping_address.city}, ${orderData.shipping_address.state} ${orderData.shipping_address.zip_code}</p>
      <p>${orderData.shipping_address.country}</p>
      
      <h3>Next Steps:</h3>
      <p>Please contact the customer at ${userEmail} with payment instructions for ${paymentMethod}.</p>
      
      <p>Login to your admin panel to view full order details and manage the order status.</p>
    `

    // Email content for customer confirmation
    const customerEmailContent = `
      <h2>Order Confirmation - #${orderData.id}</h2>
      
      <p>Dear ${userName},</p>
      
      <p>Thank you for your order! We have received your order and will process it shortly.</p>
      
      <h3>Order Details:</h3>
      <p><strong>Order ID:</strong> ${orderData.id}</p>
      <p><strong>Payment Method:</strong> ${paymentMethod}</p>
      <p><strong>Total Amount:</strong> $${orderData.total}</p>
      
      <h3>What's Next?</h3>
      <p>Our team will contact you within 24 hours with payment instructions for your selected payment method: <strong>${paymentMethod}</strong>.</p>
      
      <p>You can track your order status by logging into your account on our website.</p>
      
      <p>Thank you for choosing EliteShop!</p>
      
      <p>Best regards,<br>The EliteShop Team</p>
    `

    // In a real implementation, you would send emails here using a service like:
    // - Resend
    // - SendGrid
    // - AWS SES
    // - Nodemailer with SMTP
    
    // For demo purposes, we'll just log the email content
    console.log('Admin Email:', adminEmailContent)
    console.log('Customer Email:', customerEmailContent)

    // Simulate email sending
    const emailResults = {
      adminEmail: {
        success: true,
        messageId: `admin-${Date.now()}`,
        to: 'admin@eliteshop.com'
      },
      customerEmail: {
        success: true,
        messageId: `customer-${Date.now()}`,
        to: userEmail
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Order notifications sent successfully',
        results: emailResults
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})