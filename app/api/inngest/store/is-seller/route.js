import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import authSeller from "@/middlewares/authSeller";
import { getAuth } from "@clerk/nextjs/server";

//checking to see if the logged in user is a seller

export async function GET(request){
    try{
        const {userId}=getAuth(request); // this get the user ID
        const isSeller = await authSeller(userId);

        //if the user is not a seller
        if(!isSeller){
            return NextResponse.json({error:'you are not a seller'}, {status:401});
        }

        //if the user is a seller, return success
        const storeInfo =await prisma.store.findUnique({
            where:{userId}})
            //returning the store response
            return NextResponse.json({isSeller, storeInfo});
    }catch (error){
        console.error(error);
     return NextResponse.json({error:error.code || error.message}, {status:400})
    }
}