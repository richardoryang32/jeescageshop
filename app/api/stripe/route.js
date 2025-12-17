import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import Stripe from "stripe";


const stripe=new Stripe(process.env.STRIPE_SECRETE_KEY)

//create stripe function

export async function POST(request){
    try {
        const body = await request.text()
        const sig =request.headers.get('Stripe-signature')

        //create stripe  event
        const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRETE)

        //use a switch case to access the subscribed cancelled and successful event
        const handlePaymentIntent = async(paymentIntentId, isPaid)=>{
            //adding session
            const session = await stripe.checkout.session.list({
                payment_intent: paymentIntentId
            })
            const {orderIds, userId,appId}=session.data[0].metadata

            //let's check the appId
             if(appId !=='jeeshop'){
            return NextResponse.json({
                received:true, message: 'Invalid app id'
            })
        }
        //suppose it is the right appIa
             const orderIdsArray = orderIds.split(',')
             //if is paid
             if(isPaid){
                //mark order as paid
                await Promise.all(orderIdsArray.map(async (orderId)=>
                await prisma.order.update({
                    where:{id: orderId},
                    data:{isPaid:true}
                })
                ))
                //delete cart from user
                await prisma.usr.update({
                    where:{id:userId},
                    data:{cart : {}}
                })
             }else{
                //delete order from database
                await Promise.all(orderIdsArray.map(async(orderId)=>{
                    await prisma.order.delete({
                        where:{id:orderId}
                    })
                }))
             }

        }
        
       

        switch (event.type){
            case 'payment_intent.succeeded':{
                await handlePaymentIntent(event.data.object.id, true)
                break;
            }
              case 'payment_intent.cancelled':{
                await handlePaymentIntent(event.data.object.id, false)
                break;
            }

            default:
                console.log('Unhandled Event type', event.type)
                break;
        }
        return NextResponse.json({received:true})
    } catch (error) {
        console.error(error)
        return NextResponse.json({error:error.message},{status:400})
    }
}

//configuration of api
// Removed deprecated Next.js API config; Next.js App Router handles body parsing.