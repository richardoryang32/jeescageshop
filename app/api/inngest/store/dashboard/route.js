import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import authSeller from "@/middlewares/authSeller";
import { getAuth } from "@clerk/nextjs/server";

//Get the data for the dashboard for a seller (total orders, total earnings, total products)
export async function GET(request){
    try{
        const {userId}=getAuth(request); // this get the user ID
        //get the store of the user
        const storeId=await authSeller(userId);

        //get all orders for a seller
        const orders=await prisma.order.findMany({
            where:{storeId}
        })

        //get all products with ratings for a seller
        const products=await prisma.product.findMany({
            where:{storeId},
        })
        const ratings=await prisma.rating.findMany({
            where:{product:{in:{id:products.map((product)=>product.id)}}},
            include:{product:true, user:true}
        })

        //providing ratings on the dashboard
        const dashboardData={
            totalOrders:orders.length,
            totalEarnings:Math.round(orders.reduce((total, order)=>total + order.totalPrice, 0)),
            totalProducts:products.length,
            ratings:ratings
        }
        //return the dashboard data
        return NextResponse.json({dashboardData});
    }catch (error){
        console.error(error);
     return NextResponse.json({error:error.code || error.message}, {status:400})
    }
}