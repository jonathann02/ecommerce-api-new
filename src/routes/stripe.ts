import express from "express"
import { createHostedCheckoutSession, stripeWebhook } from "../controllers/stripeController"


export const rawBody = express.raw({ type: "application/json" }); 

const router = express.Router()

router.post("/create-checkout-session-hosted", createHostedCheckoutSession)

router.post("/webhook", rawBody, stripeWebhook)

export default router