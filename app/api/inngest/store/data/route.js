import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";

//Get a store info and Seller Info

export async function GET(request){
    try{
        const {searchParams}=new URL(request.url);
        const username=searchParams.get('username').toLowerCase();
        //if there is no username, return error
        if(!username){
            return NextResponse.json({error:'username is required'}, {status:400});
        }

        //getstore info and inStock products with seller info
        const store=await prisma.store.findFirst({
            where:{username,isActive:true},
            include:{Product:{include:{rating:true}}}
        })

        //Suppose there is no store found
        if(!store){
            return NextResponse.json({error:'store not found'}, {status:404});
        }
        //if a store os found, return the store info
        return NextResponse.json({store});
    }catch (error){
        console.error(error);
     return NextResponse.json({error:error.code || error.message}, {status:400})
    }
}