import {getAuth} from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

//create the store function
export async function POST(request){
    try{
      const {userId}=getAuth(request);
      // get the data from the form

      const formData=await request.formData()
        const name=formData.get('name');
      const username=formData.get('username');
      const description=formData.get('description');
      const email=formData.get('email');
      const contacts=formData.get('contacts');
      const image=formData.get('image');

      //if it is not any of the following fields, return error
      if(!name || !username || !description || !email || !contacts || !image){
        return NextResponse.json({error:'missing a store info'}, {status:400});
      }

      // check if a user has already created a store
      const store=await prisma.store.findFirst({
        where:{
          userId:userId
        }
      })

      //if the store is already created, then send a status for the store
      if(store){
        return NextResponse.json({store:store.status});
      }

      // che k if username is already taken
      const isUsernameTaken=await prisma.store.findFirst({
        where:{
          username:username.tolowerCase()
        }
      })

        if(isUsernameTaken){
            return NextResponse.json({error:'username is already taken'}, {status:400});
        }

        //image upload to imagekit
        const buffer =buffer.from(await image.arrayBuffer());
        const Response=await imagekit.upload({
            file:image,
            fileName:image.name,
            folder:'logos'
        })

        //optimize the image url
        const optimizeImage=imagekit.url({
            path: response.filePath,
            transformation:[
                {quality:'auto'},
                {format:'webp'},
                {height:200},
                {width:200}
            ]
        })

        //storing the url in a database
        const newStore=await prisma.store.create({
            data:{
                userId, 
                name, 
                username:username.toLowerCase(), 
                description, 
                email,
                 contacts,
                 address,
                 logo:optimizeImage
            }
        })

        //link a store to a user
        await prisma.user.update({
            where:{
                id:userId
            },
            data:{
                store: {connect:{id:newStore.id}}
            }
        })

        //return a response
        return NextResponse.json({message:'applied, waiting for approval'});
    }catch (error){
     console.error(error);
     return NextResponse.json({error:error.code || error.message}, {status:400});
    }
}

//check if a user has already registered for a store if yes then send a status of store

export async function GET(request){
    try{
        const {userId}=getAuth(request); // this get the user ID
         // check if a user has already created a store
      const store=await prisma.store.findFirst({
        where:{
          userId:userId
        }
      })

      //if the store is already created, then send a status for the store
      if(store){
        return NextResponse.json({store:store.status});
      }
      //returning a status for an unregistered store
      return NextResponse.json({status:'unregistered'});
    }catch (error){
        console.error(error);
     return NextResponse.json({error:error.code || error.message}, {status:400})
    }
}