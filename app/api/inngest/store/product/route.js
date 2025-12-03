import {getAuth} from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import imagekit from '@/configs/imageKit';
import { prisma } from '@/lib/prisma';
import authSeller from '@/middlewares/authSeller';

//create a new product
export async function POST(request){
    try{
        const {userId}=getAuth(request);    
        //get the store of the user
        const storeId=await authSeller(userId);

        //if there is no store, return error
        if(!storeId){
            return NextResponse.json({error:'you are not authorized to perform this action'}, {status:401});
        }
        //Get the data from the form
        const formData=await request.formData();
        const name=formData.get('name');
        const description=formData.get('description');
        const price=Number(formData.get('price'));
        const category=formData.get('category');
        const mrp=Number(formData.get('mrp'));
        const images=formData.getAll('images');

        //if it is not of any of the following, then return a status
        if(!name || !description || !price || !category || !mrp || images.length<1){
            return NextResponse.json({error:'missing a products details'}, {status:400});
        }

        //uploading images to imagekit
        const imagesUrl= await Promise.all(images.map(async (image)=>{
            const buffer = Buffer.from(await image.arrayBuffer());
            const response=await imagekit.upload({
                file:buffer,
                fileName:image.name,
                folder:'products',

    })
     //upload and transform the image
     const url = imagekit.url({
        path: response.filePath,
        transformation: [
            { quality: 'auto' },
            { format: 'webp' },
            {width: '1024'}
        ]
     })
     //let's return the url
     return url;
}))
//adding the products in the database
await prisma.product.create({
    data:{
        name,
        description,
        price,
        category,
        mrp,
        images:imagesUrl,
        storeId
        }
    })
    //returning a response on a product added successfully
    return NextResponse.json({message:'product added successfully'});
}
    catch(error){
        console.error(error);
        return NextResponse.json({error:error.code || error.message}, {status:400});
    }
}

//Get All Products for a seller
export async function GET(request){
    try{
      const {userId}=getAuth(request);    
        //get the store of the user
        const storeId=await authSeller(userId);

        //if there is no store, return error
        if(!storeId){
            return NextResponse.json({error:'you are not authorized to perform this action'}, {status:401});
        }
        //fetch all products for a seller from prisma
        const products=await prisma.product.findMany({
            where:{storeId},
        })
        return NextResponse.json({products});
    }catch(error){
        console.error(error);
        return NextResponse.json({error:error.code || error.message}, {status:400});
    } 
}