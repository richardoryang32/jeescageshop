import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import authSeller from "@/middlewares/authSeller";
import { getAuth } from "@clerk/nextjs/server";


//toggle stock of a product
export async function POST(request){
    try{
        const {userId}=getAuth(request);
        const {productId}=await request.json();    
        //get the store of the user
        if(!productId){
            return NextResponse.json({error:'missing product id'}, {status:400});
        }

        //get the store from the database
        const storeId=await authSeller(userId);

        //if there is no store, return error
        if(!storeId){
            return NextResponse.json({error:'you are not authorized to perform this action'}, {status:401});
        }

        //check if  product exists
        const product=await prisma.product.findFirst({
            where:{id:productId, storeId}
        })
        //if we find no product in the store
        if(!product){
            return NextResponse.json({error:'product not found'}, {status:404});
        }

        //if the product is found, toggle the stock
        await prisma.product.update({
            where:{id:productId},
            data:{inStock:!product.inStock}
        })

        //lets return a success response
        return NextResponse.json({message:'product stock updated successfully'});

    }catch(error){
        console.error(error);
        return NextResponse.json({error:'internal server error'}, {status:500});
    }
}