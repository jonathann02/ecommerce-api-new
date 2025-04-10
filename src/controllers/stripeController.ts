import { Request, Response } from "express"
import { db } from "../config/db"

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)

export const createHostedCheckoutSession = async (req: Request, res: Response) => {
    try {
        const { order_id, line_items } = req.body

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"], 
            line_items, 
            mode: "payment",
            success_url: 'https://ecommerce-website-phi-lilac.vercel.app/#/order-confirmation?session_id={CHECKOUT_SESSION_ID}',
            cancel_url: 'https://ecommerce-website-phi-lilac.vercel.app/#/cart',
            client_reference_id: order_id?.toString(), 
        })

        await db.query("UPDATE orders SET payment_id=?, payment_status='Unpaid' WHERE id=?", [session.id, order_id])

        res.json({
            checkout_url: session.url, 
            session_id: session.id
        })
    } catch(error: any) {
        console.error("stripe error =>", error)
        res.status(500).json({ error: error.message })
    }
    }

    export const stripeWebhook = async (req: Request, res: Response) => {
        try {
            const event = req.body; 

            switch (event.type) {
                case "checkout.session.completed": {
                    const session = event.data.object; 
                    const sessionId = session.id; 

                    const sql = `UPDATE orders SET payment_status='Paid', order_status='Received' WHERE payment_id=?`; 
                    await db.query(sql, [sessionId]); 
                    break; 
                }
    
            }
            res.json({ received: true }); 
        } catch (error: any) {
            res.status(400).send(`Webhook Error: ${error.message}`)
        }
        }
