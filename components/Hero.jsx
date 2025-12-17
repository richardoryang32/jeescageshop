'use client'
import { assets } from '@/assets/assets'
import { ArrowRightIcon, ChevronRightIcon } from 'lucide-react'
import Image from 'next/image'
import React from 'react'
import CategoriesMarquee from './CategoriesMarquee'


const Hero = () => {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || 'GHS'

    return (
        <div className='mx-6'>
            <div className='flex max-xl:flex-col gap-8 max-w-7xl mx-auto my-10'>
                <div className='relative flex-1 flex flex-col bg-[#2BB7DA] rounded-3xl xl:min-h-100 overflow-hidden group'>
                    <div className='p-5 sm:p-16'>
                            <div className='inline-flex items-center gap-3 bg-white/10 text-white pr-4 p-1 rounded-full text-xs sm:text-sm'>
                                <span className='bg-white px-3 py-1 max-sm:ml-1 rounded-full text-[#2BB7DA] text-xs'>NEWS</span>
                                <span className='ml-1'>Free Shipping on Orders Above GHS500!</span>
                                <ChevronRightIcon className='group-hover:ml-2 transition-all text-white' size={16} />
                            </div>
                        <h2 className='text-3xl sm:text-5xl leading-[1.2] my-3 font-medium bg-gradient-to-r from-white to-slate-100 bg-clip-text text-transparent max-w-xs  sm:max-w-md'>
                            Products you'll love. Prices you'll trust.
                        </h2>
                        <div className='text-white text-sm font-medium mt-4 sm:mt-8'>
                            <p>Starts from</p>
                            <p className='text-3xl text-white font-semibold'>{currency}49.99</p>
                        </div>
                        <button className='bg-slate-800 text-white text-sm py-2.5 px-7 sm:py-5 sm:px-12 mt-4 sm:mt-10 rounded-md hover:bg-slate-900 hover:scale-103 active:scale-95 transition'>LEARN MORE</button>
                    </div>
                    <Image className='sm:absolute bottom-0 right-0 md:right-10 w-full sm:max-w-sm' src={assets.hero_model_img1} alt="Hero model 1" />
                </div>
                <div className='flex flex-col md:flex-row xl:flex-col gap-5 w-full xl:max-w-sm text-sm text-slate-600'>
                    <div className='flex-1 flex items-stretch justify-between w-full bg-blue-100 shadow-sm rounded-3xl p-6 px-8 group'>
                        <div className='flex flex-col justify-center'>
                            <p className='text-3xl font-medium text-slate-800 max-w-40'>Best products</p>
                            <p className='flex items-center gap-1 mt-4 text-slate-700'>View more <ArrowRightIcon className='group-hover:ml-2 transition-all text-slate-700' size={18} /> </p>
                        </div>
                        <Image className='w-28 sm:w-40 md:w-48 lg:w-56 object-contain h-full' src={assets.hero1} alt="Featured product 1" />
                    </div>
                    <div className='flex-1 flex items-stretch justify-between w-full bg-blue-500 shadow-sm rounded-3xl p-6 px-8 group'>
                        <div className='flex flex-col justify-center'>
                            <p className='text-3xl font-medium text-white max-w-40'>20% discounts</p>
                            <p className='flex items-center gap-1 mt-4 text-white'>View more <ArrowRightIcon className='group-hover:ml-2 transition-all text-white' size={18} /> </p>
                        </div>
                        <Image className='w-28 sm:w-40 md:w-48 lg:w-56 object-contain h-full' src={assets.hero2} alt="Featured product 2" />
                    </div>
                </div>
            </div>
            <CategoriesMarquee />
        </div>

    )
}

export default Hero