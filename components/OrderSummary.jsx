import { PlusIcon, SquarePenIcon, XIcon } from 'lucide-react';
import React, { useState } from 'react'
import AddressModal from './AddressModal';
import { useDispatch,useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useAuth,useUser } from '@clerk/nextjs';
const OrderSummary = ({ totalPrice, items }) => {
    const {user}=useUser();
    const {getToken}=useAuth();
    const dispatch = useDispatch();
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || 'GHS';

    const router = useRouter();

    const addressList = useSelector(state => state.address.list);

    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [couponCodeInput, setCouponCodeInput] = useState('');
    const [coupon, setCoupon] = useState('');

    const handleCouponCode = async (event) => {
        event.preventDefault();
        //let's handle the API call
        try{
          //authenticate the user
          //when the user is not logged in
          if(!user){
            toast.error("You need to be logged in to apply a coupon")
            return;
          }
          //suppose the user is logged in
          const token = await getToken();
          const {data} = await axios.post('/api/coupon', {code: couponCodeInput}, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          setCoupon(data.coupon);
          toast.success("Coupon applied successfully")
        }catch(error){
            toast.error(error?.response?.data?.message || "Something went wrong while applying coupon")
        }
        
    }

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        try{
            //when the user is not logged in
            if(!user){
                toast.error("You need to be logged in to place an order")
                return;
              }
              //when no address is selected
              if(!selectedAddress){
                toast.error("Please select an address to place order")
                return;
              }
              //suppose the user is available and address is selected
              const token = await getToken();
              const orderData = {
                items,
                totalPrice: coupon ? (totalPrice + 5 - (coupon.discount / 100 * totalPrice)) : (totalPrice + 5),
                paymentMethod,
                addressId: selectedAddress.id,
                coupon: coupon ? coupon.code : null
              };
              //if the coupon is applied, include it in the order data
              if(coupon){
                orderData.coupon = coupon.code;
              }
              //make the API call to place order
              const {data} =
              await axios.post('/api/orders', orderData, {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              });
              //payment handling can be done here based on payment method
              if(paymentMethod === 'STRIPE'){
                window.location.href = data.sessionUrl;
                return;
              }else{
                //for COD, we can directly show success message
                toast.success("Order placed successfully with Cash on Delivery");
                 router.push('/orders')
                 dispatch(fetchCart({getToken}));
              }
        }catch(error){
            toast.error(error?.response?.data?.message || "Something went wrong while placing order")
            return;
        }
       
    }

    return (
        <div className='w-full max-w-lg lg:max-w-[340px] bg-slate-50/30 border border-slate-200 text-slate-500 text-sm rounded-xl p-7'>
            <h2 className='text-xl font-medium text-slate-600'>Payment Summary</h2>
            <p className='text-slate-400 text-xs my-4'>Payment Method</p>
            <div className='flex gap-2 items-center'>
                <input type="radio" id="COD" onChange={() => setPaymentMethod('COD')} checked={paymentMethod === 'COD'} className='accent-gray-500' />
                <label htmlFor="COD" className='cursor-pointer'>COD</label>
            </div>
            <div className='flex gap-2 items-center mt-1'>
                <input type="radio" id="STRIPE" name='payment' onChange={() => setPaymentMethod('STRIPE')} checked={paymentMethod === 'STRIPE'} className='accent-gray-500' />
                <label htmlFor="STRIPE" className='cursor-pointer'>Stripe Payment</label>
            </div>
            <div className='my-4 py-4 border-y border-slate-200 text-slate-400'>
                <p>Address</p>
                {
                    selectedAddress ? (
                        <div className='flex gap-2 items-center'>
                            <p>{selectedAddress.name}, {selectedAddress.city}, {selectedAddress.state}, {selectedAddress.zip}</p>
                            <SquarePenIcon onClick={() => setSelectedAddress(null)} className='cursor-pointer' size={18} />
                        </div>
                    ) : (
                        <div>
                            {
                                addressList.length > 0 && (
                                    <select className='border border-slate-400 p-2 w-full my-3 outline-none rounded' onChange={(e) => setSelectedAddress(addressList[e.target.value])} >
                                        <option value="">Select Address</option>
                                        {
                                            addressList.map((address, index) => (
                                                <option key={index} value={index}>{address.name}, {address.city}, {address.state}, {address.zip}</option>
                                            ))
                                        }
                                    </select>
                                )
                            }
                            <button className='flex items-center gap-1 text-slate-600 mt-1' onClick={() => setShowAddressModal(true)} >Add Address <PlusIcon size={18} /></button>
                        </div>
                    )
                }
            </div>
            <div className='pb-4 border-b border-slate-200'>
                <div className='flex justify-between'>
                    <div className='flex flex-col gap-1 text-slate-400'>
                        <p>Subtotal:</p>
                        <p>Shipping:</p>
                        {coupon && <p>Coupon:</p>}
                    </div>
                    <div className='flex flex-col gap-1 font-medium text-right'>
                        <p>{currency}{totalPrice.toLocaleString()}</p>
                        <p>
                            <protect plan="plus" fallback={`{currency}5.00`}>
                            Free
                            </protect>
                            </p>
                        {coupon && <p>{`-${currency}${(coupon.discount / 100 * totalPrice).toFixed(2)}`}</p>}
                    </div>
                </div>
                {
                    !coupon ? (
                        <form onSubmit={e => toast.promise(handleCouponCode(e), { loading: 'Checking Coupon...' })} className='flex justify-center gap-3 mt-3'>
                            <input onChange={(e) => setCouponCodeInput(e.target.value)} value={couponCodeInput} type="text" placeholder='Coupon Code' className='border border-slate-400 p-1.5 rounded w-full outline-none' />
                            <button className='bg-slate-600 text-white px-3 rounded hover:bg-slate-800 active:scale-95 transition-all'>Apply</button>
                        </form>
                    ) : (
                        <div className='w-full flex items-center justify-center gap-2 text-xs mt-2'>
                            <p>Code: <span className='font-semibold ml-1'>{coupon.code.toUpperCase()}</span></p>
                            <p>{coupon.description}</p>
                            <XIcon size={18} onClick={() => setCoupon('')} className='hover:text-red-700 transition cursor-pointer' />
                        </div>
                    )
                }
            </div>
            <div className='flex justify-between py-4'>
                <p>Total:</p>
                <p className='font-medium text-right'>
                    <protect plan="plus" fallback={`${currency}${coupon ? (totalPrice + 5 - (coupon.discount / 100 *
                         totalPrice)).toFixed(2) : (totalPrice).toLocaleString()}`}>
                      {currency}{coupon ? (totalPrice + 5 - (coupon.discount / 100 *
                         totalPrice)).toFixed(2) : totalPrice.toLocaleString()}
                    </protect>
                         </p>
            </div>
            <button onClick={e => toast.promise(handlePlaceOrder(e), { loading: 'placing Order...' })} className='w-full bg-slate-700 text-white py-2.5 rounded hover:bg-slate-900 active:scale-95 transition-all'>Place Order</button>

            {showAddressModal && <AddressModal setShowAddressModal={setShowAddressModal} />}

        </div>
    )
}

export default OrderSummary