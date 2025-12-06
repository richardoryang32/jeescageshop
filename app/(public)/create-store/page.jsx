"use client";

import { assets } from "@/assets/assets"
import { useEffect, useState } from "react"
import Image from "next/image"
import toast from "react-hot-toast"
import Loading from "@/components/Loading"
import { useRouter } from "next/navigation"
import { useUser, useAuth } from "@clerk/nextjs"
import axios from "axios"

export default function CreateStore() {

    const router = useRouter();
    const { user } = useUser();
    const { getToken } = useAuth();

    const [alreadySubmitted, setAlreadySubmitted] = useState(false);
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    const [storeInfo, setStoreInfo] = useState({
        name: "",
        username: "",
        description: "",
        email: "",
        contact: "",
        address: "",
        image: ""
    });

    const onChangeHandler = (e) => {
        setStoreInfo({ ...storeInfo, [e.target.name]: e.target.value });
    };

    const fetchSellerStatus = async () => {
        const token = await getToken();
        try {
            const { data } = await axios.get('/api/store/create', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (["pending", "approved", "rejected"].includes(data.status)) {
                setAlreadySubmitted(true);
                setStatus(data.status);

                switch (data.status) {
                    case "approved":
                        setMessage("Your store has been approved! Redirecting...");
                        setTimeout(() => router.push('/store'), 5000);
                        break;

                    case "pending":
                        setMessage("Your store application is under review.");
                        break;

                    case "rejected":
                        setMessage("Your application was rejected.");
                        break;
                }
            } else {
                setAlreadySubmitted(false);
            }

        } catch (error) {
            toast.error(error.response?.data?.error || error.message);
        }

        setLoading(false);
    };

    const onSubmitHandler = async (e) => {
        e.preventDefault();

        if (!user) return toast.error("You must be logged in.");

        try {
            const token = await getToken();
            const formData = new FormData();

            Object.entries(storeInfo).forEach(([k, v]) => {
                formData.append(k, v);
            });

            const { data } = await axios.post("/api/store/create", formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success(data.message);
            await fetchSellerStatus();
        } catch (error) {
            toast.error(error.response?.data?.error || error.message);
        }
    };

    useEffect(() => {
        if (user) fetchSellerStatus();
    }, [user]);


    if (!user)
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <h1 className="text-2xl text-slate-500">You must be logged in to create a store.</h1>
            </div>
        );

    return !loading ? (
        <>
            {!alreadySubmitted ? (
                <div className="mx-6 min-h-[70vh] my-16">
                    <form
                        onSubmit={(e) => toast.promise(onSubmitHandler(e), { loading: "Submitting..." })}
                        className="max-w-7xl mx-auto flex flex-col gap-3 text-slate-500">

                        <label className="mt-10 cursor-pointer">
                            Store Logo
                            <Image
                                src={storeInfo.image ? URL.createObjectURL(storeInfo.image) : assets.upload_area}
                                className="rounded-lg mt-2 h-16 w-auto"
                                alt={storeInfo.image ? 'Store logo preview' : 'Upload placeholder'}
                                width={150}
                                height={100}
                            />
                            <input
                                type="file"
                                accept="image/*"
                                hidden
                                onChange={(e) =>
                                    setStoreInfo({ ...storeInfo, image: e.target.files[0] })
                                }
                            />
                        </label>

                        <p>Username</p>
                        <input name="username" value={storeInfo.username}
                               onChange={onChangeHandler} className="input" />

                        <p>Name</p>
                        <input name="name" value={storeInfo.name}
                               onChange={onChangeHandler} className="input" />

                        <p>Description</p>
                        <textarea name="description" value={storeInfo.description}
                                  onChange={onChangeHandler} rows={5} className="input" />

                        <p>Email</p>
                        <input name="email" value={storeInfo.email}
                               onChange={onChangeHandler} className="input" />

                        <p>Contact</p>
                        <input name="contact" value={storeInfo.contact}
                               onChange={onChangeHandler} className="input" />

                        <p>Address</p>
                        <textarea name="address" value={storeInfo.address}
                                  onChange={onChangeHandler} rows={5} className="input" />

                        <button className="bg-slate-800 text-white px-12 py-2 rounded mt-10">
                            Submit
                        </button>
                    </form>
                </div>
            ) : (
                <div className="min-h-[80vh] flex flex-col items-center justify-center">
                    <p className="text-2xl text-slate-500 text-center">{message}</p>
                </div>
            )}
        </>
    ) : <Loading />;
}
